var _  = require('lodash');

// global middleware actions to be run
// in every request
module.exports = function( caminio ){

  var Domain = caminio.models.Domain;

  return [ 
    addCurrentUserAndDomain
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
    if( !req.session.domainId )
      req.session.domainId = req.user.domains[0].id;

    res.locals.currentDomain = _.first(_.first( req.user.domains, { id: req.session.domainId }));

    if( res.locals.currentDomain )
      return next();

    Domain.findOne({ _id: req.session.domainId }, function( err, domain ){
      if( err ){ return next(err); }
      if( domain ){ res.locals.currentDomain = domain; }
    console.log('adding current user', domain);
      next();
    });

  }

}