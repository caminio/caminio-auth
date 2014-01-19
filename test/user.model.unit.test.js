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
  , expect = helper.chai.expect;


describe('User', function(){

  before( function(done){
    helper.initApp( this, function(){ caminio = helper.caminio; done(); });
  });

  describe('attributes', function(){

    before( function(){
      this.user = new caminio.models.User( fixtures.User.attributes() );
    });

    describe('email', function(){

      it('fails without', function( done ){
        var user = new caminio.models.User({ email: '' });
        user.validate( function( err ){
          expect( err.errors ).to.have.property('email');
          done();
        });
      });

      it('passes with', function( done ){
        this.user.validate( function( err ){
          expect( err ).to.be.undefined;
          done();
        });
      });

      it('fails with invalid address', function( done ){

        var user = new caminio.models.User({ email: 'test.no.at' });
        user.validate( function( err ){
          expect( err.errors ).to.have.property('email');
          done();
        });
      });

    });

  });
  

});