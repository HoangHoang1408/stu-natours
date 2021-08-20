import 'regenerator-runtime/runtime';
import 'babel-polyfill';
import { showAlert } from './alert';
import axios from 'axios';
export const login = async function (email, password) {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status == 'success') {
      showAlert('success', 'Login successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
export const logout = async function () {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status == 'success') {
      showAlert('success', 'Logged Out!');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    showAlert('error', 'Log out fail!');
  }
};
