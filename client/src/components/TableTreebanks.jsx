import React, { useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { useSelector } from 'react-redux';

import TableItemTask from '../components/TableItemTask';
import styles from '../styles/TableTreebanks.module.css';
import legendStyles from '../styles/TableItemTask.module.css';

const TableTreebanks = () => {
  const { tbMap, idTaskMap, idUserMap } = useSelector((state) => state.data);
  let treebanks = Object.keys(tbMap);

  useEffect(() => {
    console.log(tbMap);
  }, []);

  return (
    <div className={styles.container}>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Treebanks</th>
            <th>Users</th>
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {treebanks.map((tb, i) => {
            return (
              <tr key={i}>
                <th>{tb}</th>
                <th>
                  <div className={styles.usersContainer}>
                    {tbMap[tb].users.map((id, i) => (
                      <span key={i}>{idUserMap[id].username}</span>
                    ))}
                  </div>
                </th>
                <th>
                  <div className={styles.tasksContainer}>
                    {tbMap[tb].tasks.map((task, i) => (
                      <TableItemTask task={idTaskMap[task]} key={i} />
                    ))}
                  </div>
                </th>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className={legendStyles.legendContainer}>
        <div className={legendStyles.legend}>
          <div
            className={`${legendStyles.progressBar} ${legendStyles.notStarted}`}
          />
          <p className={legendStyles.legendtext}> - No annotators</p>
        </div>

        <div className={legendStyles.legend}>
          <div
            className={`${legendStyles.progressBar} ${legendStyles.incomplete}`}
          />
          <p className={legendStyles.legendtext}> - Annotation in progress</p>
        </div>

        <div className={legendStyles.legend}>
          <div
            className={`${legendStyles.progressBar} ${legendStyles.completed}`}
          />
          <p className={legendStyles.legendtext}> - Annotation completed</p>
        </div>

        <div className={legendStyles.legend}>
          <div
            className={`${legendStyles.progressBar} ${legendStyles.adjudicating}`}
          />
          <p className={legendStyles.legendtext}> - Adjudication in progress</p>
        </div>

        <div className={legendStyles.legend}>
          <div
            className={`${legendStyles.progressBar} ${legendStyles.adjudicated}`}
          />
          <p className={legendStyles.legendtext}> - Adjudication completed</p>
        </div>
      </div>
    </div>
  );
};

export default TableTreebanks;
