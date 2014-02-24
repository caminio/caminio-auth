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
var LocalStrategy = require('passport-local').Strategy;

module.exports = function( caminio ){

  /**
   * LocalStrategy
   *
   * This strategy is used to authenticate users based on a username and password.
   * Anytime a request is made to authorize an application, we must ensure that
   * a user is logged in before asking them to approve the request.
   */
  passport.use('local', new LocalStrategy(
    function(username, password, done) {
      caminio.models.User.findOne({ email: username })
      .exec( function( err, user ){
        if( err ){ caminio.logger.error(err); return done(err); }
        if( !user ){ return done(null, false, { message: 'user_unknown' }); }
        if( !user.authenticate( password ) )
          return done( null, false, { message: 'authentication_failed' });        
        user.update({ lastLoginAt: new Date(), lastRequestAt: new Date()}, function( err ){
          if( err ){ return done(err); }
          done( null, user );
        });
      });
    }
  ));

  return null;

}
