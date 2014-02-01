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

    describe('checkPassword', function(){

      it('must be present', function(){
        expect(this.user.checkPassword('')[0]).to.be.false;
        expect(this.user.checkPassword('')[1]).to.eql('too_short');
      });

      it('must be longer than 6 chars', function(){
        expect(this.user.checkPassword('12345')[0]).to.be.false;
        expect(this.user.checkPassword('')[1]).to.eql('too_short');
      });

      it('if confirmation is entered must match confirmation', function(){
        expect(this.user.checkPassword('123456','111')[0]).to.be.false;
        expect(this.user.checkPassword('123456','111')[1]).to.eql('confirmation_missmatch')
      });

      it('must have a 1+ lower case character', function(){
        expect(this.user.checkPassword('123456A?')[0]).to.be.false;
        expect(this.user.checkPassword('123456A?')[1]).to.eql('requirements_not_met');
      });

      it('must have a 1+ upper case character', function(){
        expect(this.user.checkPassword('123456a?')[0]).to.be.false;
        expect(this.user.checkPassword('123456a?')[1]).to.eql('requirements_not_met');
      });

      // it('must have a special char', function(){
      //   expect(this.user.checkPassword('123456Az')[0]).to.be.false;
      //   expect(this.user.checkPassword('123456Az')[1]).to.eql('requirements_not_met');
      // });

      it('passes', function(){
        expect(this.user.checkPassword('123456A?z')[0]).to.be.false;
        expect(this.user.checkPassword('123456A?z')[1]).to.eql('requirements_not_met');
      });

    });

  });
  

});