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

  'use strict';

  var passport = require('passport');

  return function ensureToken(req, res, next) {

    passport.authenticate( 'bearer', { session: false }, function(err, user, info){
      if( err ){ return res.json(500, { error: 'server_error' }); }
      if( !user ){ return res.json(403, { error: 'invalid_token_or_expired' }); }
      res.locals.currentUser = user;
      var opts = {};
      if( req.headers.camDomainFQDN )
        opts.fqdn = req.headers.camDomainFQDN;
      else if( req.param('camDomainFQDN') )
        opts.fqdn = req.param('camDomainFQDN');
      else
        opts._id = user.camDomains[0];
      caminio.models.Domain
        .findOne(opts)
        .exec( function( err, domain ){
          res.locals.currentDomain = domain;
          return next();
        });
    })(req, res);

  };

};
