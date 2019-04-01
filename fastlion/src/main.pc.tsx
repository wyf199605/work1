import React from 'react';
import ReactDOM from 'react-dom';
import {Welcome} from './component/Welcome/Welcome';
import "./style/index.scss";
declare var module:any;
const App = () => {
  return (
    <div>
      <p>电脑端</p>
      <Welcome foo="wjb"/>
    </div>
  )
}

ReactDOM.render( <App />, document.getElementById('app'))

if (module.hot) {
  module.hot.accept();
}

