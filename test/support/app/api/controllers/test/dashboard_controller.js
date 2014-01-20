/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

module.exports = function DashboardController( caminio, policies, middleware ){

  return {

    'index':[
      policies.ensureLogin,
      function( req, res ){
        res.send('caminio dashboard');
      }],

    'index_w_token':[
      policies.ensureToken,
      function( req, res ){
        res.send('caminio token dashboard');
      }],

    'index_w_login_or_token':[
      policies.ensureLoginOrToken,
      function( req, res ){
        res.send('caminio login token dashboard');
      }]


  }

}