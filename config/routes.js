/*
 * auth routes
 *
 */

module.exports.routes = {
  
  '/login': 'Auth::V1::AuthController#login',
  'POST /do_login': 'Auth::V1::AuthController#do_login'

}