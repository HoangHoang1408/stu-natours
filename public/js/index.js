import 'regenerator-runtime/runtime';
import { login, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateSettings } from './updateSetting.js';
import { bookTour } from './stripe.js';
import { signUp } from './signUp';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form-login');
const signUpForm = document.querySelector('.form-signup');
const logoutBtn = document.querySelector('.nav-el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordUpdateForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('bookId');

// delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);
  });
}
if (signUpForm) {
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log(e.target);
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    console.log(email, password, passwordConfirm);
    await signUp(name, email, password, passwordConfirm);
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('email', document.getElementById('email').value);
    form.append('name', document.getElementById('name').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form);
  });
}
if (userPasswordUpdateForm) {
  userPasswordUpdateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateSettings({ currentPassword, password, passwordConfirm }, 'password');
  });
}
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}
