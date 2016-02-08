"use strict";

let Swamp = require('../lib/swamp');
let swaggerFilePath = './petstore.json';

let ExtendedPet = { getName: function() { return 'PetName: ' + this.name; } };

Swamp
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
