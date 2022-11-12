import React from 'react';
// import Table from 'react-bootstrap/Table';
import { useSelector } from 'react-redux';

import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';

import TableItemTask from '../components/TableItemTask';
import { taskStatus } from '../utils/data';
import styles from '../styles/TableTasks.module.css';

// const { SearchBar } = Search;

const TaskView = (task) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <p style={{ marginBottom: 0, marginRight: 5 }}>{task._id}</p>
    <TableItemTask task={task} />
  </div>
);

const TableTasks = () => {
  const { tasks } = useSelector((state) => state.data);
  const { experiment } = useSelector((state) => state.expt);
  let { numShared, numSharedAdju } = experiment.parameters;

  let columns = [
    {
      dataField: 'id',
      text: 'Task Id',
      sort: true,
      sortFunc: (a, b, order, dataField, rowA, rowB) => {
        let taskA = a.props.children[1].props.task;
        let taskB = b.props.children[1].props.task;
        let orderVal;
        if (order === 'asc') orderVal = 1;
        else orderVal = -1;

        if (taskStatus(taskA, 'adjudicated', numShared, numSharedAdju))
          return orderVal;
        if (taskStatus(taskA, 'adjudicating', numShared, numSharedAdju)) {
          if (!taskStatus(taskB, 'adjudicated', numShared, numSharedAdju))
            return orderVal;
        } else if (taskStatus(taskA, 'completed', numShared, numSharedAdju)) {
          if (taskB.adjudicators && taskB.adjudicators.length > 0)
            return -orderVal;
          return orderVal;
        } else if (taskStatus(taskA, 'active', numShared, numSharedAdju)) {
          if (taskB.adjudicators && taskB.adjudicators.length > 0)
            return -orderVal;
          return orderVal;
        }
        return -orderVal;
      },
    },
    {
      dataField: 'treebank',
      text: 'Treebank',
      sort: true,
    },
    {
      dataField: 'users',
      text: 'Users',
      sort: true,
    },
  ];

  let rows = tasks.map((task) => {
    let annotators = task.subjects.map((sub) => sub.username);
    let adjudicators = task.adjudicators.map((sub) => sub.username);
    return {
      id: TaskView(task),
      treebank: task.treebank,
      users: [...annotators, ...adjudicators].map((e) => (
        <p style={{ margin: 0 }}>{e}</p>
      )),
    };
  });

  return (
    <div className={styles.container}>
      <ToolkitProvider
        keyField='id'
        data={rows}
        columns={columns}
        search
        bootstrap4
      >
        {(props) => (
          <div>
            {/* <SearchBar { ...props.searchProps } /> */}
            <BootstrapTable
              {...props.baseProps}
              striped
              hover
              pagination={paginationFactory()}
            />
          </div>
        )}
      </ToolkitProvider>
    </div>
  );
};

export default TableTasks;
