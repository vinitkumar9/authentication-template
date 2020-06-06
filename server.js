// IMPORTS
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');

const KEY = process.env.KEY;
const container = require('./container');
var PORT = process.env.PORT;
if(PORT == null || PORT == ""){
    PORT = 3000;
}
// resolving the container
container.resolve(function(_, users, home){ // setting up the whole server inside container to be able to use file in other scripts

    // setting up mongodb
    mongoose.set('useFindAndModify', false); // just requirements
    mongoose.set('useCreateIndex', true);  // just requirements
    mongoose.Promise = global.Promise; // making mogodb accessible to other scripts
    mongoose.connect('mongodb://localhost/chat', {useNewUrlParser: true, useUnifiedTopology: true}); // connecting to mongodb server

    const app = stepupExpress(); // calling the function to setup express

    function stepupExpress(){
        const app = express(); // creating express server handler
        const server = http.createServer(app); // creating a server from http module and pasing the express server
        server.listen(PORT, function(){ //setting up the server to listen for incoming connections
            console.log(`Server started on port ${PORT}`);
        });
        configureExpress(app); // configuring the server before setting routes (like use body parser or view engine is ejs)

        // setup routes or router
        const router = require('express-promise-router')(); // this allows use to manage routes of our server outside the server.js file.
        // the different routes file are stored in a folder named controller which is registered in the container in the container.js file
        users.setRouting(router); // calling the file named users.js in controller folder and accesing a function called setRouting passing in router
        home.setRouting(router); // calling file home.js

        // after setting up all the routes files we will configure the express to use router 
        app.use(router);

        // function to configure express
        function configureExpress(app){

            // requiring the passport file
            require('./passport/passport-local');

            // configuring express
            app.use(express.static('public')); // setting up a static file folder
            app.use(cookieParser()); // using cookieParser
            app.use(bodyParser.json()); // using bodyParser
            app.use(bodyParser.urlencoded({extended: true}));
            app.set('view engine', 'ejs'); // setting the view engine to ejs

            // configuring the express to use sessionns for authentication
            app.use(session({
                secret : KEY, // this is a sting and can take any value you like
                resave: false,
                saveUninitialized: false,
                store: new MongoStore({mongooseConnection: mongoose.connection}) // configuring the MongoStore to save data of sessions in mongodb
            }));

            // configuring to use flash to display alert messages during authentication
            app.use(flash());

            // configuring the passport
            app.use(passport.initialize());
            app.use(passport.session());

            // setting up lodash
            app.locals._ = _;
        }
    }

});