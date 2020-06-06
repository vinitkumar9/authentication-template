'use strict';

module.exports = function(_, Users){
    return {
        setRouting: function(router){
            router.get('/home', this.getHome);
        },

        getHome: function(req, res){
            res.render('homepage');
        }
    }
}