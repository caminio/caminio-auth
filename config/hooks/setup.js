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

  caminio.hooks.define( 'before', 'setup', 'setupCrossOriginResourceSharing', setupCrossOriginResourceSharing );

  function setupCrossOriginResourceSharing(){

    caminio.express.use( function allowCrossDomain(req, res, next) {
      if( req.method !== 'OPTIONS' )
        return next();
      res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.header("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, HEAD, DELETE, OPTIONS");
      res.header("Access-Control-Max-Age", 1200);
      res.send(200);
    });

  }

};