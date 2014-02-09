/*
 * auth routes
 *
 */

module.exports.routes = {

  '/caminio/login': 'Auth::V1::AuthController#login',
  'POST /caminio/login': 'Auth::V1::AuthController#do_login',

  '/caminio/reset_password': 'Auth::V1::AuthController#reset_password',
  'POST /caminio/reset_password': 'Auth::V1::AuthController#do_reset_password',

  'autorest /caminio/accounts': 'User',
  'GET /caminio/accounts/:id/reset/:key': 'UsersController#reset',
  'POST /caminio/accounts/:id/reset/:key': 'UsersController#do_reset',

  'autorest /caminio/domains': 'Domain',

  '/caminio/initial_setup': 'Auth::V1::AuthController#setup',
  'POST /caminio/initial_setup': 'Auth::V1::AuthController#do_setup',

  '/caminio/logout': 'Auth::V1::AuthController#logout',

  'POST /caminio/oauth/request_token': 'Auth::V1::OAuthController#request_token'

};