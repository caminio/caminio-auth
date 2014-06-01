/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

module.exports = function afterSession( caminio ){

  'use strict';

  var passport = require('passport');

  return setupPassport;

  function setupPassport( cb ){

    caminio.express.use( passport.initialize() );
    caminio.express.use( passport.session() );

    passport.serializeUser( serialize );
    passport.deserializeUser( deserialize );

    cb();

    function serialize(user, done) {
      done(null, user.id);
    }

    function deserialize( id, done ){
      caminio.models.User.findOne({ _id: id })
      .populate('camDomains')
      .exec( function(err, user ){
        if( err ){ return done( err ); }
        if( user ){
          if( !user.lastRequestAt || user.lastRequestAt.getTime() < (new Date()) - ( caminio.config.session.timeout ) )
            return done( null, null );
          user.update({ lastRequestAt: new Date() }, function( err ){
            done( err, user );
          });
        } else {
          done( err, user );
        }
      });
    }

  }

};
