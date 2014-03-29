/**
 * @class ClientsController
 */
module.exports = function ClientsController( caminio, policies, middleware ){

  return {

    _before: {
      '*': policies.ensureLogin,
      'create': checkAndRemoveEmptySecret
    },

  };

  function checkAndRemoveEmptySecret( req, res, next ){
    if( req.body.client )
      delete req.body.client.secret;
    next();
  }

};