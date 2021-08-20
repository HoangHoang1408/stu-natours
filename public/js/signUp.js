import 'regenerator-runtime/runtime';
import { showAlert } from './alert';
import axios from 'axios';
export const signUp = async function (name, email, password, passwordConfirm) {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status == 'success') {
      showAlert('success', 'Sign up successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
