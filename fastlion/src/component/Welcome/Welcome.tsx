
import React, { Component } from 'react';
import "./Welcome.scss";
type Props = {
    foo: string;
};
interface IState {
    count: number,
}
export class Welcome extends Component<Props, IState> {
    public state = {
        count: 1
    }
    change = () => {
        this.setState({
            count: ++this.state.count
        })
    }
    render() {
        console.log(this.state)
        return <span className='welcome' onClick={this.change}>{this.props.foo}{this.state.count}</span>;
    }
}