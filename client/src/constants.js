//API URL
export const API_URL = process.env.REACT_APP_API_URL;

//API End Points
// AUTH
export const SIGNUP = `${API_URL}/auth/signup`;
export const SIGNIN = `${API_URL}/auth/signin`;

// DASHBOARD
export const CREATEUSER = `${API_URL}/expt/createuser`;
export const DELETEUSER = `${API_URL}/expt/deleteuser`;
export const GETEXPERIMENT = `${API_URL}/expt/experiment`;
export const UPDATETAGS = `${API_URL}/expt/updatetags`;
export const UPDATEPARAS = `${API_URL}/expt/updateparas`;
export const GETTASKS = `${API_URL}/expt/tasks`;

// Treebank
export const TREEBANKCHECK = `${API_URL}/anno/treebanks/check`;
export const TREEBANKSGET = `${API_URL}/anno/treebanks/get`;
export const TREEBANKSET = `${API_URL}/anno/treebanks/set`;
export const TREEBANKRESET = `${API_URL}/anno/treebanks/reset`;

// Tool
export const TASKFETCH = `${API_URL}/anno/tool/task`;
export const TASKSAVE = `${API_URL}/anno/tool/save`;
export const TAGSETFETCH = `${API_URL}/anno/tool/tags`;
export const GET_LABEL_AMBIGUITY = `${API_URL}/anno/tool/labelambiguity`;
export const GETEXPERIMENTDATA = `${API_URL}/anno/tool/experiment`;
export const GETITEMDIFFICULTY = `${API_URL}/anno/tool/itemdifficulty`;
