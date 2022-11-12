import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styles from '../../styles/DashboardTags.module.css';
import NavBar from '../../components/NavBar';
// import Loading from '../../components/Loading'
import TableTags from '../../components/TableTags';
import { getExpt } from '../../redux';
import TagsSorting from '../../components/TagsSorting';
import { Container, Tab, Tabs } from 'react-bootstrap';

const Tags = () => {
  let { experiment } = useSelector((state) => state.expt);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!experiment) dispatch(getExpt());
  }, [experiment, dispatch]);

  if (!experiment) {
    return (
      <>
        <NavBar />
        {/* <Loading 
        error={error ? error.message : ""}
      /> */}
      </>
    );
  }

  return (
    <>
      <NavBar />

      {/* <Tabs defaultActiveKey='tags' id='parameters-tab'>
        <Tab eventKey='tags' title='Tags Set'>
          <div className={styles.tableContainer}>
            <TableTags />
          </div>
        </Tab>
        <Tab eventKey='sorting' title='Tags Sorting'>
          <TagsSorting />
        </Tab>
      </Tabs> */}

      <Container fluid className='my-2'>
        <Tabs defaultActiveKey='tags' transition={false} id='parameters-tab'>
          <Tab eventKey='tags' title='Tags Set'>
            <div className={styles.tableContainer}>
              <TableTags />
            </div>
          </Tab>
          <Tab eventKey='sorting' title='Tags Sorting'>
            <TagsSorting />
          </Tab>
        </Tabs>
      </Container>
    </>
  );
};

export default Tags;
