/**
 * @class UsersController
 */
module.exports = function UsersController( caminio, policies, middleware ){

  return {

    _before: {
      '*!(reset)': policies.ensureLogin
    },

    /**
     * reset the user's password
     * @method reset
     */
    'reset': [
      function( req, res ){
        res.caminio.render();
      }]
  };

};