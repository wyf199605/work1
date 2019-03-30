
import React, { Component } from 'react';
import "./Welcome.scss";
export class Welcome extends Component {
 
    render() {
        // console.log(this.props)
        console.log(this.state)
        return <h1 className="welcome">Hello,world</h1>;
    }
}