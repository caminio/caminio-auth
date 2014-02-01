/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

module.exports = function( caminio ){

  var ensureToken = require('./ensure_token')( caminio );
    
  return function ensureLoginOrToken(req, res, next) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl || req.url;

      // only try token, if request has 'authorization' in header
      if( 'authorization' in req.headers )
        return ensureToken( req, res, next );
      
      return res.redirect('/caminio/login');

    }

    next();

  }

}