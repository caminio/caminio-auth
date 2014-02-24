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
      helper.cleanup( caminio, function(){
        caminio.models.User.create({ email: 'test@example.com', password: 'test' }, function( err, u ){ user = u; done(); });
        /*caminio.models.User.create( fixtures.User.attributes(), function( err, u ){
          user = u;
          done(); 
        })
*/
      });
    });
  });

  describe('/login', function(){

    it('GET form', function(done){
      request.get( helper.url+'/login' )
      .end(function(err,res){
        expect(err).to.be.null;
        expect(res.text).to.match(/type="password"/);
        expect(res.status).to.eq(200);
        done();
      });
    });

    it('POST authenticates', function(done){
      var test = this;
      test.agent.post( helper.url+'/login' )
      .send({ username: user.email, password: user.password })
      .end(function(err,res){
        expect(err).to.be.null;
        expect(res.status).to.eq(200);
        expect(res.text).to.match(/caminio dashboard/);
        done();
      });
    });

  });

  describe('GET /caminio', function(){

    it('redirects to login if unauth', function(done){
      var test = this;
      test.agent = helper.agent();
      request.get( helper.url )
      .end(function(err,res){
        expect(err).to.be.null;
        expect(res.text).to.match(/type="password"/);
        expect(res.status).to.eq(200);
        done();
      });
    });

    it('shows page if logged in', function(done){
      var test = this;
      test.agent.post( helper.url+'/login' )
      .send({ username: user.email, password: user.password })
      .end(function(err,res){
        test.agent.get( helper.url )
        .end(function(err,res){
          expect(err).to.be.null;
          expect(res.text).to.match(/caminio dashboard/);
          expect(res.status).to.eq(200);
          done();
        });
      });
    });

  });

  describe('GET /logout', function(){

    before( function(done){
      var test = this;
      test.agent.post( helper.url+'/login' )
      .send({ username: user.email, password: user.password })
      .end(function(err,res){
        done();
      });
    });

    it('successfully logs the user off', function(done){
      var test = this;
      test.agent.get( helper.url+'/logout' )
      .end(function(err,res){
        expect(err).to.be.null;
        expect(res.text).to.match(/type="password"/);
        expect(res.status).to.eq(200);
        done();
      });
    });

  });

});
