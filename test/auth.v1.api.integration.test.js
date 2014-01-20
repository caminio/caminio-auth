/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var helper = require('./helper')
  , fixtures = helper.fixtures
  , caminio
  , user
  , request = require('superagent')
  , expect = helper.chai.expect;

describe('Auth integration', function(){

  before( function(done){
    helper.initApp( this, function(){ 
      caminio = helper.caminio;
      caminio.models.User.create( fixtures.User.attributes(), function( err, u ){
        user = u;
        done(); 
      })
    });
  });

  describe('GET /caminio', function(){

    it('redirects to login if unauth', function(done){
      request.get( helper.url+'/caminio' )
      .end(function(err,res){
        expect(err).to.be.null;
        expect(res.text).to.match(/type="password"/);
        expect(res.status).to.eq(200);
        done();
      });
    });
  });

  describe('POST /login', function(){

    it('authenticates', function(done){
      request.post( helper.url+'/do_login' )
      .send({ username: user.email, password: user.password })
      .end(function(err,res){
        expect(err).to.be.null;
        expect(res.status).to.eq(200);
        done();
      });
    });

  });

});
