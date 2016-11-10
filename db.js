/**
 +----------------------------------------------------------------------+
 | (c) Copyright Vu Ngo. 					                            |
 | 	All Rights Reserved.                                                |
 +----------------------------------------------------------------------+
 | @Author: VuNgo                					                    |
 | @Since: 2016-11                					                    |
 | @Source: gist.github.com/ducvu91/97edc2c4c0bd4156daaab5a19f8acff2    |
 | @Contact: ducvu.q7@gmail.com            					            |
 | @facebook: https://www.facebook.com/duc.vu.1690        			    |
 | @Description	: Library help Defined data that is retrieved from      |
 | database, prepare some methods from base object                      |
 | prepare some methods from base object                                |
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
var init = {

    confirm : false,

    oResult : [],

    callback : function(err, result){
        var oResult = {};
        oResult.total = result.rowCount;
        oResult.result = result.rows;
        init.oResult = oResult;
        return 1;
    },
}

function sqlQuery(sql){
    pool.connect(function(err, client, done){
        if(err){
            done();
            console.log('LOI KET NOI: ' + err);
        }else{
            client.query(sql, function(err, result){
                done();
                return init.callback(err, result);
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
    return sqlQuery(sql);
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
        if(!init.confirm)
        {
            console.log('---- WARNING : You need confirm to update all record ---');
            return;
        }
    }
    else if (typeof sWhere !== 'undefined' && sWhere.trim() === ''){
        if(init.confirm)
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
        if(!init.confirm)
        {
            console.log('---- WARNING : You need confirm to delete all record ---');
            return;
        }
    }
    else if (typeof sWhere !== 'undefined' && sWhere.trim() === ''){
        if(init.confirm)
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

//sqlUpdate('user', {username : 'ducvu', password : '123456', 'mstatus' : 'hon qua troi cung dep'}, 'id = 2');
//sqlInsert('user', {username : 'ducvu123', password : '123456', 'mstatus' : 'hon qua troi cung dep'});
//sqlDelete('user','id = 2');
var select = sqlSelect(
    {
        //table : { a : 'user',b : 'user', c : 'user'},
        table : 'user',
        //condition : {b : 'a.id = b.id', c : 'a.id = c.id'},
        field: 'a.*, a.id as id_abc',
        where : 'a.id = 2',
        orderby : 'a.id desc, a.id asc',
        limit : '3,0'
    });