"use strict";

let sway = require('sway');
let lodash = require('lodash');

class SwampRegistry {

    /**
     * Default Contructor
     * @param  {String} swaggerDefinition local or remote path to swagger definition file
     * @return {[type]}                   [description]
     */
    constructor(swaggerDefinition) {
        this.api = null;
        this.models = {};
        this.builtModels = {};
        this.swaggerDefinition = swaggerDefinition;

        return this.loadDefinition();
    }

    /**
     * [loadDefinition description]
     * @return {[type]} [description]
     */
    loadDefinition() {
        let self = this;
        return new Promise(function(resolve, reject){
            sway.create({definition: self.swaggerDefinition})
                .then(function (api) {
                    self.api = api;

                    resolve(self);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    }

    /**
     * Register a model class to use to extend the swagger definition.
     * @param  {String} modelName  The name of the swagger definition.
     * @param  {Object} modelClass An object to use to extend models.
     * @return {null}
     */
    register(modelName, modelClass) {
        this.models[modelName] = modelClass;
    }

    /**
     * Get an instance of a model.
     * @param  {String} modelName The model to retrieve
     * @param  {Object} defaults  An object of defaults to set the model to
     * @param  {Boolean} restrict  whether to restrict output to what's defined in swagger model
     * @return {Object}           A swagger model.
     */
    get(modelName, defaults, restrict) {
        if (!this.builtModels.hasOwnProperty(modelName)) {
            this.buildModel(modelName);
        }

        // was restrict provided and not false?
        restrict = (restrict !== undefined && restrict) ? true : false;

        return this.getModelWithDefaults(modelName, defaults, restrict);
    }

    /**
     * Get an instance of a model.
     * @param  {String} modelName The model to retrieve
     * @param  {Object} defaults  An object of defaults to set the model to
     * @param  {Boolean} restrict  whether to restrict output to what's defined in swagger model
     * @return {Object}           A swagger model.
     */
    getModelWithDefaults(modelName, defaults, restrict) {
        if (restrict) {
            return lodash.pick(defaults, lodash.keys(this.builtModels[modelName]));
        } else {
            return lodash.merge(lodash.cloneDeep(this.builtModels[modelName]), defaults);
        }
    }

    /**
     * Construct a model for a swagger definition.
     * @param  {String} modelName Name of swagger definition
     * @return {null}
     */
    buildModel(modelName) {
        var self = this;

        if (!self.api.definitionFullyResolved.definitions.hasOwnProperty(modelName)) {
            throw new TypeError("Swagger Model: " + modelName + " is not defined.");
        }

        let model = {};
        let keys = lodash.keys(this.api.definitionFullyResolved.definitions[modelName].properties);

        keys.forEach(function (key) {
            model[key] = null;
            if ( self.api.definition.definitions[modelName].hasOwnProperty("properties") &&
                self.api.definition.definitions[modelName].properties[key].hasOwnProperty("$ref")) {
                var refName = self.api.definition.definitions[modelName].properties[key]['$ref'];
                var refModelName = self.resolveDefinitionToModelName(refName);
                model[key] = self.get(refModelName);
            } else if (self.api.definitionFullyResolved.definitions[modelName].hasOwnProperty("properties") &&
                self.api.definitionFullyResolved.definitions[modelName].properties[key].hasOwnProperty("type")) {
                var modelType = self.api.definitionFullyResolved.definitions[modelName].properties[key].type;

                switch (modelType) {
                    case 'array':
                        model[key] = [];
                        break;
                    case 'object':
                        model[key] = {};
                        break;
                    default:
                        model[key] = null;
                        break;
                }
            }
        });

        if (this.models.hasOwnProperty(modelName)) {
            model = lodash.merge(model, this.models[modelName]);
        }

        this.builtModels[modelName] = model;
    }

    /**
     * Convert a reference to a defintion into a model name.
     * @param  {String} definition full definition path
     * @return {String}            model name
     */
    resolveDefinitionToModelName(definition) {
        var definitionPrefix = "#/definitions/";

        return lodash.replace(definition, definitionPrefix, '');
    }

    /**
     * Create a new Swamp Factory
     * @param  {String} swaggerDefinition URL of File Path to Swagger Definition.
     * @throws {Error}  Will throw an error if the swagger definition can not be loaded.
     * @return {SwampFactory} A SwampFactory instance
     */
    static create(swaggerDefinition) {
        return new SwampRegistry(swaggerDefinition);
    }
}

module.exports = SwampRegistry;
