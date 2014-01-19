/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

module.exports = function AuthController( caminio, policies, middleware ){

  return {

    'login': [
      resetSession,
      passport.authenticate('local', { 
        successReturnToOrRedirect: '/caminio', 
        failureRedirect: '/login',
        failureFlash: true }) 
      )]

  }

}

function resetSession( req, res, next ){
  req.session.domain = null;
  next();
}