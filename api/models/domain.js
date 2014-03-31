/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var _           = require('lodash');
var inflection  = require('inflection');
var join        = require('path').join;

module.exports = DomainModel;

/**
 *
 * @class Domain
 */ 
function DomainModel( caminio, mongoose ){

  var ObjectId = mongoose.Schema.Types.ObjectId;
  var Mixed = mongoose.Schema.Types.Mixed;

  var schema = new mongoose.Schema({
      name: { type: String, 
              required: true,
              index: { unique: true } },
      fqdn: { type: String, index: { unique: true },
              required: true,
              lowercase: true,
              validate: [ DomainNameValidator, 'invalid_domain_name' ] },
      title: String, // could be used to say 'TASTENWERK e.U.'
      users: [ { type: ObjectId, ref: 'User' } ],
      lang: { type: String, default: 'en' },
      usersQuota: { type: Number, default: 1 },
      diskQuotaM: { type: Number, default: 5 },
      diskUploadLimitM: { type: Number, default: 5 },
      groups: [ { type: ObjectId, ref: 'Group' } ],
      owner: { type: ObjectId, ref: 'User' },
      selectedApps: { type: mongoose.Schema.Types.Mixed, default: {} },
      allowedAppNames: { type: Array, default: ['admin'] },
      createdAt:{ type: Date, default: Date.now },
      createdBy: { type: ObjectId, ref: 'User' },
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: ObjectId, ref: 'User' },

      lockedAt: { type: Date },
      lockedBy: { type: ObjectId, ref: 'User' },

      description: String,
      /**
       *  Holds statistic Data over the 31 days
       *  @attribute stats
       *  @type Mixed
       */
      stats : { type: Mixed, default: {} }
  });

  schema.method( 'lock', lock );
  schema.method( 'addUser', addUser );
  schema.method( 'allowedApps', allowedApps );
  
  schema.publicAttributes = [
    'name',
    'fqdn',
    'title',
    'lang',
    'users',
    'owner',
    'locked',
    'created',
    'updated',
    'description',
    'allowedAppNames',
    'selectedApps',
    'stats',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'lockedAt',
    'lockedBy',
    'usersQuota',
    'diskQuotaM',
    'diskUploadLimitM',
    'normalizedFQDN'
  ];

  // do population on autorest show
  schema.static('populateOnShow', [
    'owner',
    'createdBy',
    'updatedBy'
  ]);

  schema.pre('validate', setupFQDN);

  function setupFQDN( next ){
    if( this.fqdn && this.fqdn.length > 0 )
      return next();
    this.fqdn = this.name.replace(/ /g,'-').replace(/[^A-Za-z0-9-]/g,'');
    this.fqdn = inflection.underscore( this.fqdn );
    if( !DomainNameValidator( this.fqdn ) )
      this.fqdn += '.camin.io';
    next();
  }

  schema.virtual('normalizedFQDN').get( function(){
    return this.fqdn.replace(/[^A-Za-z0-9-_]/g,'_');
  });

  schema.methods.getContentPath = getContentPath;

  return schema;

  /**
   * validates, if domain name has at least
   * one dot and consists of at least 2 chars LHS and RHS
   *
   * @method DomainNameValidator
   * @private
   *
   */
  function DomainNameValidator( val ){
    if( !val ) return false;
    return val.match(/^[a-zA-Z0-9][a-zA-Z0-9-_]{0,61}[\.]{0,1}[a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]\.[a-zA-Z\.]{2,}$/);
  }
  /**
   *
   * Adds a user to this domain. The user has to be saved seperately
   *
   * @method addUser
   * @param {User} user the user to be added
   * @param {User} manager a user with owner status (only domain managers can add users)
   * @param {Function} callback
   * @param {Object} err The error object, if anything goes wrong saving the domain
   */
  function addUser( user, manager, callback ){
    if( manager && manager.id !== this.owner )
      throw 'insufficient rights';
    user.camDomains.push( this );
    this.users.push( user );
    this.save( callback );
  }

  /**
   * locks a domain. This affects any user associated with this domain.
   * Sets. locked.at, locked.by
   * @method lock
   * @param {User} user The user object which locks the domain (must be admin)
  **/
  function lock( user ){
    if( !user.isAdmin(this) )
      throw 'insufficient rights';
    this.locked.at = new Date();
    this.locked.by = user;
  }

  /**
   * returns list of allowed applications for this
   * user
   *
   * The method reads the currentDoman object and returns an
   * array containing the names of the applications (not gears)
   * this domain (and their users) can access
   *
   * @param {Domain} domain the domain to be parsed for applications
   *
   */
  function allowedApps(){
    var self = this;
    
    if( this._allowedArr ) return this._allowedArr;

    var available = {};
    _.each( caminio.gears, function( gear ){
      _.each( gear.applications, function( appDef ){
        var buildAppDef = { name: appDef.name };
        buildAppDef.icon = appDef.icon || 'fa-'+buildAppDef.name.toLowerCase();
        buildAppDef.color = appDef.color;
        buildAppDef.path = appDef.path || '/caminio/'+appDef.name;
        buildAppDef.admin = appDef.admin || false;
        buildAppDef.su = appDef.su || false;
        available[appDef.name] = buildAppDef;
      });
    });

    this._allowedArr = [];
    _.each( this.allowedAppNames, function( appName ){
      if( appName in available )
        self._allowedArr.push( available[appName] );
    });

    return this._allowedArr;
  }

  /**
   * returns the content path for this domain
   * the content path is assembled together with
   * the contentPath set up in config/site.js
   * and the domain's fqdn
   */
  function getContentPath(){
    var pth = '';
    if( caminio.config.contentPath )
      pth = join( pth, caminio.config.contentPath );
    else
      pth = join( process.cwd(), 'content' );

    console.log( join( pth, this.normalizedFQDN ) );
    return join( pth, this.normalizedFQDN );
  }

}
