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

  var User     = caminio.models.User;

  return function ensureAPIKey(req, res, next) {

    var apiKey = req.header('Authorization');
    if( !apiKey )
      return res.send(400);

    apiKey = apiKey.replace('API-KEY ','').replace(/\ /g,'');
    User.findOne({ apiKey: apiKey })
      .populate('camDomains')
      .exec( function( err, user ){
        if( err ){ return res.json(500, { error: 'server_error', message: err }); }
        if( !user ){ return res.json(403, { error: 'invalid_api_key' }); }
        req.user = user;
        next();
      });

  };

};
