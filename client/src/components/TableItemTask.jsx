import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useSelector } from 'react-redux';
import Table from 'react-bootstrap/Table';

import { taskStatus } from '../utils/data';
import ModalBody from 'react-bootstrap/ModalBody';
import styles from '../styles/TableItemTask.module.css';
var classNames = require('classnames');

const TaskModal = ({ task, ...props }) => {
  const idUserMap = useSelector((state) => state.data.idUserMap);

  return (
    <Modal {...props} size='lg' centered>
      <Modal.Header closeButton>
        <Modal.Title id='modal-task-title'>Task {task._id}</Modal.Title>
      </Modal.Header>

      <ModalBody>
        {task.subjects && task.subjects.length ? (
          <>
            <h5>Annotators</h5>
            <Table striped bordered hover size='sm'>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Sentence Progress</th>
                </tr>
              </thead>
              <tbody>
                {task.subjects.map((sub, i) => (
                  <tr key={i}>
                    <th>{idUserMap[sub.subjectId].username}</th>
                    <th>
                      {sub.sentIndex + 1} out of {task.sents.length}
                    </th>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : null}

        {task.adjudicators && task.adjudicators.length ? (
          <>
            <h5>Adjudicators</h5>
            <Table striped bordered hover size='sm'>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Sentence Progress</th>
                </tr>
              </thead>
              <tbody>
                {task.adjudicators.map((sub, i) => (
                  <tr key={i}>
                    <th>{idUserMap[sub.subjectId].username}</th>
                    <th>
                      {sub.sentIndex + 1} out of {task.sents.length}
                    </th>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : null}
      </ModalBody>

      <Modal.Footer>
        <p>{task.treebank}</p>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

const TableItemTask = ({ task }) => {
  const { experiment } = useSelector((state) => state.expt);
  let { numShared, numSharedAdju } = experiment.parameters;

  const [modalShow, setModalShow] = React.useState(false);

  return (
    <>
      <span onClick={() => setModalShow(true)}>
        <div
          style={{ margin: '2px' }}
          className={classNames({
            [styles.progressBar]: true,
            [styles.adjudicated]: taskStatus(
              task,
              'adjudicated',
              numShared,
              numSharedAdju
            ),
            [styles.adjudicating]: taskStatus(
              task,
              'adjudicating',
              numShared,
              numSharedAdju
            ),
            [styles.completed]: taskStatus(
              task,
              'completed',
              numShared,
              numSharedAdju
            ),
            [styles.incomplete]: taskStatus(
              task,
              'active',
              numShared,
              numSharedAdju
            ),
            [styles.notStarted]: taskStatus(
              task,
              'inactive',
              numShared,
              numSharedAdju
            ),
          })}
        ></div>
        {/* {task._id} */}
      </span>

      <TaskModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        task={task}
      />
    </>
  );
};

export default TableItemTask;
