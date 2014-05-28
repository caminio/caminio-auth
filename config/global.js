var _     = require('lodash');

// global middleware actions to be run
// in every request
module.exports = function( caminio ){

  var Domain = caminio.models.Domain;

  return [ 
    addCurrentDomain,
    addCurrentUser,
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

    if( req.param('camDomainId') )
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

};
