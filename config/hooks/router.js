/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var express = require('../../node_modules/caminio/node_modules/express');

module.exports = function( caminio ){

  caminio.hooks.define( 'before', 'router', 'setupCSRF', setupCSRF );

  function setupCSRF(){

    if( !caminio.config.csrf || !caminio.config.csrf.enable )
      return;

    caminio.express.use(express.csrf());
    caminio.express.use(function(req, res, next){
      res.locals.csrf = req.csrfToken();
      next();
    });

  }

};