'use strict';

module.exports = function(_, Users, passport){
    return {
        setRouting: function(router){
            router.get('/home', this.getHome);
        },

        getHome: function(req, res){
            if(req.isAuthenticated()){
            res.render('homepage');
            } else {
                res.redirect('/login')
            }
        }
    }
}