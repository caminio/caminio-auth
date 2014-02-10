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

  return function userSignup(req, res, next) {
    if( caminio.config.signup && caminio.config.signup === 'public' )
      return next();
    if( res.locals.currentUser.isAdmin() )
      return next();
    req.flash('error', req.i18n.t('insufficient_rights') );
    if( res.locals.currentUser )
      return res.redirect('/caminio');
    res.redirect('/caminio/login');
  };

};