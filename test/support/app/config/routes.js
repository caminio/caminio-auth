/*
 * routes
 *
 */

module.exports.routes = {

  '/': 'Test::DashboardController#index',

  '/w_token': 'Test::DashboardController#index_w_token',

  '/w_login_or_token': 'Test::DashboardController#index_w_login_or_token',

  '/caminio': 'Test::DashboardController#index'
  
}