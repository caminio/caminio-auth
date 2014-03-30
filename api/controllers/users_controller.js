/**
 * @class UsersController
 */
module.exports = function UsersController( caminio, policies, middleware ){

  var async         = require('async');
  var User          = caminio.models.User;
  var util          = require('caminio/util');

  return {

    _before: {
      '*!(reset,do_reset)': policies.ensureLogin
    },

    /**
     * return all users matching the currentDomain
     */
    'index': [
      getUsersByCamDomain,
      function( req, res ){
        res.json({ users: req.users });
      }
    ],

    /**
     * override autorest's create method
     */
    'create': [
      policies.userSignup,
      createUser,
      sendWelcome,
      function(req,res){
        res.json({ user: req.user });
      }],

    /**
     * reset the user's password
     * @method reset
     */
    'reset': [
      getUserById,
      checkValidRequest,
      middleware.processFlash,
      function(req,res,next){ 
        if( !res.locals.message.error )
          res.locals.message.info = req.i18n.t('auth.enter_new_password');
        next();
      },
      function( req, res ){
        res.locals.userId = req.params.id;
        res.locals.key = req.params.key;
        res.caminio.render();
      }],

    /**
     * update the user
     * @method update
     */
    'update': [
      getUserById,
      updateUser,
      sendCredentials,
      function(req,res){
        res.json({ user: req.user });
      }
    ],

    /**
     * do reset the user's password
     * @method do_reset
     */
    'do_reset': [
      getUserById,
      checkValidRequest,
      checkPassword,
      updateUserPassword,
      function( req, res ){
        res.redirect('/caminio/login');
      }],

    /**
     * migrate
     * this method can be deleted, if not used for caminio < 1.1.0
     */
    'migrate': [
      function( req, res ){
        User.find().exec( function( err, users ){
          if( err ){ return console.log(err); }
          async.each( users, function( user, next ){
            user.update({ 
              camDomains: '52ce121b50f45be81891ed29',
              encryptedPassword: user.encrypted_password
            }, next );
          }, function( err ){
            res.send(200, 'done');
          });
        });
      }]

  };

  /**
   * @method getUserById
   * @private
   */
  function getUserById(req,res,next){
    User.findOne({ _id: req.params.id })
    .exec( function( err, user ){
      if( user ){ req.user = user; }
      next();
    });
  }

  /**
   * @method updateUserPassword
   */
  function updateUserPassword(req,res,next){
    req.user.password = req.body.password;
    req.user.confirmation.key = null;
    req.user.save( function( err ){
      if( err ){ return next(err); }
      req.user.populate('domains', function(err,user){
        user.camDomains.forEach( function(domain){
          caminio.audit.log( domain.name, 
            'password has been changed for user',req.user.id,
            ' (',req.user.fullName,') IP:',
            req.headers['x-forwarded-for'] || req.connection.remoteAddress );  
        });
        req.flash('info', req.i18n.t('user.password_reset_saved', { email: req.user.email }));
        next();
      });
    });
  }

  /**
   * @method checkUserData
   * @private
   */
  function checkValidRequest(req,res,next){
    if( !req.user ){
      req.flash('error', req.i18n.t('auth.security_transgression'));
      return res.redirect('/caminio/login');
    }
    if( !( req.user.confirmation && req.user.confirmation.key === req.params.key ) ){
      req.flash('error', req.i18n.t('auth.confirmation_missmatch'));
      return res.redirect('/caminio/login');
    }
    if( !( req.user.confirmation && req.user.confirmation.expires < new Date() ) ){
      req.flash('error', req.i18n.t('auth.confirmation_expired') );
      return res.redirect('/caminio/login');
    }
    next();
  }

  /**
   * @method checkPassword
   * @private
   */
  function checkPassword( req,res,next ){
    var passwordValidation = req.user.checkPassword( req.body.password, req.body.password_confirm );
    if( !passwordValidation[0] ){
      req.flash('error', req.i18n.t('user.errors.'+passwordValidation[1]));
      return res.redirect('/caminio/accounts/'+req.params.id+'/reset/'+req.params.key);
    }
    next();
  }

  /**
   * @method createUser
   * @private
   */
  function createUser( req, res, next ){
    if( !('user' in req.body) )
      return res.json(400,{ error: 'missing_model_name_in_body', expected: 'expected "user"', got: req.body });

    if( req.body.user && req.body.user.autoPassword )
      req.body.user.password = (Math.random()+(new Date().getTime().toString())).toString(36);

    if( req.body.user && req.body.user.admin )
      req.body.user.role = 1;

    if( res.locals.currentDomain.lang )
      req.body.user.lang = res.locals.currentDomain.lang;

    req.body.user.camDomains = res.locals.currentDomain;

    User.create( req.body.user, function( err, user ){
      if( err ){ 
        if( err.name && err.name === 'ValidationError' ){
          return res.json( 422, util.formatErrors(err) );
        }
        return res.json( 500, { error: 'server_error', details: err }); 
      }
      if( !user ){ return res.json( 500, { error: 'unknown_error', details: 'did not get a user object after database action'}); }
      req.user = user;
      next();
    });
  }

  /**
   * @method updateUser
   * @private
   */
  function updateUser( req, res, next ){
    if( req.param('id') !== res.locals.currentUser.id && !res.locals.currentUser.isAdmin() )
      return res.json(403, { error: 'security_transgression' });

    if( !('user' in req.body) )
      return res.json(400,{ error: 'missing_model_name_in_body', expected: 'expected "user"', got: req.body });

    if( req.body.user && req.body.user.autoPassword )
      req.body.user.password = (Math.random()+(new Date().getTime().toString())).toString(36);

    if( req.body.user && req.body.user.admin )
      req.body.user.role = 1;
    else
      req.body.user.role = 100;

    req.body.user.camDomains = res.locals.currentDomain;

    for( var i in req.body.user ){
      if( i in req.user.constructor.schema.paths )
        req.user[i] = req.body.user[i];
    }

    req.user.generateConfirmationKey();

    req.user.save( function( err ){
      if( err ){ 
        if( err.name && err.name === 'ValidationError' )
          return res.json( 422, util.formatErrors(err) );
        return res.json( 500, { error: 'server_error', details: err }); 
      }
      next();
    });
  }

  /**
   * @method sendCredentials
   * @private
   */
  function sendCredentials( req, res, next ){
    caminio.mailer.send(
      req.user.email,
      req.i18n.t('auth.mailer.subject_pwd_changed'), 
      'users/password_changed', 
      { 
        locals: {
          welcome: true,
          user: req.user,
          domain: res.locals.currentDomain,
          creator: res.locals.currentUser,
          url: ( caminio.config.hostname + '/caminio/accounts/' + req.user.id + '/reset/' + req.user.confirmation.key)
        } 
      },
      function( err ){
        if( err ){ return res.json(err); }
        next();
      });
  }

  /**
   * @method sendWelcome
   * @private
   */
  function sendWelcome( req, res, next ){
    caminio.mailer.send(
      req.user.email,
      req.i18n.t('auth.mailer.subject_welcome'), 
      'users/welcome', 
      { 
        locals: {
          welcome: true,
          user: req.user,
          domain: res.locals.currentDomain,
          creator: res.locals.currentUser,
          url: ( caminio.config.hostname + '/caminio/accounts/' + req.user.id + '/reset/' + req.user.confirmation.key)
        } 
      },
      function( err ){
        if( err ){ return res.json(err); }
        next();
      });
  }
  /**
   * @method getUsersByCamDomain
   * @private
   */
  function getUsersByCamDomain( req, res, next ){
    User.find({ camDomains: res.locals.currentDomain._id })
        .exec( function( err, users ){
          if( err ){ return res.json( 500, { error: 'server_error', details: err }); }
          req.users = users;
          next();
        });
  }

};