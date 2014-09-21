/** @jsx React.DOM */
var React = require('react');


var Placeholder = React.createClass({
  render : function(){
    return (
      <div>
        placeholder state ...
      </div>
    );
  }
});

module.exports = {
  'splash' : Placeholder,
  'selection' : Placeholder,
  'game' : Placeholder,
  'credits' : Placeholder,
};
