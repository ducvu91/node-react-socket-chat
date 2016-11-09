//http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('connected');
});

app.set('view engine', 'ejs');
app.set('views','./views');
app.use(express.static('public'));

session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

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

var listFriend = [
    new oneFriend(1,'Sony','Sony Xperia XZ moi ra hom nay'),
    new oneFriend(2,'Samsung','Samsung Xperia XZ moi ra hom nay'),
    new oneFriend(3,'Apple','Apple Xperia XZ moi ra hom nay'),
    new oneFriend(4,'Xiaomi','Xiaomi Xperia XZ moi ra hom nay'),
];

io.on('connection',function(socket){
    console.log('Co nguoi ket noi : ' + socket.id);

    var index  = onlineUser.length;
    var user = listFriend[index];
    onlineUser.push(user);
    console.log(index);

    console.log(onlineUser);

    socket.emit('msg_socket', '123');

    socket.emit('sv_send_userConnect',{
        userId : user.userId,
        socketId : socket.id,
        userName : user.userName,
        messages : user.messages
    });

    socket.broadcast.emit('sv_send_listFriend',{
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

        //onlineUser.splice(listFriend[index]);
    });

});


var urlEncode = bodyParser.urlencoded({ extended: false });

app.get('/',function(req, res){
    if (!req.session.userInfo) {
        res.render('index');
    } else {
        res.redirect('/chat');
    }

});

app.get('/clear',function(req, res){
    onlineUser = [];
    res.send('ok');
});

app.post('/', urlEncode, function(req, res){
    var post = req.body;
    checkSignIn(post.username,post.password, function(err, result){

        if(result.rowCount == 1)
        {
            oRows = result.rows[0];
            req.session.userInfo = {userId : oRows.id, userName :oRows.username, userMStatus : oRows.mstatus };
            res.redirect('/chat');
        }
        else {
            res.send('Bad user/pass');
        }
    });
});

app.get('/chat', checkAuth, function(req, res){
    res.send('if you are viewing this page it means you are logged in');
    //res.render('chat');
});

app.get('/chat1', function(req, res){
    res.send('if you are viewing this page it means you are logged in');
    //res.render('chat');
});

function oneFriend(userId,userName,messages){
    this.userId = userId;
    this.userName = userName;
    this.messages = messages;
    
}

function infoUser(userId,userName){
    this.userId = userId;
    this.userName = userName;
}

function query(sql, cb){
    pool.connect(function(err, client, done){
        if(err){
            done();
            console.log('LOI KET NOI: ' + err);
        }else{
            client.query(sql, function(err, result){
                done();
                cb(err, result);
            });
        }
    });
}

function checkSignIn(username, password, cb){
    var sql = `SELECT * FROM "user" WHERE "username" = '${username}' AND
  "password" = '${password}'`;
    query(sql, function(err, result){
        cb(err, result);
    });
}

function checkAuth(req, res, next) {
    if (!req.session.userInfo) {
        res.redirect('/');
    } else {
        next();
    }
}