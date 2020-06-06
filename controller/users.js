'use strict';

module.exports = function(_, passport, validator){

    return{ // setting up the routes
        setRouting: function(router){
            router.get('/', this.getingStarted);
            router.get('/signup', this.signupPage);
            router.get('/login', this.loginPage);
            router.get('/auth/facebook', this.getFacebookLogin);
            router.get('/auth/facebook/callback', this.facebookLogin);
            router.get('/auth/google', this.getGoogleLogin);
            router.get('/auth/google/callback', this.googleLogin);

            router.post('/login', [ // adding validaion for login 
                validator.check('email').not().isEmpty().isEmail().withMessage('Email is invalid'), // validating the email just the format
                validator.check('password').not().isEmpty().withMessage('Password is required and must be atleast 5 characters') // validating the password
                ], this.postValidation, this.postLogin); // if the email and password are valid then validating

            router.post('/signup', [
                validator.check('username').not().isEmpty().isLength({min: 5}).withMessage('Username is required and must be at least 5 characters.'),
                validator.check('email').not().isEmpty().isEmail().withMessage('Email is invalid'),
                validator.check('password').not().isEmpty().withMessage('Password is required and must be at least 5 characters.')
            ], this.postValidation, this.postSignUp);
        },

        getingStarted: function(req, res){
            return res.render('getingStarted');
        },

        loginPage: function(req, res){
            const errors = req.flash('error'); // these msgs will come from postValidation if error exists
            return res.render('login', {title: 'Login', messages: errors, hasErrors: errors.length > 0});
        },

        postLogin: passport.authenticate('local.login', { // this local.login is defined in the passport folder in passport-local.js file and
            successRedirect: '/home', //  is used to verify the authencity of the user and checks for the password and email
            failureRedirect: '/login',
            failureFlash: true
        }),

        signupPage: function(req, res){
            const errors = req.flash('error'); // coming from postValidation if err exists
            return res.render('signup', {title: 'Sign Up', messages: errors, hasErrors: errors.length > 0});
        },

        postValidation: function(req, res, next){ // in this function we will acquire the error msg and handle the error messages
            const err = validator.validationResult(req); // acquiring the err msgs which come due to validator.check
            const reqErrors = err.array(); // converting them into array to be easy to work with
            const errors = reqErrors.filter(e => e.msg !== 'Invalid value');
            let messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);                
            });

            if(messages.length > 0){
                req.flash('error', messages); // passing them to flash so to use them to flash error msgs
                if (req.url === '/signup') {
                    res.redirect('/signup');
                } else if(req.url === '/login') {
                    res.redirect('/login');
                }
            }
            return next();
        },
        
        postSignUp: passport.authenticate('local.signup', { // same in the passport folder in passport-local.js file
            successRedirect: '/home', // we have define the startegy local.signup
            failureRedirect: '/signup',
            failureFlash: true
        })
    };
}