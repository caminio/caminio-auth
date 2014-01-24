var _  = require('lodash');

// global middleware actions to be run
// in every request
module.exports = function( caminio ){

  var Domain = caminio.models.Domain;

  return [ 
    addCurrentUserAndDomain,
    addAllowedApps
  ];

  /**
   *
   * adds the currentUser and currentDomain object
   * to res.locals
   *
   * @method addCurrentDomain
   *
   */
  function addCurrentUserAndDomain( req, res, next ){
    if( !req.user ){ return next(); }
    res.locals.currentUser = req.user;
    if( !req.session.domainId && req.user.domains.length > 0 )
      req.session.domainId = req.user.domains[0].id;

    res.locals.currentDomain = _.first(_.first( req.user.domains, { id: req.session.domainId }));

    if( res.locals.currentDomain )
      return next();

    Domain.findOne({ _id: req.session.domainId }, function( err, domain ){
      if( err ){ return next(err); }
      if( domain ){ res.locals.currentDomain = domain; }
      next();
    });

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

}