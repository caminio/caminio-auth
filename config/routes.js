/*
 * auth routes
 *
 */

module.exports.routes = {
  
  '/login': 'Auth::V1::AuthController#login',
  'POST /login': 'Auth::V1::AuthController#do_login'

}