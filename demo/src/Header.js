import React, { Component } from "react";

class Header extends Component {
  render() {
    return (
      <div className="demo-header">
        <div className="demo-header--title">MIE-POC-ChatBot</div>
        <div className="demo-header--links">
          <a href="https://mieweb.org/">MIE</a>
        </div>
      </div>
    );
  }
}

export default Header;
