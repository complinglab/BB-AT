import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import store from "./redux";
import "./index.css";
import "./styles.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// expose store when run in Cypress
if (window.Cypress) {
  window.store = store;
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
