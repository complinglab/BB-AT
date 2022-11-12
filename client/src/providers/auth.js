import axios from 'axios';

import { loginActionCreator, logoutActionCreator } from '../redux';

// CONFIG KEYS [Storage Keys]===================================
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';
export const keys = [TOKEN_KEY, USER_KEY];

// Handle Login
export const handleLogin = (data) => {
  try {
    //STORE DATA
    let { token, user } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('user', JSON.stringify(user));

    //AXIOS AUTHORIZATION HEADER
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    //DISPATCH TO REDUCER
    return loginActionCreator({ user: data.user });
  } catch (error) {
    throw new Error(error);
  }
};

// Handle Logout
export const handleLogout = async () => {
  try {
    //REMOVE DATA
    localStorage.clear();

    //AXIOS AUTHORIZATION HEADER
    delete axios.defaults.headers.common['Authorization'];

    //Return action
    return logoutActionCreator();
  } catch (error) {
    throw new Error(error);
  }
};

//UPDATE USER LOCAL STORAGE DATA AND DISPATCH TO REDUCER
export const updateUser = async (user) => {
  try {
    //Return action
    return loginActionCreator({ user });
  } catch (error) {
    throw new Error(error);
  }
};
