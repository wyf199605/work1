
import React, { Component } from 'react';
import Loadable from 'react-loadable';
import {
    HashRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import "./Welcome.scss";
const Loading = () => (
    <div>
        <h2>Loading......</h2>
    </div>
)

const AsyncHome = Loadable({
    loader: () => import(/* webpackChunkName: "OtherComponent" */'./OtherComponent'),
    loading: Loading
});
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
    static step=3;
    change = () => {
        this.setState({
            count: this.state.count+Welcome.step
        })
    }
    render() {
        return (
            <Router>
                <div>
                <span className='welcome' onClick={this.change}>{this.props.foo}{this.state.count}</span>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/topics">Topics24</Link></li>
                    </ul>
                    <hr />
                    <Route exact path="/" component={Home} />
                    <Route path="/about" component={About} />
                    <Route path="/topics" component={AsyncHome} />
                </div>
            </Router>
        )
    }
}
const Home = () => (
    <div>
        <h2>Home</h2>
    </div>
)
const About = () => (
    <div>
        <h2>About</h2>
    </div>
)
