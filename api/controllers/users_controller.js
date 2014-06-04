/**
 * @class UsersController
 */
module.exports = function UsersController( caminio, policies, middleware ){

  var async         = require('async');
  var User          = caminio.models.User;
  var util          = require('caminio/util');

  return {

    _policies: {
      'mine': policies.ensureLoginOrApiOrToken,
      '*!(mine,reset,do_reset)': policies.ensureLogin
    },

    _before: {
      'create,index': policies.ensureAdmin
    },

    'mine': function( req, res ){
      res.json( req.user );
    },
  
    /**
     * return all users matching the currentDomain
     */
    'index': [
      getUsersByCamDomain,
      function( req, res ){
        var result = req.userAccounts;

        if( req.header('namespaced') )
          result = { users: JSON.parse(JSON.stringify(req.userAccounts)) };

          if( req.header('sideload') )
            result = util.transformJSON( result, req.header('namespaced') );

        res.json(result);
      }
    ],

    /**
     * override autorest's create method
     */
    'create': [
      policies.userSignup,
      findUserAndLinkIfExists,
      createUser,
      sendWelcome,
      function(req,res){
        var result = req.userAccount;

        if( req.header('namespaced') )
          result = { users: JSON.parse(JSON.stringify(req.userAccount)) };

          if( req.header('sideload') )
            result = util.transformJSON( result, req.header('namespaced') );

        res.json(result);
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
        var result = req.userAccount;
        if( req.header('namespaced') )
          result = { users: JSON.parse(JSON.stringify(result)) };

        if( req.header('sideload') )
          result = util.transformJSON( result, req.header('namespaced') );

        res.json(result);
      }
    ],

    'change_password': [
      getUserById,
      checkOldAndUpdateUserPassword,
      sendCredentials,
      function(req,res){
        res.json({ user: req.userAccount });
      }
    ],

    /**
     * send credentials again
     * @method send_credentials
     */
    'resend_credentials': [
      getUserById,
      sendWelcome,
      function(req,res){
        res.json({ user: req.userAccount });
      }],

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
      }],

    'genApiKey': [
      getUserById,
      function( req, res ){
        var apiKey = util.uid(48);
        User.count({ apiKey: apiKey })
          .exec(function( err, count ){
            if( err ){ 
              caminio.logger.error( err ); 
              return res.send(500); 
            }
            if( count > 0 ) 
              return res.send(409);
            req.user.update({ apiKey: apiKey }, function( err ){
              if( err ){ 
                caminio.logger.error( err ); 
                return res.send(500); 
              }
              return res.json( req.user );
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
      if( user ){ req.userAccount = user; }
      next();
    });
  }

  /**
   * @method updateUserPassword
   */
  function updateUserPassword(req,res,next){
    req.userAccount.password = req.body.password;
    req.userAccount.confirmation.key = null;
    req.userAccount.save( function( err ){
      if( err ){ return next(err); }
      req.userAccount.populate('camDomains', function(err,user){
        user.camDomains.forEach( function(domain){
          caminio.audit.log( domain.name, 
            'password has been changed for user',req.userAccount.id,
            ' (',req.userAccount.fullName,') IP:',
            req.headers['x-forwarded-for'] || req.connection.remoteAddress );  
        });
        req.passwordChanged = true;
        req.flash('info', req.i18n.t('user.password_reset_saved', { email: req.userAccount.email }));
        next();
      });
    });
  }

  /**
   * checks old password match and updates user's password
   * @method checkOldAndUpdateUserPassword
   */
  function checkOldAndUpdateUserPassword(req,res,next){
    if( !res.locals.currentUser.isAdmin( res.locals.currentDomain ) && !req.userAccount.authenticate( req.body.oldPassword ) )
      return res.json(403,{ error: 'password_missmatch'});
    req.userAccount.password = req.body.newPassword;
    req.userAccount.confirmation.key = null;
    req.userAccount.save( function( err ){
      if( err ){ return next(err); }
      req.userAccount.populate('camDomains', function(err,user){
        user.camDomains.forEach( function(domain){
          caminio.audit.log( domain.name, 
            'password has been changed for user',req.userAccount.id,
            ' (',req.userAccount.fullName,') IP:',
            req.headers['x-forwarded-for'] || req.connection.remoteAddress );  
        });
        req.passwordChanged = true;
        next();
      });
    });
  }

  /**
   * @method checkUserData
   * @private
   */
  function checkValidRequest(req,res,next){
    if( !req.userAccount ){
      req.flash('error', req.i18n.t('auth.security_transgression'));
      return res.redirect('/caminio/login');
    }
    if( !( req.userAccount.confirmation && req.userAccount.confirmation.key === req.params.key ) ){
      req.flash('error', req.i18n.t('auth.confirmation_missmatch'));
      return res.redirect('/caminio/login');
    }
    if( !( req.userAccount.confirmation && req.userAccount.confirmation.expires < new Date() ) ){
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
    var passwordValidation = req.userAccount.checkPassword( req.body.password, req.body.password_confirm );
    if( !passwordValidation[0] ){
      req.flash('error', req.i18n.t('user.errors.'+passwordValidation[1]));
      return res.redirect('/caminio/accounts/'+req.params.id+'/reset/'+req.params.key);
    }
    next();
  }

  /**
   * @method findUserAndLinkIfExists
   * @private
   */

  function findUserAndLinkIfExists( req, res, next ){
    User.findOne({ email: req.body.user.email }, function( err, user ){
      if( err ){
        caminio.log.error( 'findUserAndLinkIfExists (user controller)', err );
        return res.json( 500, { error: 'server_error', details: err });
      }
      if( !user )
        return next();
      if( user.camDomains.indexOf( res.locals.currentDomain._id ) >= 0 )
        return res.json( 422, { errors: { email: 'already_member' }});
      user.camDomains.push( res.locals.currentDomain );
      user.save( function( err ){
        if( err ){
          caminio.log.error( 'findUserAndLinkIfExists (user controller)', err );
          return res.json( 500, { error: 'server_error', details: err });
        }
        req.userAccount = user;
        next();
      });
    });
  }

  /**
   * @method createUser
   * @private
   */
  function createUser( req, res, next ){
    if( req.userAccount ) // already linked with existing user. nothing to do
      return next();

    if( !('user' in req.body) )
      return res.json(400,{ error: 'missing_model_name_in_body', expected: 'expected "user"', got: req.body });

    if( req.body.user && req.body.user.autoPassword )
      req.body.user.password = (Math.random()+(new Date().getTime().toString())).toString(36);

    if( res.locals.currentDomain.lang )
      req.body.user.lang = res.locals.currentDomain.lang;
    req.body.user.apiKey = util.uid(48);

    req.body.user.camDomains = res.locals.currentDomain;

    User.create( req.body.user, function( err, user ){
      if( err ){ 
        if( err.name && err.name === 'ValidationError' ){
          return res.json( 422, util.formatErrors(err) );
        }
        return res.json( 500, { error: 'server_error', details: err }); 
      }
      if( !user ){ return res.json( 500, { error: 'unknown_error', details: 'did not get a user object after database action'}); }
      req.userAccount = user;
      next();
    });
  }

  /**
   * @method updateUser
   * @private
   */
  function updateUser( req, res, next ){

    if( req.param('id') !== res.locals.currentUser.id && !res.locals.currentUser.isAdmin( res.locals.currentDomain ) )
      return res.json(403, { error: 'security_transgression' });

    if( !('user' in req.body) )
      return res.json(400,{ error: 'missing_model_name_in_body', expected: 'expected "user"', got: req.body });

    if( req.body.user.password && req.body.user.password.length > 1 ){
      if( req.body.user.password !== req.body.user.passwordConfirmation )
        return res.json( 422, { error: 'passwords_missmatch' });
      var check = req.userAccount.checkPassword( req.body.user.password, req.body.user.passwordConfirmation );
      if( !check[0] )
        return res.json( 422, { error: check[1] });
      req.userAccount.password = req.body.user.password;
      req.passwordChanged = true;
    }

    for( var i in req.body.user ){
      if( i in req.userAccount.constructor.schema.paths )
        req.userAccount[i] = req.body.user[i];
    }

    req.userAccount.generateConfirmationKey();

    req.userAccount.save( function( err ){
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
    if( req.passwordChanged )
      caminio.mailer.send(
        req.userAccount.email,
        req.i18n.t('auth.mailer.subject_pwd_changed'), 
        'users/password_changed', 
        { 
          locals: {
            welcome: true,
            user: req.userAccount,
            domain: res.locals.currentDomain,
            creator: res.locals.currentUser,
            url: ( caminio.config.hostname + '/caminio/accounts/' + req.userAccount.id + '/reset/' + req.userAccount.confirmation.key)
          } 
        },
        function( err ){
          if( err ){ return res.json(err); }
          next();
        });
    else
      next();
  }

  /**
   * @method sendWelcome
   * @private
   */
  function sendWelcome( req, res, next ){
    caminio.mailer.send(
      req.userAccount.email,
      req.i18n.t('auth.mailer.subject_welcome'), 
      'users/welcome', 
      { 
        locals: {
          welcome: true,
          user: req.userAccount,
          domain: res.locals.currentDomain,
          creator: res.locals.currentUser,
          url: ( caminio.config.hostname + '/caminio/accounts/' + req.userAccount.id + '/reset/' + req.userAccount.confirmation.key)
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
        .sort({ 'lastname': 'asc' })
        .exec( function( err, users ){
          if( err ){ return res.json( 500, { error: 'server_error', details: err }); }
          req.userAccounts = users;
          next();
        });
  }

};
