/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var passport = require('passport')
  , BearerStrategy = require('passport-http-bearer').Strategy
  , BasicStrategy = require('passport-http').BasicStrategy
  , ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

module.exports = function( caminio ){

  var Client  = caminio.models.Client
    , Token   = caminio.models.Token
    , User    = caminio.models.User;


  /**
   * client strategy allows to send
   * the 'Authorization' header
   */
  passport.use( new ClientPasswordStrategy(

    function( clientId, clientSecret, done ){
      Client.findOne( { _id: clientId }, function( err, client ){
        if(err){ return done(err); }
        if(!client){ return done(null, false); }
        if( client.secret != clientSecret )
          return done(null, false);
        return done(null, client);
      });
    })

  );

  passport.use( new BasicStrategy(

    function( username, password, done ){
      User.findOne({ email: username }, function( err, user ){
        if( err ){ return done(err); }
        if( !user ){ return done(null, false); }
        if( !user.authenticate(password) )
          return done(null, false);
        return done(null, user);
      });
    })

  );

  passport.use( new BearerStrategy(

    function( accessToken, done ){
      Token.findOne({ token: accessToken, 'expires.at': { $gte: (new Date() - caminio.config.token.timeout) } }, function( err, token ){
        if(err){ return done(err); }
        if( !token ){ return done(null, false); }
        token.populate('client', function( err, token ){
          if( err ){ return done(err); }
          if( !token ){ return done(null,false); }
          token.client.populate('user', function( err, client ){
            if( err ){ return done(err); }
            if( !client ){ return done(null,false); }
            done( err, client.user, client.scope );
          });
        });
      });
    })

  );

  return null;

}
