var Promise = require('promise');

var promise = new Promise(function(resolve, reject){
    resolve();
    reject();
});

promise.then(function(){
    console.log(1);
}).then(function(){
    console.log(2);
});

