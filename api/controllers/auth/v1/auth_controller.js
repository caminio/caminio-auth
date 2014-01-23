/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var _             = require('lodash')
  , passport      = require('passport');

module.exports = function AuthController( caminio, policies, middleware ){

  var User = caminio.models.User
    , Domain = caminio.models.Domain;

  return {

    _before: {
      '*': [ reportErrors ]
    },

    'do_login': [
      resetSession,
      passport.authenticate('local', { 
        successReturnToOrRedirect: caminio.config.session.redirectUrl || '/caminio',
        failureRedirect: '/login',
        failureFlash: true
      })],

    'setup': [
      checkInitialSetup,
      function( req, res ){
        var msg = req.flash('error');
        res.caminio.render({ layout: 'layouts/authorize', message: _.isEmpty(msg) ? '' : req.i18n.t(msg) });
      }],

    'do_setup': [
      checkInitialSetup,
      doInitialSetup,
      function( req, res ){
      }],

    'login': 
      function( req, res ){
        var msg = req.flash('error');
        if( _.isEmpty(msg) )
          msg = req.flash('info');
        res.caminio.render({ layout: 'layouts/authorize', message: _.isEmpty(msg) ? '' : req.i18n.t(msg) });
      },

    'logout':
      function( req, res ){
        req.logout();
        req.session.currentDomainId = null;
        res.redirect('/');
      }
  }

  /**
   * reset domain session object
   */
  function resetSession( req, res, next ){
    req.session.domainId = null;
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
        return res.redirect('/login');
      }
      next();
    });
  }

  /**
   * creates domain and user accounts
   * should only be invoked after checking, that no domains nor users
   * exist
   */
  function doInitialSetup( req, res, next ){
    if( !_.isEmpty(req.body.username) && !_.isEmpty(req.body.password) && !_.isEmpty(req.body.domain_name) ){
      Domain.create({ name: req.body.domain_name }, function( err, domain ){
        
        if( err ) return next(err);
        if( !domain ) return next('domain '+req.body.domain_name+' failed to create');

        User.create({ email: req.body.username, 
                      password: req.body.password,
                      domains: domain }, function( err, user ){

                        if( err ) return next(err);
                        if( !user ) return next('user '+req.body.username+' failed to create');

                        domain.update({ owner: user }, function( err ){

                          if( err ) return next(err);

                          req.flash('info', req.i18n.t('setup.successful'))
                          res.redirect('/login');
                          next();
                        });
                      });
      });
    } else {
      req.flash('error', req.i18n.t('setup.fill_in_all_fields'));
      res.redirect('/caminio_setup');
      next();
    }
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

}
