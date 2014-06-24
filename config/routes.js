/*
 * auth routes
 *
 */

module.exports.routes = {

  '/caminio/login': 'Auth::V1::AuthController#login',
  'POST /caminio/login': 'Auth::V1::AuthController#do_login',
  'POST /caminio/kick/:id': 'Auth::V1::AuthController#do_kick',

  '/caminio/reset_password': 'Auth::V1::AuthController#reset_password',
  'POST /caminio/reset_password': 'Auth::V1::AuthController#do_reset_password',

  'GET /caminio/accounts/mine': 'UsersController#mine',
  'autorest /caminio/accounts': 'User',
  'POST /caminio/accounts/:id/change_password': 'UsersController#change_password',
  'GET /caminio/accounts/:id/reset/:key': 'UsersController#reset',
  'POST /caminio/accounts/:id/reset/:key': 'UsersController#do_reset',
  'POST /caminio/accounts/:id/resend_credentials': 'UsersController#resend_credentials',
  'POST /caminio/accounts/:id/gen_api_key': 'UsersController#genApiKey',

  'GET /caminio/domains/:id/preview/:file*': 'DomainsController#preview',
  'GET /caminio/domains/:id/javascripts/:name/:folder/:file': 'DomainsController#scripts',

  'autorest /caminio/domains': 'Domain',
  'autorest /caminio/clients': 'Client',

  '/caminio/initial_setup': 'Auth::V1::AuthController#setup',
  'POST /caminio/initial_setup': 'Auth::V1::AuthController#do_setup',

  '/caminio/logout': 'Auth::V1::AuthController#logout',

  'POST /caminio/oauth/request_token': 'Auth::V1::OAuthController#request_token',
  'POST /caminio/oauth/api_token': 'Auth::V1::ApiController#request_token'

};
