import React, { useState, useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Tab from 'react-bootstrap/Tab';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import styles from '../../styles/Treebank.module.css';
import Loading from '../../components/Loading';
import * as api from '../../services/treebank';

function Treebank(props) {
  const [treebanks, setTreebanks] = useState(null);
  const [tbMap, setTbMap] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [selectError, setSelectError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    (async function () {
      try {
        // Go to tool if treebank selected else fetch treebanks
        let res = await api.treebankCheck();
        if (res.selected) props.history.push('/tool');

        let response = await api.treebanksGet();
        console.log(response);
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

      props.history.push('/tool');
    } catch (err) {
      setSelectError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Loading title='Loading Treebanks' error={serverError} />;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.titleText}>Choose a Treebank to proceed</h2>

      <div className={styles.treebankListContainer}>
        <Tab.Container>
          <ListGroup className={styles.treebankList}>
            {treebanks.map((tb) => {
              let avail = tbMap[tb].count && !tbMap[tb].finished;
              return (
                <ListGroup.Item
                  key={tb}
                  action={avail}
                  variant={avail ? 'primary' : 'danger'}
                  onClick={() => setSelected(tb)}
                >
                  {tb}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Tab.Container>

        {/* {selected ?  */}
        <Button
          className={styles.button}
          onClick={handleSubmit}
          disabled={submitting || !selected}
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
