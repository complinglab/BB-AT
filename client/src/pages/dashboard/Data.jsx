import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Loading from '../../components/Loading';

import { getExpt, getData } from '../../redux';
import NavBar from '../../components/NavBar';
import TableTasks from '../../components/TableTasks';
import TableUsers from '../../components/TableUsersData';
import TableTreebanks from '../../components/TableTreebanks';

const Resources = () => {
  const dispatch = useDispatch();
  let { experiment, error } = useSelector((state) => state.expt);
  let { tasks, error: taskError } = useSelector((state) => state.data);

  useEffect(() => {
    if (!experiment) dispatch(getExpt());
  }, [experiment, dispatch]);

  useEffect(() => {
    if (experiment) {
      if (!tasks) dispatch(getData(experiment._id));
    }
  }, [experiment, tasks, dispatch]);

  if (!tasks) {
    return (
      <>
        <NavBar />
        <Loading
          error={taskError ? taskError.message : error ? error.message : ''}
        />
      </>
    );
  }

  return (
    <>
      <NavBar />

      <Tabs defaultActiveKey='treebanks' id='resources-tab'>
        <Tab eventKey='treebanks' title='Treebanks'>
          <TableTreebanks />
        </Tab>
        <Tab eventKey='tasks' title='Tasks'>
          <TableTasks />
        </Tab>
        <Tab eventKey='users' title='Users'>
          <TableUsers />
        </Tab>
      </Tabs>
    </>
  );
};

export default Resources;
