import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FormLabel from 'react-bootstrap/FormLabel';
import FormGroup from 'react-bootstrap/FormGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Slider from 'rc-slider';
import 'rc-tooltip/assets/bootstrap.css';
import 'rc-slider/assets/index.css';
import { SketchPicker } from 'react-color';

import { getExpt } from '../redux';
import styles from '../styles/ParameterForm.module.css';
import * as api from '../services/dashboard';
import { FormCheck } from 'react-bootstrap';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

const ParameterForm = () => {
  let { experiment } = useSelector((state) => state.expt);
  let { parameters } = experiment;

  const dispatch = useDispatch();

  const [updating, setUpdating] = useState(false);
  const [bounds, setBounds] = useState(
    parameters.highlightBoundaries ? parameters.highlightBoundaries : [0.2, 0.8]
  );
  const [highlights, setHighlights] = useState(
    parameters.highlights[0] ? parameters.highlights : ['#ffa62b', '#9088d4']
  );
  const [selected, setSelected] = useState(0);

  const onSliderChange = (value) => {
    setBounds(value);
  };

  const onColorChange = (color) => {
    const newHighlights = [...highlights];
    newHighlights[selected] = color.hex;
    setHighlights(newHighlights);
  };

  const onSelect = (event) => {
    console.log(event.target.value);
    setSelected(event.target.value);
  };

  const ParaSchema = Yup.object().shape({
    numShared: Yup.number()
      .typeError('Must be a number')
      .required('Required')
      .min(2),
    numSharedAdju: Yup.number()
      .typeError('Must be a number')
      .required('Required')
      .min(1),
    matchMismatch: Yup.boolean(),
    annConfidence: Yup.boolean(),
    sentenceDiff: Yup.boolean(),
  });

  const initialVal = {
    numShared: parameters.numShared,
    numSharedAdju: parameters.numSharedAdju,
    matchMismatch: parameters.matchMismatch || true,
    annConfidence: parameters.annConfidence || false,
    sentenceDiff: parameters.sentenceDiff || false,
    highlightType: parameters.highlightType
      ? parameters.highlightType
      : 'continuous',
  };

  useEffect(() => {
    console.log(experiment, parameters);
  }, [experiment, parameters]);

  return (
    <div className={styles.container}>
      <Formik
        initialValues={initialVal}
        validationSchema={ParaSchema}
        onSubmit={async (values) => {
          setUpdating(true);
          try {
            await api.updateParas({
              values: {
                ...values,
                highlightBoundaries: bounds,
                highlights,
              },
              experimentId: experiment._id,
            });
            dispatch(getExpt());
          } catch (err) {
            console.log(err.message);
          }
          setUpdating(false);
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => (
          <Form>
            <FormGroup>
              <FormLabel>Number of annotators per task</FormLabel>
              <FormControl
                name='numShared'
                onChange={handleChange}
                value={values.numShared}
                isInvalid={errors.numShared && touched.numShared}
              />
              <FormControl.Feedback type='invalid'>
                {errors.numShared}
              </FormControl.Feedback>
            </FormGroup>

            <FormGroup>
              <FormLabel>Number of adjudicators per task</FormLabel>
              <FormControl
                name='numSharedAdju'
                onChange={handleChange}
                value={values.numSharedAdju}
                isInvalid={errors.numSharedAdju && touched.numSharedAdju}
              />
              <FormControl.Feedback type='invalid'>
                {errors.numSharedAdju}
              </FormControl.Feedback>
            </FormGroup>

            {/* <FormGroup>
              <FormLabel>Scaling of rt to use for heatmap</FormLabel>
              <FormControl
                as='select'
                id='scaling'
                name='scaling'
                onChange={handleChange}
                value={values.scaling}
              >
                <option value='model'>Model</option>
                <option value='model'>Model</option>
              </FormControl>
            </FormGroup> */}

            <p>Adjudication mode</p>

            <FormGroup>
              <FormCheck
                type='checkbox'
                name='matchMismatch'
                id='matchMismatch'
                label='Match/Mismatch'
                checked={values.matchMismatch}
                onChange={handleChange}
                title='Show match/mismatch annotation'
              />
            </FormGroup>

            <FormGroup>
              <FormCheck
                type='checkbox'
                name='annConfidence'
                id='annConfidence'
                label='Annotator confidence'
                checked={values.annConfidence}
                onChange={handleChange}
                title='Show label ambiguity'
              />
            </FormGroup>

            <FormGroup>
              <FormCheck
                type='checkbox'
                name='sentenceDiff'
                id='sentenceDiff'
                label='Sentence difficulty'
                checked={values.sentenceDiff}
                onChange={handleChange}
                title='Show senetence difficulty'
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Color highlight mode</FormLabel>
              <FormControl
                as='select'
                id='highlightType'
                name='highlightType'
                onChange={handleChange}
                value={values.highlightType}
              >
                <option value='continuous'>Continuous</option>
                <option value='discrete'>Discrete</option>
              </FormControl>
            </FormGroup>
            {values.highlightType === 'discrete' && (
              <>
                <div style={{ width: 400, marginTop: 20 }}>
                  <p>Set boundaries of RT highlights</p>
                  <Range
                    count={2}
                    defaultValue={bounds}
                    // value={bounds}
                    pushable={0.01}
                    trackStyle={[{ backgroundColor: '#999393' }]}
                    handleStyle={[
                      {
                        backgroundColor: parameters.highlights[0] || '#ffa62b',
                        border: parameters.highlights[0] || '#ffa62b',
                      },
                      {
                        backgroundColor: parameters.highlights[1] || '#9088d4',
                        border: parameters.highlights[1] || '#9088d4',
                      },
                    ]}
                    railStyle={{ backgroundColor: 'black' }}
                    onChange={onSliderChange}
                    max={1}
                    min={0}
                    step={0.01}
                  />
                  <p style={{ marginTop: 10 }}>
                    Lower Bound: {bounds[0]} Upper Bound: {bounds[1]}
                  </p>
                </div>

                <div>
                  <FormGroup>
                    <FormLabel>Choose highlight color</FormLabel>
                    <FormControl
                      as='select'
                      id='highlightType'
                      name='highlightType'
                      onChange={onSelect}
                      value={selected}
                    >
                      <option value={0}>Lower RT range</option>
                      <option value={1}>Upper RT range</option>
                    </FormControl>
                  </FormGroup>

                  <div className={styles.colorPickerContainer}>
                    <SketchPicker
                      color={highlights[selected]}
                      onChangeComplete={onColorChange}
                    />
                    <div className={styles.sampleHighlights}>
                      <p style={{ backgroundColor: highlights[0] }}>
                        Lower Highlight
                      </p>
                      <p style={{ backgroundColor: highlights[1] }}>
                        Upper Highlight
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              variant='primary'
              type='submit'
              disabled={updating}
              style={{ marginTop: 20 }}
            >
              {updating ? (
                <div>
                  <span>Updating...</span>
                  <Spinner
                    as='span'
                    animation='grow'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                  />
                </div>
              ) : (
                'Update Parameters'
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ParameterForm;
