/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var passport      = require('passport');

module.exports = function AuthController( caminio, policies, middleware ){

  return {

    'do_login': [
      resetSession,
      passport.authenticate('local', { 
        successReturnToOrRedirect: caminio.config.session.redirectUrl || '/caminio',
        failureRedirect: '/login',
        failureFlash: true 
      })],

    'login': 
      function( req, res ){
        res.caminio.render();
      },

    'logout':
      function( req, res ){
        req.logout();
        req.session.currentDomainId = null;
        res.redirect('/');
      }
  }

}

function resetSession( req, res, next ){
  req.session.domain = null;
  next();
}