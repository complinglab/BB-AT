import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';

import styles from './Signup.module.css';
import * as api from '../../services/auth';

const ExperimenterSchema = Yup.object({
  email: Yup.string().email(),
  username: Yup.string().required('Required').min(4, 'Too short.'),
  password: Yup.string().required('Required').min(6, 'Too short.'),
});

function Signup(props) {
  const [serverError, setServerError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function register(values) {
    const { email, password, username } = values;
    setServerError(null);
    try {
      await api.signup({ email, password, username });
      setSignupSuccess(true);
    } catch (error) {
      setServerError(error.message);
    }
    setIsSubmitting(false);
  }

  return (
    <div className={styles.container}>
      <h2>Make an account to set up your experiment!</h2>

      <div className={styles.inputContainer}>
        <Formik
          initialValues={{
            email: '',
            username: '',
            password: '',
          }}
          validationSchema={ExperimenterSchema}
          onSubmit={(values) => register(values)}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form>
              <FormGroup>
                <FormControl
                  name='username'
                  placeholder='Enter Username'
                  onChange={handleChange}
                  value={values.username}
                  isInvalid={touched.username && errors.username}
                />
                <FormControl.Feedback type='invalid'>
                  {errors.username}
                </FormControl.Feedback>
              </FormGroup>

              <FormGroup>
                <FormControl
                  name='email'
                  placeholder='Enter Email'
                  onChange={handleChange}
                  value={values.email}
                  isInvalid={touched.email && errors.email}
                />
                <FormControl.Feedback type='invalid'>
                  {errors.email}
                </FormControl.Feedback>
              </FormGroup>

              <FormGroup>
                <FormControl
                  name='password'
                  type='password'
                  placeholder='Password'
                  onChange={handleChange}
                  value={values.password}
                  isInvalid={touched.password && errors.password}
                />
                <FormControl.Feedback type='invalid'>
                  {errors.password}
                </FormControl.Feedback>
              </FormGroup>

              <Button
                className={styles.signupButton}
                disabled={isSubmitting | signupSuccess}
                variant='primary'
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
                    <span>Signing Up...</span>
                  </div>
                ) : (
                  'Submit'
                )}
              </Button>

              {serverError && <p className={styles.errorText}>{serverError}</p>}
              {signupSuccess && (
                <p className={styles.successText}>
                  You have signed up successfully. Please sign in to continue
                </p>
              )}
            </Form>
          )}
        </Formik>
      </div>

      <div className={styles.signinButton}>
        <Link to='/'>
          <span>Sign In</span>
        </Link>
      </div>
    </div>
  );
}

export default Signup;
