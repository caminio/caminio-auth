/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */


module.exports = function( caminio ){

  'use strict';

  var express = require('express');

  return setupCSRF;

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
