import axios from 'axios';

import * as c from '../constants';

export async function getExpt() {
  try {
    let res = await axios.get(c.GETEXPERIMENT);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function getTasks(data) {
  try {
    let res = await axios.get(c.GETTASKS, { params: { ...data } });
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function createUser(data) {
  try {
    let res = await axios.post(c.CREATEUSER, data);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function deleteUser(data) {
  try {
    let res = await axios.delete(c.DELETEUSER, { data: { ...data } });
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

// export async function dataFetch() {
//   try {
//     let res = await axios.get(c.DATAFETCH)
//     return res.data;

//   } catch (e) {
//     throw handler(e)
//   }
// }

export async function updateParas(data) {
  try {
    let res = await axios.post(c.UPDATEPARAS, data);
    return res.data;
  } catch (e) {
    throw handler(e);
  }
}

export async function updateTag(data) {
  try {
    let res = await axios.post(c.UPDATETAGS, data);
    return res.data;
  } catch (e) {
    throw handler(e);
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
