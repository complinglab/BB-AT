import React from 'react'
import ReactLoading from 'react-loading';

import styles from '../styles/Loading.module.css'

export default function Loading ({ error, title }) {
  return (
    <div className={styles.container}>
      <div className={styles.loadingContainer}>
        <h2 className={styles.titleText}>{title}</h2>
        {error ? null : (
          <ReactLoading 
            type={"spin"} 
            color={"#8443d9"} 
            height={175} 
            width={175} 
          />
        )}
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    </div>

  )
}
          