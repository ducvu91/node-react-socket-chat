// This file handles the configuration of the app.
var config = {

    init : function(){
    },

    configDB : function(){
        var pg = require('pg');

        var config = {
            user: 'postgres',
            password: '123456',
            host: 'localhost',
            port: 5432,
            database: 'mychat',
            max: 1000
        };

        return new pg.Pool(config);
    },

    configBodyParser : function(){

        var bodyParser = require('body-parser');

        return bodyParser.urlencoded({ extended: false });
    }
}

module.exports = config;