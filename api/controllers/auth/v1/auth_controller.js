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

    'POST login': [
      resetSession,
      passport.authenticate('local', { 
        successReturnToOrRedirect: '/caminio', 
        failureRedirect: '/login',
        failureFlash: true 
      })],

    'login': 
      function( req, res ){
        res.caminio.render();
      }
  }

}

function resetSession( req, res, next ){
  req.session.domain = null;
  next();
}