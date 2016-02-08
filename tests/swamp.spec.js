"use strict"

let expect = require("chai").expect;
let swamp = require("../lib/swamp");
let swaggerFilePath =  __dirname + "/pets.yaml";

describe('Swamp Factory', function(){

    describe('Constructor', function(){
        it('should load valid swagger files', function(done){
            expect(swamp.create(swaggerFilePath)).to.be.fulfilled;
            done();
        });

        it('should throw an error when loading swagger files that don\'t exist', function(done){
            expect(swamp.create('fake file path')).to.be.rejected;
            done();
        });
    });

    describe('Base Definitions', function(){

        it('should be able to access basic swagger definitions', function(){
            return swamp.create(swaggerFilePath)
                .then(function (swaggerApi) {
                    let tag = swaggerApi.get('Tag');

                    expect(tag).to.eql({
                        id: null,
                        name: null
                    });

                });
        });

        it('should throw an error when a definition does not exist', function(){
            return swamp.create(swaggerFilePath)
                .then(function (swaggerApi) {
                    expect(function(){ swaggerApi.get('FakeTag'); }).to.throw(TypeError);
                });
        });

        it('should initialize arrays as an array', function(){
            return swamp.create(swaggerFilePath)
                .then(function (swaggerApi) {
                    let Pet = swaggerApi.get('Pet');
                    expect(Pet.tags).to.be.an('array');
                });
        });

        it('should initialize nested references as the correct model', function(){
            return swamp.create(swaggerFilePath)
                .then(function (swaggerApi) {
                    let Pet = swaggerApi.get('Pet');
                    expect(Pet.category).to.be.an("Object");
                    expect(Pet.category).to.eql({id:null, name:null});
                });
        });

    });

    describe('Extending Models', function(){

    });

});
