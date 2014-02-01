/*
 * auth routes
 *
 */

module.exports.routes = {

  '/login': 'Auth::V1::AuthController#login',
  'POST /login': 'Auth::V1::AuthController#do_login',

  '/reset_password': 'Auth::V1::AuthController#reset_password',
  'POST /reset_password': 'Auth::V1::AuthController#do_reset_password',

  '/caminio_setup': 'Auth::V1::AuthController#setup',
  'POST /caminio_setup': 'Auth::V1::AuthController#do_setup',

  '/logout': 'Auth::V1::AuthController#logout',

  'POST /oauth/request_token': 'Auth::V1::OAuthController#request_token'

};