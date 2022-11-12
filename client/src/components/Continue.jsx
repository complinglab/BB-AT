import React from 'react';
import Button from 'react-bootstrap/Button';
import styles from '../styles/Continue.module.css'

const Continue = (props) => {

  return (
    <div className={styles.container} data-test="continue">
      <h3 className={styles.titleText}>You have finished the alloted tasks. Your progress has been saved.</h3>

      <h5 className={styles.titleText}>Would you like to continue or exit</h5>

      <div className={styles.buttonContainer}>
        <Button
          variant="primary"
          onClick={props.handleContinue}
          style={{marginRight: 15}}
          data-test="button-continue"
        >
        Continue
        </Button>

        <Button
          variant="primary"
          onClick={props.handleSignOut}
          data-test="button-signout"
        >
        Signout
        </Button>
      </div>
    </div>
    
  )
}

export default Continue