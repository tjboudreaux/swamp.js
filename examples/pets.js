"use strict";

let SwampFactory = require('../lib/factory');
let swaggerFilePath = './petstore.json';

let ExtendedPet = { getName: function() { return 'PetName: ' + this.name; } };

SwampFactory
    .create(swaggerFilePath)
    .then(function(swamp){
        swamp.register('Pet', ExtendedPet);
        let Pet = swamp.get('Pet', {name: "Roux"});

        console.log(Pet.getName());
    })
    .catch(function(error){
        console.log("An error occurred");
        console.log(error);
    });
