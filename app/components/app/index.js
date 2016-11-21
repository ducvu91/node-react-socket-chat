var React = require('react');
var AppFriend = require('./Friend');

var AppIndex = React.createClass({

    getInitialState(){
        return{listFriend : []};

    },
    render(){
        var listFriend = this.state.listFriend.map(function(item,key){

            if(item.id != $thisUser.id)
            {
                return(
                    <li key={key}>
                        <AppFriend item={item} ></AppFriend>
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

module.exports = AppIndex;