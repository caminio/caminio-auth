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
        res.send('dashboard');
      }]
  }

}