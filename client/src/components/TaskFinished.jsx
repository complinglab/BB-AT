import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useHistory } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';

import styles from '../styles/TaskFinished.module.css';
import * as api from '../services/treebank';

const TaskFinished = ({ handleSignOut, status }) => {
  const history = useHistory();

  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState(null);

  const handleContinue = async () => {
    console.log('treebank resetting');
    setIsResetting(true);
    try {
      await api.treebankReset({ status });
      history.push('/treebank');
    } catch (err) {
      setIsResetting(false);
      setResetError(err.message);
      console.log(err);
    }
  };

  return (
    <div
      className={styles.container}
      data-test='continue'
      style={{ minHeight: '80vh' }}
    >
      <h3 className={styles.titleText}>
        You have finished all available tasks
      </h3>

      <h5 className={styles.titleText}>
        Press Continue to choose another treebank or press Signout to exit
      </h5>

      <div className={styles.buttonContainer}>
        <Button
          variant='primary'
          onClick={() => handleContinue()}
          style={{ marginRight: 15 }}
          data-test='button-continue-newTreebank'
        >
          {isResetting ? (
            <div>
              <Spinner
                as='span'
                animation='grow'
                size='sm'
                role='status'
                aria-hidden='true'
              />
              <span>Continuing...</span>
            </div>
          ) : (
            'Continue'
          )}
        </Button>

        <Button
          variant='primary'
          onClick={() => handleSignOut()}
          data-test='button-signout'
        >
          Signout
        </Button>
      </div>
      {resetError && <p className={styles.errorText}>{resetError}</p>}
    </div>
  );
};

export default TaskFinished;
