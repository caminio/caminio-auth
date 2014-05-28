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

  'use strict';

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

    'index_w_apikey':[
      policies.ensureApiKey,
      function( req, res ){
        res.send('caminio api dashboard');
      }],

    'index_w_login_or_token':[
      policies.ensureLoginOrToken,
      function( req, res ){
        res.send('caminio login token dashboard');
      }],

    'index_w_login_or_api_or_token':[
      policies.ensureLoginOrApiOrToken,
      function( req, res ){
        res.send('caminio login api token dashboard');
      }]


  };

};
