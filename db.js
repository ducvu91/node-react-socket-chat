/**
 +----------------------------------------------------------------------+
 | (c) Copyright Vu Ngo. 					                            |
 | 	All Rights Reserved.                                                |
 +----------------------------------------------------------------------+
 | @Name: VNDB                					                        |
 | @Author: VuNgo                					                    |
 | @Version: 1.0                					                    |
 | @Since: 2016-11                					                    |
 | @Source: gist.github.com/ducvu91/97edc2c4c0bd4156daaab5a19f8acff2    |
 | @Contact: ducvu.q7@gmail.com            					            |
 | @Website: vungo.net                  					            |
 | @facebook: https://www.facebook.com/duc.vu.1690        			    |
 | @Description	: Library help Defined data that is retrieved from      |
 | database, prepare some methods from base object                      |
 | prepare some methods from base object                                |
 | if you get it on your site, please indicate the source               |
 +----------------------------------------------------------------------+
 */

var pg = require('pg');
var config = {
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'mychat',
    max: 1000
};
var pool = new pg.Pool(config);
//Declare init
var initConfig = {

    //
    pathLog : '/public/logs/sql.log',
    //use cofirm when delete or update all record
    confirm : false,

    oResult : [],

    callback : function(err, result){
        var oResult = {};
        oResult.total = result.rowCount;
        oResult.result = result.rows;
        initConfig.oResult = oResult;
        return 1;
    },
}

function sqlQuery(sql){

    _writeLogQuery(sql);

    pool.connect(function(err, client, done){
        if(err){
            done();
            console.log('LOI KET NOI: ' + err);
        }else{
            client.query(sql, function(err, result){
                done();
                return initConfig.callback(err, result);
            });
        }
    });
}


/**
 *
 * @param arrTable
 * @param cb : function callback;
 */
function sqlSelect(arrTable,cb){

    if (typeof cb === "function") {
        cb();
    }

    if(typeof arrTable.table == 'undefined')
    {
        console.log('--- table is empty ---');
        return;
    }
    else if(typeof arrTable == 'undefined')
    {
        console.log('--- arrData is empty ---');
        return;
    }

    var sSelect, sFrom, sWhere, sOrderBy, sGroupBy, sHaving, sLimit;

    sSelect     = _parseColumns(arrTable);
    sFrom       = _parseFrom(arrTable);
    sWhere      = _parseWhere(arrTable);
    sGroupBy    = _parseGroupBy(arrTable);
    sHaving     = _parseHaving(arrTable);
    sOrderBy    = _parseOrderBy(arrTable);
    sLimit      = _parseLimit(arrTable);

    var sql = `SELECT ${sSelect} FROM ${sFrom} ${sWhere} ${sGroupBy} ${sHaving} ${sOrderBy} ${sLimit}`;

    console.log(sql);

    //return sqlQuery(sql);
}

/**
 *
 */
function sqlSelectPaging(){

}

/**
 * function is Insert
 * @param table
 * @param arrData
 */
function sqlInsert(table,arrData,cb){

    if (typeof cb === "function") {
        cb();
    }

    if(typeof table == 'undefined')
    {
        console.log('--- table is empty ---');
        return;
    }
    else if(typeof arrData == 'undefined')
    {
        console.log('--- arrData is empty ---');
        return;
    }

    var field = [];
    var value = [];

    for(var index in arrData) {
        field.push(`"${index}"`);
        value.push(`'${arrData[index]}'`);
    }

    var sField = field.join();
    var sValue = value.join();
    var sql = `INSERT INTO "${table}" (${sField}) VALUES (${sValue})`;
    console.log(sql);
}

/**
 * function is Update
 * @param table
 * @param arrData
 * @param sWhere
 * @param cb : function callback
 */
function sqlUpdate(table,arrData,sWhere,cb){

    if (typeof cb === "function") {
        cb();
    }

    if(typeof table == 'undefined')
    {
        console.log('--- table is empty ---');
        return;
    }
    else if(typeof arrData == 'undefined')
    {
        console.log('--- arrData is empty ---');
        return;
    }
    else if (typeof sWhere == 'undefined'){
        if(!initConfig.confirm)
        {
            console.log('---- WARNING : You need confirm to update all record ---');
            return;
        }
    }
    else if (typeof sWhere !== 'undefined' && sWhere.trim() === ''){
        if(initConfig.confirm)
        {
            sWhere = `'1'`;
        }
        else {
            console.log('---- You need confirm to update all record ---');
            return;
        }
    }

    var setValue = [];

    for(var index in arrData) {
        setValue.push(`"${index}" = '${arrData[index]}'`);
    }

    var sSetValue = setValue.join();
    var sql = `UPDATE "${table}" SET ${setValue} WHERE ${sWhere}`;
    console.log(sql);
}

/**
 *function is Delete
 * @param table
 * @param sWhere
 * @param cb : function callback
 */
function sqlDelete(table,sWhere,cb){

    if (typeof cb === "function") {
        cb();
    }

    if(typeof table === 'undefined')
    {
        console.log('---- table is empty ---');
        return;
    }
    else if(typeof sWhere === 'undefined'){
        if(!initConfig.confirm)
        {
            console.log('---- WARNING : You need confirm to delete all record ---');
            return;
        }
    }
    else if (typeof sWhere !== 'undefined' && sWhere.trim() === ''){
        if(initConfig.confirm)
        {
            sWhere = `'1'`;
        }
        else {
            console.log('---- You need confirm to delete all record ---');
            return;
        }
    }

    var sql = `DELETE FROM "${table}" WHERE ${sWhere}`;
    console.log(sql);
}

function _writeLogQuery(data){


    var path = __dirname + initConfig.pathLog;

    _checkSizeLog(path);

    var fs = require('fs');
    var util = require('util');
    var log_file = fs.createWriteStream(path, {flags : 'a'});
    var log_stdout = process.stdout;
    var today = _getCurrentDate();

    var log = '';
    log += `${today.year}-${today.month}-${today.day}T${today.hour}:${today.minute}:${today.seconds} | ${today.timeZone}` + '\n';
    log += `${data}`+ '\n';
    log += `________________________________________________________________________________________` + '\n';

    log_file.write(util.format(log) + '\n');

    /*+

    console.log = function(d) { //
        log_file.write(util.format(d) + '\n');
        log_stdout.write(util.format(d) + '\n');

    };
    */
}

function _checkSizeLog(path){

    var fs = require('fs');
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return;
    }

    var stats = fs.statSync(path);
    var fileSizeInBytes = stats["size"];

    var maxSize = 50 * 1048576; //50 MB;

    if (fileSizeInBytes > maxSize)
    {
        var fileName = path.replace(/^.*[\\\/]/, '').split('.');
        var arrPath = path.split(path.replace(/^.*[\\\/]/, '')).shift();
        var today = _getCurrentDate();
        var currentDay = `${today.year}-${today.month}-${today.day}`;
        var pathRename = `${arrPath}${fileName[0]}-${currentDay}.${fileName[1]}`;
        fs.rename(path, pathRename);
    }
}

function _getCurrentDate(){
    d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    objToday = new Date(utc + (3600000*7));
    var curDay = objToday.getDay(),
        curMonth = objToday.getMonth(),
        curYear = objToday.getFullYear(),
        curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
        curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
        curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds();
    var timeZone = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
    return {year : curYear , month : curMonth, day : curDay, hour : curHour , minute : curMinute, seconds : curSeconds, timeZone : timeZone  };
}

function _parseColumns(arrTable){

    if(typeof arrTable.field !== 'undefined')
        return `${arrTable.field}`;
    return `*`;
}


function _parseFrom(arrTable){

    var $sFrom, $inerJoin = '';
    if(typeof arrTable.table === 'object')
    {
        var sTableFirst = Object.keys(arrTable.table)[0];
        var sFrom = `"${arrTable.table[sTableFirst]}" as "${sTableFirst}"`;
        delete arrTable.table[sTableFirst];

        if(Object.keys(arrTable.table).length > 0){
            var arrInerJoin = [];
            for(var index in arrTable.table) {
                arrInerJoin.push(`INNER JOIN "${arrTable.table[index]}" as "${index}" ON (${arrTable.condition[index]})`);
            }
        }
        $inerJoin = arrInerJoin.join(' ');
        $sFrom = `${sFrom} ${$inerJoin}`;
    }
    else {
        $sFrom = `"${arrTable.table}" as "a"`
    }
    return $sFrom;
}


function _parseWhere(arrTable){

    if(typeof arrTable.where !== 'undefined')
        return `WHERE ${arrTable.where}`;
    return '';
}

function _parseOrderBy(arrTable){
    if(typeof arrTable.orderby !== 'undefined')
        return `ORDER BY ${arrTable.orderby}`;
    return '';
}

function _parseGroupBy(arrTable){

    if(typeof arrTable.groupby !== 'undefined')
        return `GROUP BY ${arrTable.groupby}`;
    return '';
}

function _parseHaving(arrTable){

    if(typeof arrTable.groupby !== 'undefined')
        return `HAVING ${arrTable.groupby}`;
    return '';
}

function _parseLimit(arrTable){

    if(typeof arrTable.limit !== 'undefined' && arrTable.limit.trim() != '')
    {
        var limit = arrTable.limit.split(",");

        var total = limit[0];

        var start = 0;

        if(typeof limit[1] !== 'undefined' && limit[1].trim() != '')
        {
            start = limit[1];
        }

        return `LIMIT ${total} OFFSET ${start}`
    }

    return '';
}
/**
 +----------------------------------------------------------------------+
 |                            HOW TO USE  					            |
 +----------------------------------------------------------------------+
 */

/**
 **************
 ****DELETE****
 **************
 *
 **BASIC SQL AND function sqlDelete **
 *
 * DELETE FROM "table_name" WHERE condition
 * sqlDelete("table_name",condition,cb);
 *
 * How to use ?
 *
 * DELETE FROM "user" WHERE "id" = 1
 * sqlDelete("user", '"id" = 2');
 *
 *** with cb is callback, you can add more action and control it
 *
 * sqlDelete("user", '"id" = 2', function(err, result){
 *  // To secure data or advoid err synx tax, with delete no condition, you can set confirm is true
 *  initConfig.confirm = true;
 *  console.log(123);
 * });
 *
 */



/**
 **************
 ****INSERT****
 **************
 *
 **BASIC SQL AND function sqlInsert **
 *
 * INSERT INTO table_name (column_name) VALUES (values)
 * sqlInsert(table_name, {column_name:values,column_name:values,....},cb);
 *
 * How to use ?
 *
 * INSERT INTO "user" ("username","password","mstatus") VALUES ('vungo','123456','hon qua troi dep')
 * sqlInsert('user', {username : 'vungo', password : '123456', 'mstatus' : 'hon qua troi dep'});
 *
 * with cb used as  sqlDelete
 *
 */



/**
 **************
 ****UPDATE****
 **************
 *
 **BASIC SQL AND function sqlUpdate **
 *
 * UPDATE table_name set table_name = new_value WHERE condition
 * sqlUpdate(table_name, {column_name:new_values,column_name:new_values,....}, condition, cb);
 *
 * How to use ?
 *
 * UPDATE "user" set "password" = '45678', "mStatus" = 'ok' WHERE "id" = 2
 * sqlUpdate('user', {password : '123456', mStatus : 'ok'}, '"id" = 2');
 *
 * with cb used as  sqlDelete
 *
 */

/**
 **************
 ****SELECT****
 **************
 *
 **BASIC SQL**
 *
 * SELECT field FROM table WHERE condition GROUP BY group HAVING having ORDER BY order LIMIT  num ,start
 * sqlSelect({
 *              table : table || { a : table_a, b : table_b},
 *              condition : {} // only have when table more 2
 *              field : 'field',
 *              where : 'where',
 *              groupby : 'group',
 *              orderby : 'order',
 *              having : 'having',
 *              limit : 'num,start'
 *              });
 *
 ** VNDB with function sqlInsert **
 *
 * SELECT "id", "username"  as "name" FROM "user" WHERE "id" = 2 GROUP BY "id" ORDER BY "id" desc LIMIT  10,0
 *
 * sqlSelect({
 *              table : `user`,
 *              field : `"id", "username" as "name"`,
 *              where : `"id" = 2`,
 *              groupby : `"id"`,
 *              orderby : `"id"`,
 *              });
 * if not have elements, you can blank.
 * with the table, if you have more table, you must bu put it in { a:talbe_a, abc : table_abc, anything : table_anything}
 * AND you must declare condition with it is conditional connection 2 table condition : { b : a.id = b.id}
 * Example :
 *
 * SELECT a.id, a.username as name, b.id as id_order, b.amount, c.name as city_name
 * FROM "user" as "a" INNER JOIN "order" as "b" ON (a.id = b.id_user) INNER JOIN "city" as "c" ON (a.id_city = c.id) INNER JOIN "district" as "d" ON (c.id = d.id_city)
 * WHERE a.id = 2 ORDER BY a.id desc, a.id asc LIMIT 3 OFFSET 0
 *
 * sqlSelect({
 *          table : {a : 'user', b : 'order', c : 'city', d : 'district' },
 *          condition : {b : 'a.id = b.id_user', c : 'a.id_city = c.id', d : 'c.id = d.id_city'},
 *          field : `a.id, a.username as name, b.id as id_order, b.amount, c.name as city_name`,
 *          where : 'a.id = 2',
 *          orderby : 'a.id desc, a.id asc',
 *          limit : '3,0'
 * });
 * with cb used as  sqlDelete
 *
 */



/*
sqlInsert('user', {username : 'ducvu123', password : '123456', 'mstatus' : 'hon qua troi cung dep'});
sqlUpdate('user', {username : 'ducvu', password : '123456', 'mstatus' : 'hon qua troi cung dep'}, 'id = 2');
sqlDelete('user','id = 2');
var select = sqlSelect(
    {
        table : {a : 'user', b : 'order', c : 'city', d : 'district' },
        condition : {b : 'a.id = b.id_user', c : 'a.id_city = c.id', d : 'c.id = d.id_city'},
        field : `a.id, a.username as name, b.id as id_order, b.amount, c.name as city_name`,
        where : 'a.id = 2',
        orderby : 'a.id desc, a.id asc',
        limit : '3,0'
    });
*/