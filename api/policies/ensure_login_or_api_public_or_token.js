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

  var ensureToken = require('./ensure_token')( caminio );
  var ensureApiKey = require('./ensure_api_public_key')( caminio );
    
  return function ensureLoginOrApiPublicOrToken(req, res, next) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl || req.url;

      // only try token, if request has 'authorization' in header
      if( 'authorization' in req.headers ){
        if( req.header('authorization').indexOf('API-PUBLIC-KEY') >= 0 )
          return ensureApiKey( req, res, next );
        return ensureToken( req, res, next );
      }
      
      return res.redirect('/caminio/login');

    }

    next();

  };

};
