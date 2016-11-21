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

        pool = new pg.Pool(config);

        return pool;
    },

    configBodyParser : function(){

        var bodyParser = require('body-parser');

        parser = bodyParser.urlencoded({ extended: false });

        return parser;
    },

    configCrypto : function(){
        var crypto = require('crypto-js');

        const key = 'asdq-342-@#gus*90d-^&(35j';

        return {
            encrypt : function(string){
                return crypto.AES.encrypt(`${string}`, key).toString();
            },
            decrypt : function(string){
                return crypto.AES.decrypt(`${string}`, key).toString(crypto.enc.Utf8);
            },
        }
    },

    configJsonWebToken : function(){
        var jwt = require('jsonwebtoken');
        var secret = '123456';
        
        return {jwt : jwt, secretKey : secret};
    }
}

module.exports = config;