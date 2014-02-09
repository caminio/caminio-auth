/**
 * @class UsersController
 */
module.exports = function UsersController( caminio, policies, middleware ){

  var async         = require('async');
  var User          = caminio.models.User;
  var Domain        = caminio.models.Domain;

  return {

    _before: {
      '*': policies.ensureLogin
    },

    /**
     * override autorest's create method
     */
    'create': [
      requireSuperUser,
      findUser,
      createUserIfNotFound,
      createDomain,
      function(req,res){
        res.json( req.domain );
      }],

  };

  /**
   * only superusers can create new domains
   */
  function requireSuperUser( req, res, next ){
    if( res.locals.currentUser.isSuperUser() )
      return next();
  }

  /**
   * find user and fill req.user
   */
  function findUser( req, res, next ){
    User.findOne({ email: req.body.domain.owner.email })
      .exec( function( err, user ){
        if( err ){ return res.json(500, { error: 'server_error', details: err } ); }
        req.user = user;
        next();
      });
  }

  /**
   * if user was not found, create it by given email
   * attr
   */
  function createUserIfNotFound( req, res, next ){
    if( req.user )
      return next();
    User.create({ 
      email: req.body.domain.owner.email, 
      password: req.body.domain.owner.password || (new Date()).getTime().toString()}, function( err, user ){
        if( err ){ return res.json(500, { error: 'server_error', details: err } ); }
        req.user = user;
        next();
      });
  }

  /**
   * create domain if req.user obj is present
   */
  function createDomain( req, res, next ){
    if( !req.user )
      return next();
    Domain.create({
      name: req.body.domain.name,
      title: req.body.domain.title,
      description: req.body.domain.description,
      owner: req.user }, function( err, domain ){      
        if( err ){ return res.json(500, { error: 'server_error', details: err } ); }
        req.domain = domain;
        next();
    });
  }

};