import React, { useState, useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Tab from 'react-bootstrap/Tab';
import Button from 'react-bootstrap/Button';
import { Redirect } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';

import styles from '../../styles/Treebank.module.css';
import Loading from '../../components/Loading';
import * as api from '../../services/treebank';

function Treebank(props) {
  const user = useSelector((state) => state.auth.user);
  const [treebanks, setTreebanks] = useState([]);
  const [tbMap, setTbMap] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signInRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [selectError, setSelectError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    (async function () {
      try {
        // Go to tool if treebank selected else fetch treebanks
        let res = await api.treebankCheck();

        console.log(res);

        if (res.selected) {
          console.log('treebank is selected and nav to ', user.role);
          if (user.role === 'annotator') props.history.push('/tool');
          else if (user.role === 'adjudicator') props.history.push('/adjutool');
        }

        let response = await api.treebanksGet();

        if (Object.keys(response).length === 0);
        setTbMap(response);
        setTreebanks(Object.keys(response));
        setLoading(false);
      } catch (err) {
        setServerError(err.message);
      }
    })();
  }, [token, props.history]);

  async function handleSubmit() {
    setSubmitting(true);
    setSelectError(null);

    try {
      await api.treebankSet({ treebank: selected });

      if (user.role === 'annotator') props.history.push('/tool');
      if (user.role === 'adjudicator') props.history.push('/adjutool');
    } catch (err) {
      setSelectError(err.message);
      setSubmitting(false);
    }
  }

  if (signInRequired) {
    return <Redirect to='/' />;
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Loading title='Loading Treebanks' error={serverError} />
      </div>
    );
  }

  return (
    <div className={styles.container} data-test='page-treebank'>
      <h2 className={styles.titleText}>Choose a Treebank to proceed</h2>

      <div className={styles.treebankListContainer}>
        <Tab.Container>
          <ListGroup className={styles.treebankList}>
            {treebanks.length !== 0 ? (
              treebanks.map((tb, i) => {
                let avail = tbMap[tb].count && !tbMap[tb].finished;
                return (
                  <ListGroup.Item
                    key={tb}
                    action={avail}
                    variant={avail ? 'primary' : 'danger'}
                    onClick={() => setSelected(tb)}
                    data-test={avail ? 'button-treebankselection' : 'disabled'}
                  >
                    {tb}
                  </ListGroup.Item>
                );
              })
            ) : (
              <p>
                No treebanks found, please run <b>task_preparation.ipynb</b>
              </p>
            )}
          </ListGroup>
        </Tab.Container>

        {/* {selected ?  */}
        <Button
          className={styles.button}
          onClick={handleSubmit}
          disabled={submitting || !selected}
          data-test='button-treebankselection-submit'
        >
          {submitting ? (
            <div>
              <Spinner
                as='span'
                animation='grow'
                size='sm'
                role='status'
                aria-hidden='true'
              />
              <span>Submitting...</span>
            </div>
          ) : (
            'Select'
          )}
        </Button>
        {/* : null} */}

        {selectError && <p className={styles.errorText}>{selectError}</p>}
      </div>
    </div>
  );
}

export default Treebank;
