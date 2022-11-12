import axios from 'axios';

import * as c from '../constants';

export async function tagSetFetch() {
  try {
    let res = await axios.get(c.TAGSETFETCH);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function taskFetch() {
  try {
    let res = await axios.get(c.TASKFETCH);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function taskSave(data) {
  try {
    let res = await axios.post(c.TASKSAVE, data);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function labelAmbiguity(data) {
  try {
    const res = await axios.get(c.GET_LABEL_AMBIGUITY, { params: { ...data } });
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function getExperimentData() {
  try {
    const res = await axios.get(c.GETEXPERIMENTDATA);

    return res.data;
  } catch (error) {
    throw handler(error);
  }
}

export async function getItemDifficulty() {
  try {
    const res = await axios.get(c.GETITEMDIFFICULTY);
    return res.data;
  } catch (error) {
    throw handler(error);
  }
}

export function handler(err) {
  let error = err;
  console.log('error', error.response);
  if (err.response && err.response.data.hasOwnProperty('message'))
    error = err.response.data;
  else if (!err.hasOwnProperty('message')) error = err.toJSON();

  return new Error(error.message);
}
