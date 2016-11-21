var React = require('react');
var Header = React.createClass({
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

module.exports = Header;