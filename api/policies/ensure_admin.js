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

  return function ensureAdmin(req, res, next) {
    if( !res.locals.currentUser && !res.locals.currentUser.isAdmin( res.locals.currentDomain ) )
      return res.json( 403, { error: 'insufficient rights' });
    next();
  };

};
