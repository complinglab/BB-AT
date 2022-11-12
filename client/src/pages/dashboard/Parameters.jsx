import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getExpt } from '../../redux';
import Loading from '../../components/Loading';
import NavBar from '../../components/NavBar';
import ParameterForm from '../../components/ParameterForm';

const Parameters = () => {
  const dispatch = useDispatch();
  let { experiment, error } = useSelector((state) => state.expt);

  useEffect(() => {
    if (!experiment) dispatch(getExpt());
  }, [experiment, dispatch]);

  if (!experiment) {
    return (
      <>
        <NavBar />
        <Loading error={error ? error.message : ''} />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <ParameterForm />
    </>
  );
};

export default Parameters;
