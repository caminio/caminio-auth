/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var passport      = require('passport')
  , util          = require('caminio/util');

module.exports = function OAuthController( caminio, policies, middleware ){

  var Client  = caminio.models.Client
    , Token   = caminio.models.Token

  return {

    /**
     * type POST
     *
     * @method request
     * @param {String} client_id
     * @param {String} client_secret
     */
    'request_token': [
      resetSession,
      function( req, res ){
        if( !(req.body.client_id && req.body.client_secret) )
          return res.json(400,{ error: 'missing_client_id_client_secret'});
        Client.findOne({ _id: req.body.client_id, secret: req.body.client_secret }, function( err, client ){
          if( err ){ return res.json(500, { error: 'server_error', msg: err }); }
          if( !client ){ return res.json(401, { error: 'invalid_credentials' }); }
          Token.create({ 
            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            client: client
          }, function( err, token ){
            if( err ){ return res.json(500, { error: 'server_error', msg: err }); }
            if( !token ){ return res.json(500, { error: 'token_creation_failed' }); }
            res.json( token );
          });
        });
      }],
  }

}

function resetSession( req, res, next ){
  req.session.domain = null;
  next();
}