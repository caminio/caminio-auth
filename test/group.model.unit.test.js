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


describe('Group', function(){

  before( function(done){
    helper.initApp( this, function(){ caminio = helper.caminio; done(); });
  });

  describe('attributes', function(){

    before( function(){
      this.group = new caminio.models.Group( fixtures.Group.attributes() );
    });

    describe('name', function(){

      it('fails without', function( done ){
        var group = new caminio.models.Group({ name: '' });
        group.validate( function( err ){
          expect( err.errors ).to.have.property('name');
          done();
        });
      });

      it('passes with', function( done ){
        this.group.validate( function( err ){
          expect( err ).to.be.undefined;
          done();
        });
      });

    });

  });
  

});