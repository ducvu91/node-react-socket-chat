var React       = require('react');
var ReactDom    = require('react-dom');

var rootCom     = './components';
var main        = require('./common/main');

/* Components */
var Header      = require( rootCom + '/layouts/Header');
var AppIndex    = require( rootCom + '/app/Index' );

var Container = React.createClass({
    getInitialState(){
        return {component : <AppIndex></AppIndex>};
    },
    render(){
        return(this.state.component);
    }
});


ReactDom.render(
    <div>
        <Header></Header>
        <Container></Container>
    </div>
    , document.getElementById('root-app')
);