import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

import { getExpt } from '../../redux';
import NavBar from '../../components/NavBar';
import Loading from '../../components/Loading';
import TableUsers from '../../components/TableUsers';
import styles from '../../styles/DashboardUsers.module.css';
import * as api from '../../services/dashboard';

const NewUserSchema = Yup.object({
  username: Yup.string().required('Required').min(4, 'Too short.'),
  password: Yup.string().required('Required').min(6, 'Too short.'),
});

const Users = () => {
  const dispatch = useDispatch();

  const [newUserError, setNewUserError] = useState(null);
  let { experiment, error } = useSelector((state) => state.expt);
  // const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!experiment) dispatch(getExpt());
  }, [experiment, dispatch]);

  const [addingUser, setAddingUser] = useState(false);

  if (!experiment) {
    return (
      <>
        <NavBar />
        <Loading error={error ? error.message : null} />
      </>
    );
  }

  return (
    <>
      <NavBar />

      <div className={styles.container}>
        <div className={styles.tableContainer}>
          <TableUsers />
        </div>

        <div className={styles.newUserContainer}>
          <Formik
            initialValues={{
              username: '',
              password: '',
              role: 'annotator',
            }}
            validationSchema={NewUserSchema}
            onSubmit={async (values, { resetForm }) => {
              let newUser = { ...values, experiment: experiment._id };
              setAddingUser(true);
              try {
                await api.createUser({
                  ...newUser,
                  experiment: experiment._id,
                });
                dispatch(getExpt());
                setAddingUser(false);
                resetForm();
              } catch (err) {
                setNewUserError(err.message);
                setAddingUser(false);
              }
            }}
          >
            {({ values, errors, touched, handleChange }) => (
              <Form>
                <FormGroup>
                  <FormControl
                    name='username'
                    placeholder='Enter Username'
                    onChange={handleChange}
                    value={values.username}
                    isValid={touched.username && !errors.username}
                    isInvalid={touched.username && errors.username}
                  />
                  <FormControl.Feedback type='valid'>
                    Looks good!
                  </FormControl.Feedback>
                  <FormControl.Feedback type='invalid'>
                    {errors.username}
                  </FormControl.Feedback>
                </FormGroup>

                <FormGroup>
                  <FormControl
                    name='password'
                    type='password'
                    placeholder='Password'
                    onChange={handleChange}
                    value={values.password}
                    isValid={touched.password && !errors.password}
                    isInvalid={touched.password && errors.password}
                  />
                  <FormControl.Feedback type='valid'>
                    Looks good!
                  </FormControl.Feedback>
                  <FormControl.Feedback type='invalid'>
                    {errors.password}
                  </FormControl.Feedback>
                </FormGroup>

                <FormControl
                  as='select'
                  id='role'
                  name='role'
                  onChange={handleChange}
                  value={values.role}
                >
                  <option>annotator</option>
                  <option>adjudicator</option>
                </FormControl>

                <Button
                  variant='primary'
                  type='submit'
                  disabled={addingUser}
                  style={{ marginTop: 20 }}
                >
                  {addingUser ? (
                    <div>
                      <span>Creating...</span>
                      <Spinner
                        as='span'
                        animation='grow'
                        size='sm'
                        role='status'
                        aria-hidden='true'
                      />
                    </div>
                  ) : (
                    'Create User'
                  )}
                </Button>
                {newUserError && (
                  <p className={styles.errorText}>{newUserError}</p>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default Users;
