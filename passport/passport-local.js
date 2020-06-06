'use strict';

// importing modules
const passport = require('passport');
const User = require('../models/user'); // requiring the userschema or model to use in signup
const localStrategy = require('passport-local').Strategy; // defining the strategy which will be used to authenticate the users

// serializeuser is used to get the user data the "user" object passed in the callback contains the whole user data passed
// and load the user id in the session
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// this is used to remove the user from session
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

// when user tries to signup this function will activate and it will check id the user already exists or not
// if exist then throw an error using flash and if not then it will save the data into the database
passport.use('local.signup', new localStrategy({ // 'local.signup' is the strategy name
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    
    User.findOne({'email': email}, function(err, user){
        if(err){
            return done(err); // returns err in the process
        }

        if(user){
            return done(null, false, req.flash('error', 'User with eamil already exists')); // if the user already exists throws error
        }

        // if user doesnt exist then creating the user
        const newUser = new User();
        newUser.username = req.body.username;
        newUser.fullname = req.body.username;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password); // encrypting password before saving it to the database

        newUser.save(function(err){
            done(null, newUser); // saving the user in the database and retunring
        });
    });
}));


// creating a strategy to authenicate the user on login
passport.use('local.login', new localStrategy({ // 'local.login' is the strategy name
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    
    User.findOne({'email': email}, function(err, user){
        if(err){
            return done(err); // error related to failure of operation
        }

        const messages = [];
        if(!user || !user.validUserPassword(password)){ // checking if the user doesnt exist if email doesn't exist and then checking the password
            messages.push('Email doesn\'t exist or Password is Invalid'); // if invalid then return the error
            return done(null, false, req.flash('error', messages));
        }

        return done(null, user); // if there is no error in authenticating i.e, if the user email is correct and password is also correct
        // return the user
        
    });
}));