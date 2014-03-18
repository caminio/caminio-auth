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

    describe('auto generates an fqdn', function(){

      it('has fqdn set before validation', function( done ){
        var domain = new caminio.models.Domain({ name: 'Test Company' });
        domain.validate( function(err){
          expect( err ).to.be.undefined;
          expect( domain.fqdn ).to.eql('test-company.camin.io');
          done();
        });
      });

    });


    describe('content path of domain (images/webpages)', function(){

      it('#getContentPath', function( done ){
        var domain = new caminio.models.Domain({ name: 'Test Company' });
        domain.validate( function(err){
          expect( domain.getContentPath() ).to.eql( process.cwd()+'/test/support/content/test-company_camin_io' );
          done();
        });
      });

    });

    describe('preference default setup helpers', function(){

      it('#preferences.quota', function( done ){
        var domain = new caminio.models.Domain({ name: 'Test Company2' });
        domain.save( function(err){
          expect( err ).to.be.null;
          expect( domain.preferences ).to.have.property('quota');
          expect( domain.preferences.quota ).to.eql( 100 * 1000 * 1000 );
          done();
        });
      });

      it('#preferences.uploadLimit', function( done ){
        var domain = new caminio.models.Domain({ name: 'Test Company3' });
        domain.save( function(err){
          expect( err ).to.be.null;
          expect( domain.preferences ).to.have.property('uploadLimit');
          expect( domain.preferences.uploadLimit ).to.eql( 5 * 1000 * 1000 );
          done();
        });
      });

      it('#preferences.isCaminioHosted', function( done ){
        var domain = new caminio.models.Domain({ name: 'Test Company4' });
        domain.save( function(err){
          expect( err ).to.be.null;
          expect( domain.preferences ).to.have.property('isCaminioHosted');
          expect( domain.preferences.isCaminioHosted ).to.be.true;
          done();
        });
      });

      it('#preferences.availableLangs', function( done ){
        var domain = new caminio.models.Domain({ name: 'Test Company5', lang: 'de' });
        domain.save( function(err){
          expect( err ).to.be.null;
          expect( domain.preferences ).to.have.property('availableLangs');
          expect( domain.preferences.availableLangs ).to.eql(['en','de']);
          done();
        });
      });

    });


  });
  

});