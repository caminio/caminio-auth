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

  return function processFlash( req, res, next ){
    res.locals.message = {
      error: req.flash('error') || null,
      info: req.flash('info') || null
    };
    if( res.locals.message.info.length < 1 )
      delete res.locals.message.info;
    if( res.locals.message.error.length < 1 )
      delete res.locals.message.error;
    next();
  };

};
