/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var _             = require('lodash');
var fs            = require('fs');
var passport      = require('passport');

module.exports = function AuthController( caminio, policies, middleware ){

  var User = caminio.models.User;
  var Domain = caminio.models.Domain;

  return {

    'do_login': [
      resetSession,
      passport.authenticate('local', { 
        successReturnToOrRedirect: caminio.config.session.redirectUrl || '/caminio',
        failureRedirect: '/caminio/login',
        failureFlash: true
      })],

    'setup': [
      checkInitialSetup,
      middleware.processFlash,
      function( req, res ){
        res.caminio.render();
      }],

    'do_setup': [
      checkInitialSetup,
      doInitialSetupCheckBody,
      doInitialSetupCreateOrFindDomain,
      doInitialSetupCreateUser,
      //reportErrors,
      function( req, res ){
      }],

    'login': [
      checkInitialSetupAndRedirect,
      middleware.processFlash,
      function( req, res ){
        res.caminio.render();
      }],

    'reset_password': [
      middleware.processFlash,
      function( req, res ){
        res.caminio.render();
      }],

    'do_reset_password': [
      findUser,
      generateConfirmationUrl,
      sendPassword,
      //reportErrors,
      function( req, res ){
        if( !req.sentOK ){
          req.flash('error', req.i18n.t('auth.unknown_email', { email: req.param('email') }));
          res.redirect('/caminio/reset_password');
        } else {
          req.flash('info', req.i18n.t('auth.link_has_been_sent', { email: req.param('email') }));
          res.redirect('/caminio/login');
        }
      }],

    'logout':
      function( req, res ){
        req.logout();
        req.session.camDomainId = null;
        res.redirect('/');
      },

    };

  /**
   * reset domain session object
   */
  function resetSession( req, res, next ){
    req.session.camDomainId = null;
    next();
  }

  /**
   * check if initial setup has been issued and
   * provide interface for user if not
   */
  function checkInitialSetup( req, res, next ){
    User.count( function( err, count ){
      if( err ){ next(err); }
      if( count > 0 ){
        req.flash('error', req.i18n.t('setup.already_initialized'));
        return res.redirect('/caminio/login');
      }
      next();
    });
  }

  function doInitialSetupCheckBody( req, res, next ){
    if( !_.isEmpty(req.body.email) && !_.isEmpty(req.body.password) && !_.isEmpty(req.body.camDomainName) )
      return next();
    req.flash('error', req.i18n.t('setup.fill_in_all_fields') );
    res.redirect('/caminio/initial_setup');
  }

  function doInitialSetupCreateOrFindDomain( req, res, next ){
    Domain.findOne({name: req.body.camDomainName}, function( err, domain ){
      if( err ){ next(err); }
      if( domain ){ 
        req.camDomain = domain;
        return next(); 
      }
      Domain.create({ name: req.body.camDomainName }, function( err, domain ){
        if( err ) return next(err);
        if( !domain ) return next('domain '+req.body.camDomainName+' failed to create');
        req.camDomain = domain;
        next();
      });
    });
  }

  /**
   * creates domain and user accounts
   * should only be invoked after checking, that no domains nor users
   * exist
   */
  function doInitialSetupCreateUser( req, res, next ){
    if( !req.camDomain ){ return next('no domain could be found. But it should have been created.'); }
      var check = User.checkPassword( req.body.password );

    if( !check[0] ){
      req.flash('error', req.i18n.t('user.errors.'+check[1]));
      return res.redirect('/caminio/initial_setup');
    }

    User.create({ email: req.body.email, 
                  password: req.body.password,
                  camDomains: [ req.camDomain ] }, function( err, user ){

                    if( err ) return next(err);
                    if( !user ) return next('user '+req.body.email+' failed to create');

                    req.camDomain.update({ owner: user }, function( err ){

                      if( err ) return next(err);

                      req.flash('info', req.i18n.t('setup.successful'));

                      res.redirect('/caminio/login');
                      next();
                    });
    });
  }

  /**
   * report errors either in json or html format
   */
  function reportErrors( err, req, res, next ){
    caminio.logger.error('error occured at',req.controllerName,'#',req.actionName,':', err);
    if( req.xhr ) 
      return res.json(500, { error: err });
    return res.caminio.render('500');
  }

  /**
   * finds the user by it's email address
   */
  function findUser( req, res, next ){
    User.findOne({ email: req.param('email') }, function( err, user ){
      if( err ){ return next( err ); }
      req.user = user;
      next();
    });
  }

  /**
   * generate a url the user will be sent in the email
   * to reset the password
   */
  function generateConfirmationUrl( req, res, next ){
    if( !req.user ){ return next(); }
    req.user.generateConfirmationKey();
    req.user.save( function( err ){
      if( err ){ return next(err); }
      next();
    });
  }

  /**
   * sends the password to the user
   */
  function sendPassword( req, res, next ){
    if( !req.user ){ return next(); }
    caminio.mailer.send(
      req.user.email,
      req.i18n.t('auth.mailer.subject_reset_password'), 
      'auth/reset_password', 
      { 
        locals: { 
          user: req.user,
          url: (req.protocol + "://" + req.get('host') + '/caminio/accounts/' + req.user.id + '/reset/' + req.user.confirmation.key)
        } 
      },
      function( err ){
        req.sentOK = true;
        next( err );
      });
  }

  /**
   * checks if this is the first run of caminio
   * and redirect to caminio/initial_setup if no user
   * account was found
   *
   */
  function checkInitialSetupAndRedirect( req, res, next ){
    //if( caminio.config.superusers && caminio.config.superusers.length > 0 )
    //  return next();
    User.count( function( err, count ){
      if( err ){ caminio.logger.error('unknown error occured:', err); }
      if( count > 0 ){ return next(); }
      req.flash( 'info', req.i18n.t('setup.desc') );
      // seems we haven't got any user in the system.
      res.redirect('/caminio/initial_setup');
    });
  }

};