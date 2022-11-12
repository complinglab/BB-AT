import axios from 'axios';

import * as c from '../constants';

export async function treebankCheck() {
  try {
    let res = await axios.get(c.TREEBANKCHECK);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function treebanksGet() {
  try {
    let res = await axios.get(c.TREEBANKSGET);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function treebankSet(data) {
  try {
    let res = await axios.post(c.TREEBANKSET, data);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function treebankReset(data) {
  try {
    let res = await axios.post(c.TREEBANKRESET, data);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export function handler(err) {
  let error = err;

  if (err.response && err.response.data.hasOwnProperty('message'))
    error = err.response.data;
  else if (!err.hasOwnProperty('message')) error = err.toJSON();

  return new Error(error.message);
}
