// requiring modules
const dependable = require('dependable');
const path = require('path');

// creating a container with dependable module
const container = dependable.container();

// creating an array of modules we want to require in multiple files
const simpleDependencies = [
    ['_', 'lodash'],
    ['passport', 'passport'],
    ['formidable', 'formidable'],
    ['async', 'async'],
    ['validator', 'express-validator'],
    ['Users', './models/user.js']
];

// now registering each module to conatiner
simpleDependencies.forEach(function(dependacy){
    container.register(dependacy[0], function(){
        return require(dependacy[1]);
    });
});

// adding folder paths to container to access custom js files
container.load(path.join(__dirname, '/controller'));
container.load(path.join(__dirname, '/helpers'));

// registering the paths of folder loaded above in container
container.register('container', function(){
    return container;
});

// exporting the container
module.exports = container;