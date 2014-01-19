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


describe('Domain', function(){

  before( function(done){
    helper.initApp( this, function(){ caminio = helper.caminio; done(); });
  });

  describe('attributes', function(){

    before( function(){
      this.domain = new caminio.models.Domain( fixtures.Domain.attributes() );
    });

    describe('name', function(){

      it('fails without', function( done ){
        var domain = new caminio.models.Domain({ name: '' });
        domain.validate( function( err ){
          expect( err.errors ).to.have.property('name');
          done();
        });
      });

      it('passes with', function( done ){
        this.domain.validate( function( err ){
          expect( err ).to.be.undefined;
          done();
        });
      });

    });

  });
  

});