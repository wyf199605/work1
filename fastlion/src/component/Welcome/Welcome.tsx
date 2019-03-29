
import React, { Component } from 'react';
import "./Welcome.scss";
type Props = {
    name: string
}
type State = {
    a: number,
    b: number
};

export class Welcome extends Component<Props, State> {
    readonly state: State = {
        a: 1,
        b: 2
    }
    constructor() {
        super()
    }
    changeHandle = () => {
        this.setState({ a: ++this.state.a })
    }
    render() {
        // console.log(this.props)
        console.log(this.state)
        return <h1 className="welcome" onClick={this.changeHandle}>Hello,world{this.props.name}</h1>;
    }
}