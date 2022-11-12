import axios from 'axios';

import * as c from '../constants';

export async function signup(data) {
  try {
    let res = await axios.post(c.SIGNUP, data);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function signin(data) {
  try {
    let res = await axios.post(c.SIGNIN, data);
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
