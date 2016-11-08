var socket = io('http://localhost:3000');
var $this = this;

var main = {
    clickConnect : function () {
        socket.emit('_connect', function(data){
        });
        $('#btnConnect').hide();
    },

    loadPrivateChat : function (friendSocketId){
        ReactDOM.unmountComponentAtNode(document.getElementById('app-chat'));
        ReactDOM.render(
            <div>
                <LayoutHeader></LayoutHeader>
                <LayoutBodyPrivateChat friendSocketId={friendSocketId}></LayoutBodyPrivateChat>
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

var Friend = React.createClass({
    render(){
        var item = this.props.item;
        return(
            <a href="javascript:void(0)" onClick={() => {$this.privateChat(item.socketId)}}>
                <div className="media">
                    <div className="pull-left">
                        <div className="avata"><img src="images/logo-comp-beat.png" className="img-circle" /></div>
                    </div>
                    <div className="media-body">
                        <h4 className="comp-name">{item.userName}</h4>
                        <h5 className="job">Research Engineer (NLP) - Python, Java</h5>
                        <small className="message">{item.messages} </small><span className="time">18: 00pm</span>
                    </div>
                </div>
            </a>
        );
    }
});

var LayoutBodyListFriend = React.createClass({
    getInitialState(){
        $this = this;
        return{userInfo : []};
    },
    componentDidMount() {
        socket.on('send_user_connect', this._initialize);
    },

    _initialize(data) {
        console.log(data);
        this.state.userInfo.push(data);
        this.setState(this.state);
        console.log(this.state);
    },
    privateChat(friendSocketId){
        socket.on('private_chat', friendSocketId);
        ReactDOM.unmountComponentAtNode(document.getElementById('app-chat'));
        main.loadPrivateChat(friendSocketId);
    },
    render(){
        var sHtml = $this.state.userInfo.map(function(item,key){
            return(
                <li key={key}>
                    <Friend item={item} ></Friend>
                </li>
            );
        });
        return(
            <div className="chat-container">
                <button id="btnConnect" onClick={main.clickConnect}>Connect</button>
                <div className="data-content">
                    <ul className="chat-contacts contacts-cpn">
                        {sHtml}
                    </ul>
                </div>
            </div>
        );
    },
});

/**
 *
 */
var LayoutBodyPrivateChat = React.createClass({
    getInitialState() {
        console.log($this.state);
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
        console.log('emit');
        socket.emit('send_message', message);
    },

    exitPrivateChat(){
        ReactDOM.render(
            <div>
                <LayoutHeader></LayoutHeader>
                <LayoutBodyListFriend></LayoutBodyListFriend>
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
                    <MessageForm onMessageSubmit={this.handleMessageSubmit} userName={this.state.userName} socketId={this.props.socketId}></MessageForm>
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
            userId : $this.state.userId,
            userName : $this.state.userName,
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

ReactDOM.render(
    <div>
        <LayoutHeader></LayoutHeader>
        <LayoutBodyListFriend></LayoutBodyListFriend>
    </div>,
    document.getElementById('app-chat')
);
