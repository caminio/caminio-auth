/*
 * auth routes
 *
 */

module.exports.routes = {
  
  '/login': 'Auth::V1::AuthController#login',

  'POST /login': 'Auth::V1::AuthController#do_login',

  '/logout': 'Auth::V1::AuthController#logout',

  'POST /oauth/request_token': 'Auth::V1::OAuthController#request_token'

}