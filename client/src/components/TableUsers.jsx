import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { MdDeleteForever } from 'react-icons/md';
import Spinner from 'react-bootstrap/Spinner';

import styles from '../styles/TableUsers.module.css';
import * as api from '../services/dashboard';
import { getExpt } from '../redux';
import { Table } from 'react-bootstrap';

const TableUsers = () => {
  const dispatch = useDispatch();
  const { experiment } = useSelector((state) => state.expt);
  const [rows, setRows] = useState(null);
  const [columns, setColumns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteUser, setDeleteUser] = useState(null);
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let columns = [
      {
        dataField: 'username',
        text: 'User',
        headerStyle: { width: 180 },
      },
      {
        dataField: 'role',
        text: 'Role',
        headerStyle: { width: 150 },
      },
      {
        dataField: 'delete',
        text: 'Delete',
        headerStyle: { width: 90 },
      },
    ];

    let rows = experiment.subjects.map((sub) => {
      console.log('row:', sub);
      return {
        ...sub,
        delete: DeleteUser(sub.id, experiment._id, sub.role),
      };
    });

    setColumns(columns);
    setRows(rows);
    setLoading(false);
  }, [experiment, dispatch]);

  const DeleteUser = (userId, experimentId, role) => {
    return (
      <MdDeleteForever
        color='red'
        className={styles.deleteIcon}
        onClick={() => handleDeleteUser(userId, experimentId, role)}
      />
    );
  };

  function handleDeleteUser(userId, experimentId, role) {
    setDeleteUser({ userId, experimentId, role });
    setConfirmDeletion(true);
  }

  async function handleConfirmDeletion() {
    setIsDeleting(true);
    try {
      await api.deleteUser(deleteUser);
      dispatch(getExpt());
      setIsDeleting(false);
      setConfirmDeletion(false);
    } catch (err) {
      setDeleteError(err.message);
      setIsDeleting(false);
    }
  }

  // DELETE USER CONFIRMATION MODAL
  const handleClose = () => {
    setDeleteError(null);
    setConfirmDeletion(false);
  };

  if (loading) return <>Loading...</>;

  return (
    <>
      {rows.length > 0 ? (
        <Table striped bordered hover size='sm'>
          <thead>
            <tr>
              <th>#</th>
              {columns.map((col, i) => (
                <th key={i}>{col.text}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={'row-' + i + 1}>
                <td>{i + 1}</td>
                <td>{row.username}</td>
                <td>{row.role}</td>
                <td>{row.delete}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p my={1}>No users found!</p>
      )}

      <Modal show={confirmDeletion} onHide={handleClose}>
        <Modal.Dialog>
          <Modal.Header closeButton>
            <Modal.Title>Warning!</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>
              Are you sure you want to delete user. All data related to user
              will be permanently deleted.
            </p>

            {deleteError && <p className={styles.errorText}>{deleteError}</p>}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant='primary'
              onClick={handleConfirmDeletion}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div>
                  <span>Deleting...</span>
                  <Spinner
                    as='span'
                    animation='grow'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                  />
                </div>
              ) : (
                'Confirm'
              )}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>
    </>
  );
};

export default TableUsers;
