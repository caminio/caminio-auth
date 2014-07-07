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

  return function ensureLogin(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl || req.url;
      return res.redirect('/caminio/login');
    }
    next();
  }

}
