/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

'use strict';

var helper = require('./helper');
var caminioUtil = require('caminio/util');
var fixtures = helper.fixtures;
var caminio;
var test;
var expect = helper.chai.expect;

describe('APIKey authentication integration', function(){

  before( function(done){
    test = this;
    helper.initApp( test, function(){
      caminio = helper.caminio;
      helper.cleanup( caminio, function(){
        createUserAndClient( done );
      });
    });
  });

  describe('get data with API login', function(){

    it('invalid request (Authorization header missing)', function(done){
      helper.agent()
      .get( helper.url.replace('/caminio','')+'/w_apikey' )
      .end( function( err, res ){
        expect(res.status).to.eq(400);
        done();
      });
    });

    it('invalid request (Authorization header wrong)', function(done){
      helper.agent()
      .get( helper.url.replace('/caminio','')+'/w_apikey' )
      .set( 'Authorization', 'API ' +this.user.apiPublicKey)
      .end( function( err, res ){
        expect(res.status).to.eq(403);
        done();
      });
    });

    it('invalid API key', function(done){
      helper.agent()
      .get( helper.url.replace('/caminio','')+'/w_apikey' )
      .set( 'Authorization', 'API-PUBLIC-KEY 2902986029386236' )
      .end( function( err, res ){
        expect(res.status).to.eq(403);
        done();
      });
    });

    it('valid API key', function(done){
      helper.agent()
      .get( helper.url.replace('/caminio','')+'/w_apikey' )
      .set( 'Authorization', 'API-PUBLIC-KEY '+this.user.apiPublicKey )
      .end( function( err, res ){
        expect(res.status).to.eq(200);
        expect(res.text).to.eql('caminio api dashboard');
        done();
      });
    });

  });

  describe('/w_login_or_api_or_token', function(){

    it('valid API key', function(done){
      helper.agent()
      .get( helper.url.replace('/caminio','')+'/w_login_or_api_or_token' )
      .set( 'Authorization', 'API-PUBLIC-KEY '+this.user.apiPublicKey )
      .end( function( err, res ){
        expect(res.status).to.eq(200);
        expect(res.text).to.eql('caminio login api token dashboard');
        done();
      });
    });

  });

});

function createUserAndClient( cb ){
  var attrs = fixtures.User.attributes();
  caminio.models.User.create( attrs, function( err, user ){
    test.user = user;
    cb();
  });
}
