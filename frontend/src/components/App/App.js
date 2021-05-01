import React from 'react';
// import './App.css';
import Login from '../Login/Login';
import useToken from './useToken';

function App() {

  const { token, setToken } = useToken();

  if(!token) {
    return <Login setToken={setToken} />
  }

  fetch('/api/users/me', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
    },
  })
    .then(data => data.json())
    .then(data => console.log(data))

  return (
    <div className="wrapper">
      <h1>Application</h1>
    </div>
  );
}

export default App;
