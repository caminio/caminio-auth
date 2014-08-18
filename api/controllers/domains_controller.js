/**
 * @class DomainsController
 */
module.exports = function DomainsController( caminio, policies, middleware ){

  var async         = require('async');
  var User          = caminio.models.User;
  var Domain        = caminio.models.Domain;
  var util          = require('caminio/util');
  var mkdirp        = require('mkdirp');
  var fs            = require('fs');
  var join          = require('path').join;
  var _             = require('lodash');

  return {

    _policies: {
      '*': policies.ensureLogin
    },

    'index': [
      requireSuperUser,
      function( req, res ){
        Domain
          .find()
          .sort({ name: 'asc' })
          .populate('owner')
          .exec( function( err, domains ){
          if( err ){ return res.json( 500, { error: 'server_error', details: err }); }
          if( req.header('namespaced') ){
            if( req.header('sideload') ){
              var owners = [];
              for( var i in domains ){
                domains[i] = domains[i].toObject();
                owners.push( domains[i].owner );
                domains[i].user = domains[i].owner._id.toString();
                delete domains[i].owner;
              }
              return res.json( { domains: domains }); //, users: owners } );
            }
            return res.json( { domains: domains } );
          }
          res.json( domains );
        });
      }
    ],

    'show': [
      requireSuperUserOrMember,
      function( req, res ){
        Domain.find({ _id: req.param('id') }).populate('owner').exec( function( err, domains ){
          if( err ){ return res.json( 500, { error: 'server_error', details: err }); }
          var result = domains;
          if( req.header('namespaced') )
            result = { domains: JSON.parse(JSON.stringify(domains)) };

          if( req.header('sideload') )
            result = util.transformJSON( result, req.header('namespaced') );

          res.json( result );
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
      sendWelcome,
      updateCamDomainInUser,
      createDomainDirectory,
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
    ],

    /**
     * serve static files in case of development mode;
     */
    'preview': [
      getDomain,
      function( req, res ){
        var filename = join(res.locals.currentDomain.getContentPath(), 'public', 'files', req.originalUrl.split('preview/')[1]);
        if( !fs.existsSync( filename ) )
          return res.send(404, 'File not found');
        return res.sendfile( filename );
      }],

    /**
     * serve static files in case of development mode;
     */
    'scripts': [
      getDomain,
      function( req, res ){
        var filename = join(res.locals.currentDomain.getContentPath(), 'layouts', 
                            req.param('name'), 
                            'javascripts', 
                            req.param('folder'), 
                            req.param('file'));
        if( !fs.existsSync( filename ) )
          return res.send(404, 'File not found');
        return res.sendfile( filename );
      }],

  };

  /**
   * only superusers can create new domains
   */
  function requireSuperUser( req, res, next ){
    if( res.locals.currentUser.isSuperUser() )
      return next();
    return res.json(403, { error: 'security_transgression' } );
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
      firstname: req.body.domain.user.firstname,
      lastname: req.body.domain.user.lastname,
      lang: req.body.domain.lang || 'en',
      apiKey: util.uid(48),
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
      fqdn: req.body.domain.fqdn,
      allowedAppNames: req.body.domain.allowedAppNames,
      lang: req.body.domain.lang,
      usersQuota: req.body.domain.usersQuota || 1,
      diskQuotaM: req.body.domain.diskQuotaM || 50,
      diskUploadLimitM: req.body.domain.diskuploadLimitM || 5,
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
    req.user.camDomains.push( req.domain._id );
    req.user.roles = req.user.roles || {};
    req.user.roles[ req.domain._id ] = 100;
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

  function requireSuperUserOrMember( req, res, next ){
    if( res.locals.currentUser.isSuperUser() )
      return next();
    console.log('here', req.param('id'), req.user.camDomains[0], _.find(req.user.camDomains, { id: req.param('id') }));
    if( _.find(req.user.camDomains, { id: req.param('id') }))
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

  /**
   * @method sendWelcome
   * @private
   */
  function sendWelcome( req, res, next ){
    caminio.mailer.send(
      req.user.email,
      req.i18n.t('auth.mailer.subject_welcome'), 
      'users/welcome', 
      { 
        locals: {
          welcome: true,
          user: req.user,
          domain: res.locals.currentDomain,
          creator: res.locals.currentUser,
          url: ( caminio.config.hostname + '/caminio/accounts/' + req.user.id + '/reset/' + req.user.confirmation.key)
        } 
      },
      function( err ){
        if( err ){ return res.json(err); }
        next();
      });
  }

  /**
   * @method createDomainDirectory
   * @private
   */
  function createDomainDirectory( req, res, next ){
    if( !fs.existsSync( req.domain.getContentPath() ) )
      mkdirp.sync( join( req.domain.getContentPath(), 'config') );
    if( fs.existsSync( join( req.domain.getContentPath(), 'config/site.js' ) ) )
      return next();
    var tmplFileData = fs.readFileSync( join( __dirname, '..', '..', 'lib', 'templates', 'site.js'), 'utf8' );
    fs.writeFileSync( join( req.domain.getContentPath(), 'config/site.js' ), tmplFileData );
    next();  
  }

};
