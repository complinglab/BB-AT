import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import isEqual from "lodash/isEqual";
import * as api from "../services/dashboard";
import { getExpt, updateTagsAction } from "../redux";
import { handleLogout } from "../providers/auth";
import { logoutExptAction, logoutDataAction } from "../redux";

const NavBar = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  // console.log(history.location.pathname);
  const { tagsModified, experiment } = useSelector((state) => state.expt);
  const [saving, setSaving] = useState(false);
  const [savingParas, setSavingParas] = useState(false);
  const [modified, setModified] = useState(false);
  const [parasModified, setParasModified] = useState(false);

  const token = localStorage.getItem("token");
  if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const handleSave = () => {
    setSaving(true);
    api
      .updateTag({ tags: tagsModified, id: experiment._id })
      .then((res) => {
        dispatch(getExpt());
        dispatch(updateTagsAction({ tagsModified: [...tagsModified] }));
        setSaving(false);
      })
      .catch((err) => {
        console.log("SAVE ERROR", err.message);
        setSaving(false);
      });
  };

  const handleParasSave = () => {
    setSavingParas(true);
    api
      .updateParas({ parameters: parasModified, id: experiment._id })
      .then((res) => {
        dispatch(getExpt());
        // dispatch(updateTagsAction( {tagsModified: [...tagsModified]} ))
        setSavingParas(false);
      })
      .catch((err) => {
        console.log("SAVE ERROR", err.message);
        setSavingParas(false);
      });
  };

  useEffect(() => {
    if (tagsModified && experiment.tags) {
      let equality = isEqual(tagsModified, experiment.tags);
      setModified(!equality);
    }
  }, [JSON.stringify(tagsModified), JSON.stringify(experiment)]);

  useEffect(() => {
    if (parasModified && experiment.parameters) {
      let equality = isEqual(parasModified, experiment.parameters);
      setParasModified(!equality);
    }
  }, [JSON.stringify(parasModified), JSON.stringify(experiment)]);

  return (
    <Navbar bg="primary" variant="dark">
      <Navbar.Brand href="/dashboard/users">Dashboard</Navbar.Brand>
      <Nav className="mr-auto" activeKey={history.location.pathname}>
        <Nav.Link
          eventKey="/dashboard/users"
          onClick={() => history.push("/dashboard/users")}
        >
          Users
        </Nav.Link>
        <Nav.Link
          eventKey="/dashboard/tags"
          onClick={() => history.push("/dashboard/tags")}
        >
          Tags
        </Nav.Link>
        <Nav.Link
          eventKey="/dashboard/parameters"
          onClick={() => history.push("/dashboard/parameters")}
        >
          Parameters
        </Nav.Link>
        <Nav.Link
          eventKey="/dashboard/data"
          onClick={() => history.push("/dashboard/data")}
        >
          Data
        </Nav.Link>
      </Nav>
      {modified ? (
        <Button
          variant="danger"
          onClick={() => handleSave()}
          style={{ alignSelf: "center" }}
        >
          {saving ? (
            <div>
              <span>Saving...</span>
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            </div>
          ) : (
            "Save Tags"
          )}
        </Button>
      ) : null}

      {parasModified ? (
        <Button
          variant="danger"
          onClick={() => handleParasSave()}
          style={{ alignSelf: "center" }}
        >
          {savingParas ? (
            <div>
              <span>Saving...</span>
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            </div>
          ) : (
            "Save Parameters"
          )}
        </Button>
      ) : null}
      <p className="expt-id">
        Expt ID: {experiment ? experiment._id : "loading"}
      </p>
      <div style={{ justifySelf: "flex-end" }}>
        <Button
          variant="primary"
          onClick={async () => {
            localStorage.removeItem("token");
            history.push("/");
            dispatch(await handleLogout());
            dispatch(logoutExptAction());
            dispatch(logoutDataAction());
          }}
        >
          Signout
        </Button>
      </div>
    </Navbar>
  );
};

export default NavBar;
