//http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io
var express = require('express');

var app = express();

var server = require('http').Server(app);

var io = require('socket.io')(server);

var port = process.env.PORT || 3000;

server.listen(port, function(){
    console.log('connected');
});

//first run
require('./lib/init')(app, io);
var config  = require('./lib/config');
var db      = require('./lib/vndb');
var common  = require('./lib/common');

//run config init
config.init();

var crypto  = config.configCrypto();
//config run with promise
db.usePromise = true;

db.pool = config.configDB();

parser = config.configBodyParser();

var onlineUser = [];

var listFriend = [
    new oneFriend(1,'Sony','Sony Xperia XZ moi ra hom nay'),
    new oneFriend(2,'Samsung','Samsung Xperia XZ moi ra hom nay'),
    new oneFriend(3,'Apple','Apple Xperia XZ moi ra hom nay'),
    new oneFriend(4,'Xiaomi','Xiaomi Xperia XZ moi ra hom nay'),
];

io.on('connection',function(socket){

    console.log('Co nguoi ket noi : ' + socket.id);

    socket.on('client_register', function(data){

        var err = common.checkError(data);
        if(Object.keys(err).length == 0)
        {
            delete data.repassword;

            var currentTime = new Date();
            data.password   = crypto.encrypt(data.password);
            data.key_active = crypto.encrypt(currentTime.getTime());
            data.key_login  = crypto.encrypt(data.password + currentTime.getTime());
            db.sqlInsert('user',data).then(function(oResult, error){
                console.log('ok');
            }).catch(function(error) {
                err.reg_email = 'Email da duoc su dung';

                socket.emit('sv_send_errRegister', err);
            });
        }
        else {
            console.log(err);
            socket.emit('sv_send_errRegister', err);
        }
    });

    socket.on('client_send_login', function(data){
        var err = 'Email hoac mat khau khong chinh xasc';
        db.sqlSelect({table:'user',where : `"email" = '${data.email}' `}).then(function(oResult, error){
            if(oResult.total === 0)
            {
                console.log('email khong ton tai');
                socket.emit('sv_send_errLogin', err);
            }
            else {
                var result = oResult.result[0];
                if(crypto.decrypt(result.password) === data.password)
                {
                    console.log('dang nhap thanh cong');
                }
                else {
                    console.log('mat khau khong chinh xac');
                    socket.emit('sv_send_errLogin', err);
                }

            }
        }).catch(function(error) {

            //socket.emit('sv_send_errRegister', err);
        });
    });

    /*

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
    */

});


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

//get data when user login
app.post('/login', parser, function(req, res){

    var post = req.body;

    var arrQuery = {table : 'user',where : `"username" = '${post.username}' and "password" = '${post.password}'`};

    db.sqlSelect(arrQuery).then(function(oResult, error){
        if(oResult.total > 0)
        {
            result = oResult.result[0];
            req.session.userInfo = {userId : result.id, userName :result.username, userMStatus : result.mstatus };
            res.redirect('/chat');
        }
        else {
            res.send('Bad user/pass');
        }
    }).catch(function(error) {

        console.log('Error occurred! ', error);

    });

});

app.get('/login',function(req, res){
    res.redirect('/');
});

app.get('/logout',function(req, res){
    req.session.destroy();
    res.redirect('/');
});

app.get('/chat', checkAuth, function(req, res){
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


function checkAuth(req, res, next) {
    if (!req.session.userInfo) {
        res.redirect('/');
    } else {
        next();
    }
}