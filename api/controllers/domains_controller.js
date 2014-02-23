/**
 * @class UsersController
 */
module.exports = function UsersController( caminio, policies, middleware ){

  var async         = require('async');
  var User          = caminio.models.User;
  var Domain        = caminio.models.Domain;
  var util          = require('caminio/util');

  return {

    _before: {
      '*': policies.ensureLogin
    },

    'index': [
      requireSuperUser,
      function( req, res ){
        Domain.find().populate('owner').exec( function( err, domains ){
          if( err ){ return res.json( 500, { error: 'server_error', details: err }); }
          if( req.header('namespaced') ){
            if( req.header('sideload') ){
              var owners = [];
              for( var i in domains ){
                domains[i] = domains[i].toObject();
                owners.push( domains[i].owner );
                domains[i].user = domains[i].owner._id.toString();
              }
              return res.json( { domains: domains, users: owners } );
            }
            return res.json( { domains: domains } );
          }
          res.json( domains );
        });
      }
    ],

    /**
     * override autorest's create method
     */
    'create': [
      requireSuperUser,
      findUser,
      createUserIfNotFound,
      createDomain,
      updateCamDomainInUser,
      function(req,res){
        if( req.header('namespaced') )
          return res.json({ domain: req.domain });
        res.json( req.domain );
      }],

      'destroy': [
        getDomain,
        requireSuperUserOrOwner,
        destroyUsers,
        destroyDomain,
        function( req, res ){
          req.session.camDomainId = null;
          res.json(200, { meta: { affectedUsers: req.affectedUsers }});
        }
      ]

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
    User.findOne({ email: req.body.domain.user.email })
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
      email: req.body.domain.user.email, 
      password: req.body.domain.user.password || (new Date()).getTime().toString()}, function( err, user ){
        if( err && err.name && err.name === 'ValidationError' )
          return res.json( 422, util.formatErrors(err) );
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
        if( err && err.name && err.name === 'ValidationError' )
          return res.json( 422, util.formatErrors(err) );
        if( err ){ return res.json(500, { error: 'server_error', details: err } ); }
        req.domain = domain;
        next();
    });
  }

  /**
   * update the camDomains field in the user obj
   */
  function updateCamDomainInUser( req, res, next ){
    if( !req.user )
      return next();
    req.user.camDomains = req.domain;
    req.user.save( function( err ){
      if( err ){ return res.json(500, { error: 'server_error', details: err } ); }
      next();
    });
  }

  function requireSuperUserOrOwner( req, res, next ){
    if( res.locals.currentUser.isSuperUser() )
      return next();
    if( req.domain.owner.toString() === req.user.id )
      return next();
    return res.json(403, { error: 'insufficient_rights' });
  }

  function destroyUsers( req, res, next ){
    User.find({ camDomains: req.domain.id }, function( err, users ){
      if( err ){ return res.json(500, { error: 'server_error', details: err, fn: 'destroyUsers' } ); }
      async.each( users, function( user, nextUser ){
        if( user.camDomains.length === 1 )
          user.remove( function( err ){
            req.affectedUsers = req.affectedUsers || 0;
            req.affectedUsers += 1;
            if( err ){ return res.json(500, { error: 'server_error', details: err, fn: 'destroyUsers#removeUser' } ); }
            nextUser();
          });
        else
          nextUser();
      }, next);
    });
  }

  function destroyDomain( req, res, next ){
    req.domain.remove( function( err ){
      if( err ){ return res.json(500, { error: 'server_error', details: err, fn: 'destroyDomain' } ); }
      next();
    });
  }

  function getDomain( req, res, next ){
    Domain.findOne({ _id: req.param('id') }, function( err, domain ){
      if( err ){ return res.json(500, { error: 'server_error', details: err } ); }
      if( !domain ){ return res.json(404, { erro: 'not_found' }); }
      req.domain = domain;
      next();
    });
  }

};