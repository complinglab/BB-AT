import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { useDispatch } from "react-redux";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "tippy.js/dist/tippy.css";

import { handleLogin } from "./providers/auth";
import Signin from "./pages/auth/signin";
import Signup from "./pages/auth/signup";

import Users from "./pages/dashboard/Users";
import Tags from "./pages/dashboard/Tags";
import Data from "./pages/dashboard/Data";
import Tool from "./pages/annotation/tool";
import Treebank from "./pages/annotation/treebank";
import AdjuTool from "./pages/adjudication/adjutool";
import AdjuTreebank from "./pages/adjudication/adjutreebank";
import Parameters from "./pages/dashboard/Parameters";
import NotFoundPage from "./pages/404";

function App() {
  // Persist user in store from localstorage
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  if (token && user) {
    dispatch(handleLogin({ token, user }));
  }

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Signin} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/dashboard/users" component={Users} />
        <Route exact path="/dashboard/tags" component={Tags} />
        <Route exact path="/dashboard/data" component={Data} />
        <Route exact path="/dashboard/parameters" component={Parameters} />
        <Route exact path="/treebank" component={Treebank} />
        <Route exact path="/tool" component={Tool} />
        <Route exact path="/adjutreebank" component={AdjuTreebank} />
        <Route exact path="/adjutool" component={AdjuTool} />
        <Route exact path="/404" component={NotFoundPage} />
        <Redirect to="/404" />
      </Switch>
    </Router>
  );
}

export default App;
