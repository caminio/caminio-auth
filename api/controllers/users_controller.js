/**
 * @class UsersController
 */
module.exports = function UsersController( caminio, policies, middleware ){

  var User          = caminio.models.User;

  return {

    _before: {
      '*!(reset,do_reset)': policies.ensureLogin
    },

    /**
     * reset the user's password
     * @method reset
     */
    'reset': [
      getUserById,
      checkValidRequest,
      middleware.processFlash,
      function(req,res,next){ 
        if( !res.locals.message.error )
          res.locals.message.info = req.i18n.t('auth.enter_new_password');
        next();
      },
      function( req, res ){
        res.locals.userId = req.params.id;
        res.locals.key = req.params.key;
        res.caminio.render();
      }],

    /**
     * do reset the user's password
     * @method do_reset
     */
    'do_reset': [
      getUserById,
      checkValidRequest,
      checkPassword,
      function(req,res,next){
        if( !req.user ){
          req.flash('error', req.i18n.t('auth.security_transgression'));
          return res.redirect('/caminio/login');
        }
        next();
      },
      updateUserPassword,
      function( req, res ){
        res.redirect('/caminio/login');
      }]

  };

  /**
   * @method getUserById
   * @private
   */
  function getUserById(req,res,next){
    User.findOne({ _id: req.params.id })
    .exec( function( err, user ){
      if( user ){ req.user = user; }
      next();
    });
  }

  /**
   * @method updateUserPassword
   */
  function updateUserPassword(req,res,next){
    req.user.password = req.body.password;
    req.user.save( function( err ){
      if( err ){ return next(err); }
      req.user.populate('domains', function(err,user){
        user.camDomains.forEach( function(domain){
          caminio.audit.log( domain.name, 
            'password has been changed for user',req.user.id,
            ' (',req.user.fullName,') IP:',
            req.headers['x-forwarded-for'] || req.connection.remoteAddress );  
        });
        req.flash('info', req.i18n.t('user.password_saved'));
        next();
      });
    });
  }

  /**
   * @method checkUserData
   * @private
   */
  function checkValidRequest(req,res,next){
    if( !req.user ){ return next(); }
    if( !( req.user.confirmation && req.user.confirmation.key === req.params.key ) ){
      req.flash('error', req.i18n.t('auth.confirmation_missmatch'));
      return next();
    }
    if( !( req.user.confirmation && req.user.confirmation.expires < new Date() ) ){
      req.flash('error', req.i18n.t('auth.confirmation_expired') );
      return next();
    }
    next();
  }

  /**
   * @method checkPassword
   * @private
   */
  function checkPassword( req,res,next ){
    var passwordValidation = req.user.checkPassword( req.body.password, req.body.password_confirm );
    if( !passwordValidation[0] ){
      req.flash('error', req.i18n.t('user.errors.'+passwordValidation[1]));
      return res.redirect('/caminio/accounts/'+req.params.id+'/reset/'+req.params.key);
    }
    next();
  }

};