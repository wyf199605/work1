import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import "./utils/response.js";
import { Welcome } from './component/Welcome/Welcome';
import "./style/index.scss";
declare var module: any;

ReactDOM.render(
  <Welcome foo='hello' />,
  document.getElementById('app'))

if (module.hot) {
  module.hot.accept();
}

