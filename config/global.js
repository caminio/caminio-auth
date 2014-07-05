// global middleware actions to be run
// in every request
module.exports = function( caminio ){

  'use strict';

  var _       = require('lodash');
  var fs      = require('fs');
  var Domain  = caminio.models.Domain;

  return [ 
    addCurrentDomain,
    addDomainSettings,
    addCurrentUser,
    // caminifyModels,
    addAllowedApps
  ];

  /**
   *
   * adds the currentUser
   * to res.locals
   *
   * @method addCurrentDomain
   *
   */
  function addCurrentDomain( req, res, next ){

    if( !req.user )
      return next();

    if( req.param('camDomainId') && ( _.contains( req.user.camDomains, req.param('camDomainId') ) || req.user.superuser ) )
      req.session.camDomainId = req.param('camDomainId');

    // if no session or no explicit request, set
    // currentDomain to user's first domain
    if( req.session.camDomainId )
      res.locals.currentDomain = _.first(_.first( req.user.camDomains, { id: req.session.camDomainId }));
    else
      res.locals.currentDomain = req.user.camDomains[0];

    if( res.locals.currentDomain )
      return next();

    Domain.findOne({ _id: req.session.camDomainId }, function( err, domain ){
      if( err ){ return next(err); }
      if( domain ){ res.locals.currentDomain = domain; }
      next();
    });

  }

  /**
   *
   * adds the currentUser
   * to res.locals
   *
   * @method addCurrentDomain
   *
   */
  function addCurrentUser( req, res, next ){

    res.locals.currentUser = res.locals.currentUser || req.user;

    next();

  }

  /**
   * add <domain.getContentPath()>/config/site.js
   */
  function addDomainSettings( req, res, next ){
  
    if( !res.locals.currentDomain )
      return next();

    if( fs.existsSync( res.locals.currentDomain.getContentPath()+'/config/site.js' ) )
      res.locals.domainSettings = require( res.locals.currentDomain.getContentPath()+'/config/site.js');

    next();

  }

  /**
   * adds allowedApps collected from currentDomain
   * object
   *
   * @method addAllowedApps
   *
   */
  function addAllowedApps( req, res, next ){
    if( !res.locals.currentDomain )
      return next();
    res.locals.allowedApps = res.locals.currentDomain.allowedApps();
    next();
  }

  //function caminifyModels( req, res, next ){

  //  _.each( caminio.models, function( Model ){
  //    if( !Model.schema.caminify )
  //      return;
  //    caminio.logger.debug('caminified', Model.modelName);

  //    Model.schema.virtual('currentDomain').get( getCurrentDomain );
  //    console.log(Object.keys(Model), Object.keys(Model.model));
  //    Model.schema.methods.currentUser = getCurrentDomain;
  //  });

  //  next();

  //  function getCurrentDomain(){
  //    return 'ME';
  //    //return res.locals.currentDomain;
  //  }

  //}

};
