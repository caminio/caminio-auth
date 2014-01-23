/*
 * auth routes
 *
 */

module.exports.routes = {
  
  '/login': 'Auth::V1::AuthController#login',
  'POST /login': 'Auth::V1::AuthController#do_login',

  '/caminio_setup': 'Auth::V1::AuthController#setup',
  'POST /caminio_setup': 'Auth::V1::AuthController#do_setup',

  '/logout': 'Auth::V1::AuthController#logout',

  'POST /oauth/request_token': 'Auth::V1::OAuthController#request_token'

}