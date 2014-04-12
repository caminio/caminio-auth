/*
 * camin.io
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */
module.exports = UserModel;


/**
 * The user class is the main user object
 * for any operations in caminio
 *
 * @class User
 */
function UserModel( caminio, mongoose ){
  
  var crypto      = require('crypto');
  var ObjectId    = mongoose.Schema.Types.ObjectId;
  var Mixed       = mongoose.Schema.Types.Mixed;
  var caminioUtil = require('caminio/util');

  //var MessageSchema = require('./_schemas/message.schema.js')( caminio, mongoose );

  /**
   *
   * @constructor
   *
   **/
  var schema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    encryptedPassword: String,
    salt: {type: String},
    preferences: { type: Mixed, default: {} },
    apiEnabled: { type: Boolean, default: false, public: true },
    //messages: [ MessageSchema ],
    lang: { type: String, default: 'en' },
    email: { type: String, 
             lowercase: true,
             required: true,
             index: { unique: true },
             validate: [EmailValidator, 'invalid_email_address'] 
    },
    groups: [ { type: ObjectId, ref: 'Group' } ],
    camDomains: [ { type: ObjectId, ref: 'Domain' } ],
    confirmation: {
      key: String,
      expires: Date,
      tries: Number
    },
    role: { type: Number, default: 100 },
    lastLoginAt: Date,
    lastLoginIp: String,
    lastRequestAt: Date,
    lastRequestIp: String,
    lastRequestAgetn: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: ObjectId, ref: 'User' },
    lockedAt: { type: Date },
    lockedBy: { type: ObjectId, ref: 'User' },
    description: String,
    billingInformation: {
      address: {
        street: String,
        zip: String,
        city: String,
        state: String,
        country: String,
        salutation: String,
        academicalTitle: String
      },
      email: { type: String, 
               lowercase: true,
               match: /@/ },
    },
    phone: {
      type: String,
      match: /^[\d]*$/
    }
  });

  /**
   * name.full virtual
   *
   * constructs a string which is definitely not null
   * and represents a (not unique) name of this user
   *
   * @method name.full
   * @return {String} full name of the user
   *
   * @example
   *
   *    user.name.full
   *    > Henry King
   *
   **/
  schema.virtual('fullname')
    .get( getUserFullName )
    .set( function( name ){
      if( name.split(' ') ){
        this.name.first = name.split(' ')[0];
        this.name.last = name.split(' ')[1];
      } else
        this.name.first = name;
    });

  /**
   *
   * set password for this user
   *
   * the password will be available for the rest of this 
   * instance's live-time. Only the encrytped version in 
   * property encryptedPassword will be stored to the db
   *
   * @method password
   * @param {String} password
   *
   * @example
   *  
   *     user.password('test');
   *
  **/
  schema.virtual('password')
    .set(function( password ) {
      this._password = password;
      this.salt = this.generateSalt();
      this.encryptedPassword = this.encryptPassword(password);
    })
    .get(function() { 
      return this._password; 
    });

  /**
  authenticate user

  compares encrytped password with given plain text password

    @method authenticate
    @param {String} plainTextPassword the plain text password which
  will be hase-compared against the original password saved to
  the database
  **/
  schema.method('authenticate', function(plainTextPassword) {
    return this.encryptPassword(plainTextPassword) === this.encryptedPassword;
  });

  /**
   * generate a new confirmation key
   *
   * @method generateConfirmationKey
   */
  schema.method('generateConfirmationKey', _generateConfirmationKey);

  schema.pre('save', function( next ){ 
    if( !this.confirmation.expires || this.confirmation.expires < (new Date() - 1200) )
      this.generateConfirmationKey(); 
    next();
  });

  function _generateConfirmationKey(){
    this.confirmation.key = caminioUtil.uid(8);
    this.confirmation.expires = new Date()+1800*1000;
    this.confirmation.tries = this.confirmation.tries || 0;
    this.confirmation.tries += 1;
  }

  /**
   * returns if password meets requirements
   *
   * @method User.checkPassword
   *
   */
  schema.static('checkPassword', checkPassword);

  /**
   * triggers class function to keep backward compatibility
   * @method checkPassword
   */
  schema.method( 'checkPassword', checkPassword );

  /**
  generate salt

  generate the password salt

    @method generateSalt
    @private
  **/
  schema.method('generateSalt', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  /**

  encrypt password

    @param {String} password - clear text password string
  to be encrypted
  **/
  schema.method('encryptPassword', function(password) {
    return crypto.createHmac('sha256WithRSAEncryption', this.salt).update(password).digest('hex');
  });

  /**

  Reads domain, superuser attribute or role number
  If role number is less than equal 5, user is admin

    @method isAdmin
    @param {Domain|Group|ObjectId|String} groupOrDomain [optional] domain or group object, ObjectId of group/domain object or string of group/domain object id
    @return {Boolean} if the user is admin
  **/
  schema.method('isAdmin', function(groupOrDomain){
    if( this.isSuperUser() )
      return true;
    if( groupOrDomain instanceof caminio.models.Domain )
      return groupOrDomain.owner.equals( this._id.toString() );
    return this.role <= 5;
  });

  schema.virtual('admin').get(function(){
    if( this.isSuperUser() )
      return true;
    return this.role <= 5;
  }).set(function(val){
    if( val )
      this.role = 1;
    else
      this.role = 100;
  });

  schema.virtual('superuser').get(function(){
    return this.isSuperUser();
  });

  /**

    Return, if this user is a superuser.

    This method looks up in the app.config object for a superusers key. The email address of this user
    must be an array item of this key.

    @method isSuperUser
    @return {Boolean} if the user is superuser

    @example

      // ${APP_HOME}/config/environments/production.js
      ...
      config.superusers = [ 'admin@example.com' ];
      ...

  **/
  schema.method('isSuperUser', function(){
    return caminio.config.superusers && caminio.config.superusers.indexOf(this.email) >= 0;
  });

  /**
   * computes the user's full name
   * to display
   * in worst case, this is the user's email
   * address
   *
   * @method getUserFullName
   * @private
   *
   **/
  function getUserFullName(){
    if( this.firstname && this.lastname )
      return this.firstname + ' ' + this.lastname;
    else if( this.firstname )
      return this.firstname;
    else if( this.lastname )
      return this.lastname;
    else
      return this.email;
  }

  /**
   * validates, if email has at least @
   *
   * @method EmailValidator
   * @private
   *
   **/
  function EmailValidator( val ){
    if( !val ) return false;
    return val.match(/@/);
  }

  /**
   * checks the given password and returns an array
   * first field: true/false
   * second field: error message if false
   *
   * @method checkPassword
   */
  function checkPassword(pwd, confirm_pwd){
    if( !pwd || !confirm_pwd || pwd.length < 1 || confirm_pwd.length < 1 )
      return [ false, 'too_short'];
    if( !pwd || pwd.length < 6 )
      return [ false, 'too_short' ];
    if( confirm_pwd && confirm_pwd !== pwd )
      return [ false, 'confirmation_missmatch' ];
    if( !pwd.match(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,60})/) )
      return [ false, 'requirements_not_met' ];
    return [ true ];
  }

  schema.publicAttributes = [
    'firstname',
    'lastname',
    'lang',
    'camDomains',
    'email',
    'lastLoginAt',
    'lastRequestAt',
    'superuser',
    'admin'
  ];

  return schema;

}