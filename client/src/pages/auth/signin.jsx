import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';

import { handleLogin } from '../../providers/auth';
import styles from './Signin.module.css';
import * as api from '../../services/auth';

const UserSchema = Yup.object({
  username: Yup.string().required('Required').min(4, 'Too short.'),
  password: Yup.string().required('Required').min(6, 'Too short.'),
});

function Signin(props) {
  const dispatch = useDispatch();

  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function authenticateUser({ username, password }) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      let response = await api.signin({ username, password });
      dispatch(handleLogin(response));

      if (response.role === 'annotator') props.history.push('/treebank');
      if (response.role === 'experimenter')
        props.history.push('/dashboard/users');
      if (response.role === 'adjudicator') props.history.push('/treebank');
    } catch (error) {
      console.log(error);
      setServerError(error.message);
    }
    setIsSubmitting(false);
  }

  return (
    <div className={styles.container}>
      <h2>Sign in to get started!</h2>

      <div className={styles.inputContainer}>
        <Formik
          initialValues={{
            username: '',
            password: '',
          }}
          validationSchema={UserSchema}
          onSubmit={(values) => authenticateUser(values)}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form>
              <FormGroup controlId='signinusername'>
                <FormControl
                  name='username'
                  placeholder='Enter Username'
                  onChange={handleChange}
                  value={values.username}
                  isInvalid={touched.username && errors.username}
                  data-test='signinform-username'
                />
                <FormControl.Feedback type='invalid'>
                  {errors.username}
                </FormControl.Feedback>
              </FormGroup>

              <FormGroup controlId='signinpassword'>
                <FormControl
                  name='password'
                  type='password'
                  placeholder='Password'
                  onChange={handleChange}
                  value={values.password}
                  isInvalid={touched.password && errors.password}
                  data-test='signinform-password'
                />
                <FormControl.Feedback type='invalid'>
                  {errors.password}
                </FormControl.Feedback>
              </FormGroup>

              <Button
                className={styles.signinButton}
                disabled={isSubmitting}
                variant='primary'
                data-test='signinform-button'
                type='submit'
              >
                {isSubmitting ? (
                  <div>
                    <Spinner
                      as='span'
                      animation='grow'
                      size='sm'
                      role='status'
                      aria-hidden='true'
                    />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              {serverError && <p className={styles.errorText}>{serverError}</p>}
            </Form>
          )}
        </Formik>
      </div>

      <div className={styles.signupButton}>
        <Link to='/signup'>
          <span>Sign Up</span>
        </Link>
      </div>
    </div>
  );
}

export default Signin;
