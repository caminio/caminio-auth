/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var passport = require('passport');

module.exports = function( caminio ){

  return function ensureToken(req, res, next) {

    passport.authenticate( 'bearer', { session: false }, function(err, user, info){
      if( err ){ return res.json(500, { error: 'server_error' }); }
      if( !user ){ return res.json(403, { error: 'invalid_token_or_expired' }); }
      res.locals.currentUser = user;
      return next();
    })(req, res);

  }

}