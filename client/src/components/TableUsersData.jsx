import React from 'react';
import Table from 'react-bootstrap/Table';
import { useSelector } from 'react-redux';

import styles from '../styles/TableUsers.module.css';

const TableUsers = () => {
  const { idUserMap, idTaskMap } = useSelector((state) => state.data);

  const users = Object.keys(idUserMap);

  return (
    <div className={styles.container}>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>User</th>
            <th>Treebank Selected</th>
            <th>Role</th>
            <th>Tasks alloted</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            return (
              <tr key={user}>
                <th>{idUserMap[user].username}</th>
                <th>{idUserMap[user].task.treebank}</th>
                <th>{idUserMap[user].role}</th>
                <th>
                  <div>
                    {idUserMap[user].task.finishedTasks.map((taskId) => (
                      <div
                        key={taskId}
                        className={`${styles.progressBar} ${styles.completed}`}
                      ></div>
                    ))}
                    {idUserMap[user].task.currentTask ? (
                      <div
                        className={`${styles.progressBar} ${styles.incomplete}`}
                      ></div>
                    ) : null}
                  </div>
                </th>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default TableUsers;
