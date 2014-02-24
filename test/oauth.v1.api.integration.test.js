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
  , test
  , request = require('superagent')
  , expect = helper.chai.expect;

describe('OpenAuth2 integration', function(){

  before( function(done){
    test = this;
    helper.initApp( test, function(){
      caminio = helper.caminio;
      helper.cleanup( caminio, function(){
        createUserAndClient( done );
      });
    });
  });

  describe('/oauth/request_token', function(){

    it('valid client', function(done){
      helper.agent()
      .post( helper.url+'/oauth/request_token' )
      .send({ client_id: test.client.id, client_secret: test.client.secret })
      .end( function( err, res ){
        expect(res.status).to.eq(200);
        test.token = JSON.parse(res.text);
        done();
      });
    });

  });

  describe('/w_token', function(){

    before( function( done ){
      var self = this;
      helper.agent()
      .post( helper.url+'/oauth/request_token' )
      .send({ client_id: test.client.id, client_secret: test.client.secret })
      .end( function( err, res ){
        self.token = JSON.parse(res.text);
        done();
      });
    });

    it('without token', function(done){
      helper.agent()
      .get( helper.url.replace('/caminio','')+'/w_token' )
      .end(function(err,res){
        expect(res.status).to.eq(403);
        done();
      });
    });

    it('with token', function(done){
      var test = this;
      this.agent
      .get( helper.url.replace('/caminio','')+'/w_token' )
      .set( 'Authorization', 'Bearer '+this.token.token )
      .end(function(err,res){
        expect(res.status).to.eq(200);
        expect(res.text).to.match(/caminio token dashboard/);
        done();
      });
    });

  });

  describe('/w_login_or_token', function(){

    describe('with token', function(){

      before( function( done ){
        var self = this;
        helper.agent()
        .post( helper.url+'/oauth/request_token' )
        .send({ client_id: test.client.id, client_secret: test.client.secret })
        .end( function( err, res ){
          self.token = JSON.parse(res.text);
          done();
        });
      });
    
      it('redirects to html login form if no Authorization in header', function(done){
        helper.agent()
        .get( helper.url.replace('/caminio','')+'/w_login_or_token' )
        .end(function(err,res){
          expect(res.status).to.eq(200);
          expect(res.text).to.match(/type="password"/);
          done();
        });
      });

      it('forbidden', function(done){
        helper.agent()
        .get( helper.url.replace('/caminio','')+'/w_login_or_token' )
        .set( 'Authorization', 'Bearer 123' )
        .end(function(err,res){
          expect(res.status).to.eq(403);
          done();
        });
      });

      it('with token', function(done){
        this.agent
        .get( helper.url.replace('/caminio','')+'/w_login_or_token' )
        .set( 'Authorization', 'Bearer '+this.token.token )
        .end(function(err,res){
          expect(res.status).to.eq(200);
          expect(res.text).to.match(/caminio login token dashboard/);
          done();
        });
      });

    });

    describe('with login', function(){

      it('redirects to login', function(done){
        helper.agent()
        .get( helper.url.replace('/caminio','')+'/w_login_or_token' )
        .end(function(err,res){
          expect(err).to.be.null;
          expect(res.text).to.match(/type="password"/);
          expect(res.status).to.eq(200);
          done();
        });
      });

      it('grants access with login cookies', function(done){
        var agent = helper.agent();
        agent
        .post( helper.url+'/login' )
        .send({ username: test.user.email, password: test.user.password })
        .end(function(err,res){
          agent.get( helper.url.replace('/caminio','')+'/w_login_or_token' )
          .end(function(err,res){
            expect(err).to.be.null;
            expect(res.status).to.eq(200);
            expect(res.text).to.match(/caminio login token dashboard/);
            done();
          });
        });
      });

    });

  });

  describe('token expires', function(){

    before( function( done ){
      var self = this;
      helper.agent()
      .post( helper.url+'/oauth/request_token' )
      .send({ client_id: test.client.id, client_secret: test.client.secret })
      .end( function( err, res ){
        self.token = JSON.parse(res.text);
        caminio.models.Token.update({_id: self.token.id}, { expires: { at: (new Date() - 2 * caminio.config.token.timeout ) } }, function( err ){
          done();
        });
      });
    });

    it('fails', function(done){
      helper.agent()
      .get( helper.url.replace('/caminio','')+'/w_token' )
      .end(function(err,res){
        expect(res.status).to.eq(403);
        done();
      });
    });

  });

});

function createUserAndClient( cb ){
  caminio.models.User.create( fixtures.User.attributes(), function( err, user ){
    test.user = user;
    caminio.models.Client.create({ user: user }, function( err, client ){
      test.client = client;
      cb();
    });
  });
}