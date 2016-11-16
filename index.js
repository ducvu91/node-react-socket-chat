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

var listFriend = [];

var arrMess = [];

io.on('connection',function(socket){

    console.log('Co nguoi ket noi : ' + socket.id);

    io.emit('sv_send_onlineUser',onlineUser);

    socket.on('client_request_userOnline', function(data){
        io.emit('sv_send_onlineUser',onlineUser);
    });




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

                console.log('dang ky thanh cong');

            }).catch(function(error) {
                err.reg_email = 'Email da duoc su dung';
                console.log(err);
                socket.emit('sv_send_errRegister', err);
            });
        }
        else {
            console.log('dang ky that bai');
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
                    socket.id = result.id;

                    var userInfo = new newUserInfo(result.id, result.email, result.full_name, socket.id);

                    onlineUser.push(userInfo);

                    socket.emit('sv_send_loginSuccess',userInfo);

                    io.emit('sv_send_onlineUser',onlineUser);

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

    */
    socket.on('client_send_private_message', function(data){
        arrMess.push(data);
        io.emit('sv_send_private_message',arrMess);
    });



    socket.on('disconnect', function() {

        var index  = findIndexOnlineUser(socket.id);
        if(index)
        {
            console.log(index);
            onlineUser.splice(index);
            io.emit('sv_send_onlineUser',onlineUser);
            console.log('xoa list friend thanh cong');
        }
    });

});


app.get('/',function(req, res){
    res.redirect('/app');
});


app.get('/login',function(req, res){
    res.render('login/index');
});

app.post('/login', parser, function(req, res){

    data = req.body;

    var $req = req;

    db.sqlSelect({table:'user',where : `"email" = '${data.email}' `}).then(function(oResult, error){

        if(oResult.total === 0)
        {
            console.log('email khong ton tai');
        }
        else {
            var result = oResult.result[0];

            if(crypto.decrypt(result.password) === data.password)
            {
                var userInfo = new newUserInfo(result.id, result.email, result.full_name);

                $req.session.userInfo = userInfo;

                onlineUser.push(userInfo);

                console.log('dang nhap thanh cong');

                res.redirect('/app');
            }
            else {
                console.log('mat khau khong chinh xac');
                res.send('mat khau khong chinh xac');
            }

        }
    }).catch(function(error) {
        console.log('Loi ket noi');
        res.send('Loi ket noi');
        //socket.emit('sv_send_errRegister', err);
    });

});

app.get('/app', checkAuth,function(req, res){
    console.log(req.session.userInfo);
    res.send(req.session.userInfo);

    //res.render('app/index');

});

app.get('/logout',function(req, res){
    req.session.destroy();
    res.redirect('/');
});



app.get('/test',function(req, res){
    res.writeHead(302, {
        'Location': 'your/404/path.html'
        //add other headers here...
    });
    res.end();
});

app.get('/vaorap',function(req, res){
    console.log(req.session.DaMua);
    if (!req.session.DaMua) {
        res.send('Mua Ve Di');
    }
    else {
        res.send('Wellcome');
    }
});

app.get('/muave',function(req, res){
    req.session.DaMua = true;
    console.log(req.session.DaMua);
    res.send('Da Mua Ve');
});

function newUserInfo  (id, email, full_name, socketId){
    this.id = id;
    this.email = email;
    this.full_name = `${full_name}`;
    this.socketId = socketId;
}


function checkAuth (req, res, next) {
    if (!req.session.userInfo) {
        //res.sendStatus(401);
        res.redirect('/login');
    } else {
        return next();
    }
}

function getUserInfo(req, res, next){
    if (!req.session.userInfo) {
        return false;
    } else {
        return req.session.userInfo;
    }
}

function findIndexOnlineUser(id) {
    var indexOf;
    onlineUser.forEach(function(elment, index){
        if(elment.socketId === id)
        {
            indexOf = index;
        }

    });
    return indexOf;
}