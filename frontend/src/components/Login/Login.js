import React, { useState } from 'react';
import PropTypes from 'prop-types';
// import './Login.css';

const errHandler = res => {
  if (!res.ok) {
    res.json()
      .then(err => alert(
        JSON.stringify(err)
      ))
    throw Error
  }
  return res;
}

async function signupUser(formData) {

  return fetch('/api/signup', {
    method: 'POST',
    body: formData
  })
    .then(errHandler)
    .then(() => loginUser(formData))
    .catch(err => {})
}

async function loginUser(formData) {
 return fetch('/api/token', {
   method: 'POST',
   body: formData
 })
    .then(errHandler)
    .then(data => data.json())
    .catch(err => {})
}

export default function Login({ setToken }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    if (!username || !password) {
      alert('need both fields')
      return;
    }

    const token = await loginUser(formData);
    if (token?.access_token) setToken(token);
  }
  const handleSubmit2 = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const token = await signupUser(formData);
    if (token) setToken(token);
  }

  return(
    <div className="login-wrapper">
      <button onClick={handleSubmit}>signin</button>
      <button onClick={handleSubmit2}>signup</button>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input type="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
};
