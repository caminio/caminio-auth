/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var passport = require('passport');

module.exports = function( caminio ){
    
  return function ensureBasicOrLogin(req, res, next) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      
      if( req.header('Authorization') )
        return passport.authenticate('basic', { session: false })( req, res, next );
      else{
        req.session.returnTo = req.originalUrl || req.url;
        return res.redirect('/caminio/login');
      }
      
    }

    next();

  };

};