import * as api from './services/dashboard';

import {
  createSlice,
  configureStore,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import {
  createIdUserMap,
  createIdTaskMap,
  createUserTaskMap,
  createTbToUserTaskMap,
} from './utils/data';

// AUTH SLICE

let initialAuthState = {
  loggedIn: false,
  user: JSON.parse(localStorage.getItem('user')) || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    login: (state, { payload }) => {
      state.loggedIn = true;
      state.user = payload.user;
    },
    logout: (state) => {
      state.loggedIn = false;
      state.user = null;
    },
  },
});

export const { login: loginActionCreator, logout: logoutActionCreator } =
  authSlice.actions;

const authReducer = authSlice.reducer;

// EXPT SLICE

let initialExptState = {
  experimentList: null,
  experiment: null,
  loading: 'idle',
  error: null,
  tagsModified: null,
  parasModified: null,
};

// Thunk
export const getExpt = createAsyncThunk(
  'expt/getExpt',
  async (experimentId, thunkAPI) => {
    const response = await api.getExpt();
    return response;
  }
);

const exptSlice = createSlice({
  name: 'expt',
  initialState: initialExptState,
  reducers: {
    updateTags: (state, { payload }) => {
      state.tagsModified = payload.tagsModified;
    },
    updateParas: (state, { payload }) => {
      state.parasModified = payload.parasModified;
    },
    logout: (state) => {
      return initialExptState;
    },
  },
  extraReducers: {
    [getExpt.pending]: (state, action) => {
      state.loading = 'pending';
      state.error = null;
    },
    [getExpt.fulfilled]: (state, action) => {
      state.loading = 'idle';
      state.error = null;
      state.experiment = action.payload.experiment;
    },
    [getExpt.rejected]: (state, action) => {
      state.loading = 'idle';
      state.error = action.error;
    },
  },
});

export const {
  updateTags: updateTagsAction,
  updateParas: updateParasAction,
  logout: logoutExptAction,
} = exptSlice.actions;

const exptReducer = exptSlice.reducer;

// DATA SLICE

let initialDataState = {
  tasks: null,
  idUserMap: null,
  idTaskMap: null,
  userTaskMap: null,
  tbMap: null,
};

// Fetch data and create maps
export const getData = createAsyncThunk(
  'data/getData',
  async (experimentId, thunkAPI) => {
    const response = await api.getTasks({ experimentId });
    let { users, tasks } = response;
    response.idUserMap = createIdUserMap(users);
    response.idTaskMap = createIdTaskMap(tasks);
    response.userTaskMap = createUserTaskMap(users, tasks);
    response.tbMap = createTbToUserTaskMap(users, tasks);
    return response;
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState: initialDataState,
  reducers: {
    // updateTags: (state, {payload}) => {
    //   state.tagsModified = payload.tagsModified
    // }
    logout: (state) => initialDataState,
  },
  extraReducers: {
    [getData.pending]: (state, action) => {
      state.loading = 'pending';
    },
    [getData.fulfilled]: (state, action) => {
      state.loading = 'idle';
      state.idUserMap = action.payload.idUserMap;
      state.idTaskMap = action.payload.idTaskMap;
      state.userTaskMap = action.payload.userTaskMap;
      state.tbMap = action.payload.tbMap;
      state.tasks = action.payload.tasks;
    },
    [getData.rejected]: (state, action) => {
      state.loading = 'idle';
      state.error = action.error;
    },
  },
});
export const { logout: logoutDataAction } = dataSlice.actions;

const dataReducer = dataSlice.reducer;

export default configureStore({
  reducer: {
    auth: authReducer,
    expt: exptReducer,
    data: dataReducer,
  },
});
