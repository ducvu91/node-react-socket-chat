//http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

server.listen('3000', function(){
    console.log('connected');
});

app.set('view engine', 'ejs');
app.set('views','./views');
app.use(express.static('public'));

var pg = require('pg');

var config = {
    user: 'postgres', //env var: PGUSER
    database: 'mychat', //env var: PGDATABASE
    password: '123456', //env var: PGPASSWORD
    host: 'localhost', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

var onlineUser = [];

var listUser = [
    new oneUser(1,'Sony','Sony Xperia XZ moi ra hom nay'),
    new oneUser(2,'Samsung','Samsung Xperia XZ moi ra hom nay'),
    new oneUser(3,'Apple','Apple Xperia XZ moi ra hom nay'),
    new oneUser(4,'Xiaomi','Xiaomi Xperia XZ moi ra hom nay'),
];

io.on('connection',function(socket){
    console.log('Co nguoi ket noi : ' + socket.id);

    var index  = onlineUser.length;
    var user = listUser[index];
    onlineUser.push(user);
    console.log(index);

    console.log(onlineUser);
    io.sockets.emit('sv_send_userConnect',{
        userId : user.userId,
        socketId : socket.id,
        userName : user.userName,
        messages : user.messages
    });
    io.sockets.emit('_initListFriend',{
        userId : user.userId,
        socketId : socket.id,
        userName : user.userName,
        messages : user.messages
    });
    socket.on('send_message', function(data){
        console.log(data);
    });

    socket.on('disconnect', function() {
        //var index  = onlineUser.length;

        //onlineUser.splice(listUser[index]);
    });

});


var urlEncode = bodyParser.urlencoded({ extended: false });

app.get('/',function(req, res){
    res.render('index');
});

app.get('/clear',function(req, res){
    onlineUser = [];
    res.send('ok');
});

app.post('/', urlEncode, function(req, res){
    console.log(req.body);
    res.render('index');
});

app.get('/chat', function(req, res){

    res.render('chat');
});

app.get('/chat1', function(req, res){

    res.render('chat');
});

function oneUser(userId,userName,messages){
    this.userId = userId;
    this.userName = userName;
    this.messages = messages;
    
}

function infoUser(userId,userName){
    this.userId = userId;
    this.userName = userName;
}