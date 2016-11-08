var socket = io('http://localhost:3000');
var $this;
var $thisOtherUser = {};
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

var LayoutBody = React.createClass({
    getInitialState() {
        $this = this;
        return {userId : [], name: [], messages:[]};
    },

    componentDidMount() {
        socket.on('init', this._initialize);
        socket.on('send_message', this._messageRecieve);
    },

    _initialize(data) {
        var {userId, userName} = data;
        this.setState({userId, userName});
    },

    _messageRecieve(message) {
        $thisOtherUser = message;
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
        console.log(this.state);
    },

    handleMessageSubmit(message) {

        console.log($this.state.userId,$thisOtherUser.userId);
        if(message.userId != $this.state.userId)
        {
            var {messages} = this.state;
            messages.push(message);
            this.setState({messages});
        }
        socket.emit('send_message', message);
    },

    render(){
        return(
            <div className="chat-container">
                <div className="tophead-chat _clearfix">
                    <a href="candidate-chatlist.html" className="iconX"><i className="fa fa-times"></i> </a>
                    <div className="tabinfo-cpn">
                        <h4>SparkxLab</h4>
                        <h5>Research Engineer (NLP) - Python, Java</h5>
                    </div>
                </div>

                <div className="data-content js_dynamic_height">
                    <button className="SeeOlderMessages">See Older Messages</button>
                    <MessageList messages={this.state.messages}></MessageList>
                    <MessageForm onMessageSubmit={this.handleMessageSubmit} userName={this.state.userName}></MessageForm>
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
            userName : this.props.userName,
            text : this.state.text
        }
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
        <LayoutBody></LayoutBody>
    </div>
    ,document.getElementById('app')
);