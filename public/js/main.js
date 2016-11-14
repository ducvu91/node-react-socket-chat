var socket = io('http://localhost:3000');
var $this;;
var $thisChatIndex;
var $thisUser;

var main = {
    loadPrivateChat : function (friendSocketId){
        ReactDOM.unmountComponentAtNode(document.getElementById('app-chat'));
        ReactDOM.render(
            <div>
                <LayoutHeader></LayoutHeader>
                <LayoutBodyChatPrivate friendSocketId={friendSocketId}></LayoutBodyChatPrivate>
            </div>,
            document.getElementById('app-chat')
        );
    },
}

var LayoutHeader = React.createClass({
    render(){
        return(
            <div className="header-max header-company">
                <div className="container-fluid clearfix">
                    <div className="hd-logo">
                        <img src="images/logo.png" alt=""/>
                    </div>
                    <div className="hd-right-1">
                        <div className="lst-user-controls clearfix">
                            <a href="#" className="user-noti" id="btn-logged-notification">
                                <i className="fa fa-bell"></i>
                                <i className="fa fa-circle"></i>
                            </a>
                            <a href="#" className="user-message active" id="btn-logged-message">
                                <i className="fa fa-comment"></i>
                                <i className="fa fa-circle"></i>
                            </a>
                            <a href="#" className="icon-search"><i className="fa fa-search"></i></a>
                            <div className="user-profile clearfix">
                                <a href="#" id="hd-user-caret-down">
                                    <i className="fa fa-bars"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

/**
 * Layout Main Chat
 */

var LayoutBodyChatIndex = React.createClass({
    getInitialState(){

        $thisChatIndex = this;

        return{listFriend : []};
    },
    componentDidMount() {
        socket.on('sv_send_onlineUser', this._initListFriend);
    },
    _initListFriend(data) {

        this.state.listFriend = data;
        this.setState(this.state);

    },
    privateChat(friendSocketId){
        socket.on('private_chat', $thisUser.socketId);
        ReactDOM.unmountComponentAtNode(document.getElementById('app-chat'));
        main.loadPrivateChat(friendSocketId);
    },
    render(){
        var listFriend = this.state.listFriend.map(function(item,key){

            if(item.id != $thisUser.id)
            {
                return(
                    <li key={key}>
                        <Friend item={item} ></Friend>
                    </li>
                );
            }

        });
        return(
            <div className="chat-container">
                <div className="data-content">
                    <ul className="chat-contacts contacts-cpn">
                        {listFriend}
                    </ul>
                </div>
            </div>
        );
    },
});


var Friend = React.createClass({
    render(){
        var item = this.props.item;
        return(
            <a href="javascript:void(0)" onClick={() => {$this.privateChat(item.id)}}>
                <div className="media">
                    <div className="pull-left">
                        <div className="avata"><img src="images/logo-comp-beat.png" className="img-circle" /></div>
                    </div>
                    <div className="media-body">
                        <h4 className="comp-name">{item.email}</h4>
                        <h5 className="job">Research Engineer (NLP) - Python, Java</h5>
                        <small className="message">{item.full_name} </small><span className="time">18: 00pm</span>
                    </div>
                </div>
            </a>
        );
    }
});

/**
 * Layout Private Chat
 */
var LayoutBodyChatPrivate = React.createClass({
    getInitialState() {
        return {messages:[]};
    },

    componentDidMount() {
        socket.on('init', this._initialize);
        socket.on('send_message', this._messageRecieve);
    },

    _initialize(data) {
        var {messages} = data;
        this.setState({messages});
    },

    _messageRecieve(message) {
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
    },

    handleMessageSubmit(message) {

        if(message.userId != $this.state.userId)
        {
            var {messages} = this.state;
            messages.push(message);
            this.setState({messages});
        }
        socket.emit('send_message', message);
    },

    exitPrivateChat(){
        ReactDOM.render(
            <div>
                <LayoutHeader></LayoutHeader>
                <LayoutBodyChatIndex></LayoutBodyChatIndex>
            </div>,
            document.getElementById('app-chat')
        );
    },

    render(){
        return(
            <div className="chat-container">
                <div className="tophead-chat _clearfix">
                    <a onClick={this.exitPrivateChat} href="javascript:void(0)" className="iconX"><i className="fa fa-times"></i> </a>
                    <div className="tabinfo-cpn">
                        <h4>SparkxLab</h4>
                        <h5>Research Engineer (NLP) - Python, Java</h5>
                    </div>
                </div>

                <div className="data-content js_dynamic_height">
                    <button className="SeeOlderMessages">See Older Messages</button>
                    <MessageList messages={this.state.messages}></MessageList>
                    <MessageForm onMessageSubmit={this.handleMessageSubmit} userName={this.state.userName} friendSocketId={this.props.friendSocketId}></MessageForm>
                </div>
            </div>
        );
    }
});

var MessageList = React.createClass({
    render(){

        return(
            <div className="chatboxcontent">
                {
                    this.props.messages.map((message, i) => {
                        var position;
                        if(message.userId == $this.state.userId)
                        {
                            position = 'right';
                        }
                        else
                        {
                            position = 'left';
                        }
                        return (
                            <Message
                                key={i}
                                userName={message.userName}
                                text={message.text}
                                position = {position}
                            />
                        );
                    })

                }
            </div>
        );
    }
});

var Message = React.createClass({
    render(){

        var class1, class2;

        class1 = 'media messages-' + this.props.position;
        class2 = 'wp_avata pull-'+ this.props.position;;

        return(
            <div className={class1}>
                <div className={class2}>
                    <a href="#">
                        <div className="avata"> <img src="images/avatar-guy-2.png" className="img-circle" /></div>
                        <small>{this.props.userName}</small>
                    </a>
                </div>
                <div className="media-body">
                    <div className="panel-body">
                        {this.props.text}
                    </div>
                    <small className="text-muted">14:30pm</small>
                </div>
            </div>
        );
    }
});

var MessageForm = React.createClass({
    getInitialState(){
        return{
            text : ''
        };
    },

    handleSubmit(e){
        e.preventDefault();
        var message = {
            userId : $thisUser.id,
            userName : $thisUser.full_name,
            friendSocketId : this.props.friendSocketId,
            text : this.state.text
        }
        console.log(message);
        this.props.onMessageSubmit(message);
        this.setState({ text: '' });

    },

    changeHandler(e) {
        this.setState({ text : e.target.value });
    },

    render(){
        return(
            <div className="chatboxinput">
                <div className="wp-reply">
                    <form onSubmit={this.handleSubmit}>
                        <textarea onChange={this.changeHandler} value={this.state.text} rows="1" className="form-control" placeholder="Type you message ...."></textarea>
                        <button className="btnReply"><i className="fa fa-paper-plane" aria-hidden="true"></i></button>
                    </form>
                </div>
            </div>
        );
    }
});

/**
 * Layout Login
 */
var $thisLayoutLogin;

var LayoutLogin = React.createClass({
    getInitialState(){
        $thisLayoutLogin = this;
        var body = <FormLogin onLoginSubmit={this.handleFormLoginSubmit} formRegister={this.renderFormRegister} formForgot={this.renderFormForgot}></FormLogin>;
        return {layout : body, errorRegister : ''};
    },
    componentDidMount() {
        socket.on('sv_send_errRegister', this._errorRegister);
        socket.on('sv_send_loginSuccess', this._loginSuccess);
        
    },

    _errorRegister(data){
        var htmlErr = '';
        for(var index in data) {
            htmlErr += '<li>' + data[index] + '</li>';
        }
        var html = <ul className="error">{htmlErr}</ul>;
        this.state.errorRegister = html;
        this.setState(this.state);
    },
    _loginSuccess(data){
        $thisUser = data;
        ReactDOM.render(
            <LayoutBodyChatIndex></LayoutBodyChatIndex>
            , document.getElementById('app-chat-body')
        );
        /*
        ReactDOM.unmountComponentAtNode(document.getElementById('app-vn-chat'));
        ReactDOM.render(
            <div>
                <LayoutHeader></LayoutHeader>

                <div id="app-body">
                    <LayoutBodyChatIndex></LayoutBodyChatIndex>
                </div>
            </div>
            , document.getElementById('app-vn-chat')
        );
        */
    },
    handleFormRegisterSubmit(formData){
        socket.emit('client_register',formData);
    },
    handleFormLoginSubmit(formData){
        socket.emit('client_send_login',formData);
    },

    renderFormLogin(){
        var body = <FormLogin onLoginSubmit={this.handleFormLoginSubmit} formRegister={this.renderFormRegister} formForgot={this.renderFormForgot}></FormLogin>;
        this.state.layout = body;
        this.setState(this.state);
    },
    renderFormRegister(){
        var body = <FormRegister onRegisterSubmit={this.handleFormRegisterSubmit}  formLogin={this.renderFormLogin}></FormRegister>;
        this.state.layout = body;
        this.setState(this.state);
    },
    renderFormForgot(){
        var body = <FormForgot formLogin={this.renderFormLogin}></FormForgot>;
        this.state.layout = body;
        this.setState(this.state);
    },
    render(){
        return(
            <div className="apollo">
                <div className="apollo-container clearfix">
                    <div className="apollo-facebook">
                        <div className="apollo-image"></div>
                    </div>
                    <div id="error-container">{this.state.errorRegister}</div>
                    <div id="login-container">{this.state.layout}</div>
                </div>
            </div>
        );
    },
});

var FormLogin = React.createClass({

    handelSubmit(e){
        e.preventDefault();
        var data = {
            email : this.refs.email.value,
            password : this.refs.password.value,
        }
        this.props.onLoginSubmit(data);
    },

    render(){
        return(
            <div className="apollo-login">
                <button className="btn btn-block btn-facebook btn-lg">đăng nhập bằng <strong>Facebook</strong></button>

                <p className="apollo-seperator"> or </p>

                <div id="error-container"></div>

                <form onSubmit={this.handelSubmit} className="form-signin" id="apollo-login-form" method="post" action="/login">
                    <div className="form-group">
                        <input ref="email" type="text" name="email" defaultValue="" className="form-control email" placeholder="Email" required/>
                    </div>

                    <div className="form-group">
                        <input ref="password" type="password" name="password" defaultValue="" className="form-control" placeholder="Password" required/>
                    </div>

                    <button className="btn btn-lg btn-signin btn-block" type="submit">đăng nhập</button>
                </form>

                <p className="apollo-register-account">
                    <a onClick={this.props.formRegister} href="javascript:void(0)" className="register-link">Chưa có tài khoản? <strong>đăng ký ngay </strong><i className="icon-arrow-right"></i></a><br/>
                    <a onClick={this.props.formForgot} href="javascript:void(0)" className="password-link"><small>Quên mật khẩu?</small></a>
                </p>
            </div>
        );
    }
});


var FormRegister = React.createClass({
    handleSubmit(e){
        e.preventDefault();
        var data = {
            email       : this.refs.reg_email.value,
            password    : this.refs.reg_password.value,
            repassword  : this.refs.reg_repassword.value,
            full_name : this.refs.reg_fullname.value,
            phone : this.refs.reg_phone.value,
        }
        this.props.onRegisterSubmit(data);
    },
    render(){
        return(
            <div className="apollo-register">
                <button className="btn btn-block btn-facebook btn-lg">đăng nhập bằng <strong>Facebook</strong></button>

                <p className="apollo-seperator"> or </p>

                <form onSubmit={this.handleSubmit} className="form-signin" id="apollo-register-form" method="post" action="">
                    <div className="form-group">
                        <input ref="reg_email" type="text" defaultValue="" id="reg_email" className="form-control email" placeholder="Email" required/>
                    </div>

                    <div className="form-group">
                        <input ref="reg_password" id="reg_password" type="password" defaultValue="" className="form-control" placeholder="Password" required/>
                    </div>

                    <div className="form-group">
                        <input ref="reg_repassword" id="reg_repassword" type="password" defaultValue="" className="form-control" placeholder="Xác nhận password" required/>
                    </div>


                    <p className="apollo-seperator"> Thông tin về bạn </p>

                    <div className="form-group">
                        <input ref="reg_fullname"  type="text" defaultValue="" className="form-control" id="reg_fullname" placeholder="Họ và tên" required/>
                    </div>

                    <div className="form-group">
                        <input ref="reg_phone" type="text" defaultValue="" className="form-control" id="reg_phone" placeholder="Số điện thoại" required/>
                    </div>


                    <button className="btn btn-lg btn-block btn-primary" type="submit">đăng ký</button>
                </form>

                <p className="apollo-back">
                    <a onClick={this.props.formLogin} href="javascript:void(0)" ><i className="icon-arrow-left"></i> Quay về trang đăng nhập</a>
                </p>
            </div>
        );
    }
});


var FormForgot = React.createClass({
    render(){
        return(
            <div className="apollo-forgotten-password">
                <button className="btn btn-block btn-facebook btn-lg">đăng nhập bằng <strong>Facebook</strong></button>

                <p className="apollo-seperator"> or </p>

                <div id="error-container"></div>

                <form className="form-signin" id="apollo-forgotten-password-form">
                    <div className="form-group">
                        <input type="text" defaultValue="" className="form-control email" placeholder="Email address"/>
                    </div>
                    <button className="btn btn-lg btn-block btn-primary" type="submit">Reset password</button>
                </form>

                <p className="apollo-back">
                    <a onClick={this.props.formLogin} href="javascript:void(0)"><i className="icon-arrow-left"></i> back to login</a>
                </p>
            </div>

        );
    }
});


function setOrPush(target, val) {
    var result = val;
    if (target) {
        result = [target];
        result.push(val);
    }
    return result;
}

function getFormResults(formElement) {
    var formElements = formElement.elements;
    var formParams = {};
    var i = 0;
    var elem = null;
    for (i = 0; i < formElements.length; i += 1) {
        elem = formElements[i];
        switch (elem.type) {
            case 'submit':
                break;
            case 'radio':
                if (elem.checked) {
                    formParams[elem.name] = elem.value;
                }
                break;
            case 'checkbox':
                if (elem.checked) {
                    formParams[elem.name] = setOrPush(formParams[elem.name], elem.value);
                }
                break;
            default:
                formParams[elem.name] = setOrPush(formParams[elem.name], elem.value);
        }
    }
    return formParams;
}

ReactDOM.render(
    <LayoutLogin></LayoutLogin>
    ,
    document.getElementById('app-chat-body')
);
ReactDOM.render(
    <LayoutHeader></LayoutHeader>
    ,
    document.getElementById('app-chat-header')
);