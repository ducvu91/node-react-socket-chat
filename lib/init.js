// This file handles the configuration of the app.
var express = require('express');

var session = require('express-session');

module.exports = function(app, io){

    // Set .html as the default template extension
    app.set('view engine', 'ejs');

    // Tell express where it can find the templates
    app.set('views','./views');

    // Make the files in the public folder available to the world
    app.use(express.static('./public'));

    app.use(session({
        secret: '2C44-4D44-WppQ38S',
        resave: true,
        saveUninitialized: true
    }));

};
