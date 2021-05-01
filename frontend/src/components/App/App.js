import React, {useState, useEffect} from 'react';
// import './App.css';
import Login from '../Login/Login';
import useToken from './useToken';

function App() {

  const { token, setToken } = useToken();
  const [ items, setItems ] = useState(null);
  const [ friends, setFriends ] = useState(null);

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
    

  useEffect(() => {
    if (!token) return;
    fetch('/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    })
      .then(errHandler)
      .then(data => data.json())
      .then(data => console.log(data))
      .catch(err => {})

    fetch('/api/friends', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    })
      .then(errHandler)
      .then(data => data.json())
      .then(data => setFriends(data))
      .catch(err => {})

    fetch('/api/movies', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    })
      .then(errHandler)
      .then(data => data.json())
      .then(data => setItems(data))
      .catch(err => {})
  }, [token, setItems, setFriends])


  if(!token) {
    return <Login setToken={setToken} />
  }

  if (items && friends) {
    return (
      <div>
        <ul>
          {friends.map(name => (
            <li key={name}>
              {name}
            </li>
          ))}
        </ul>
        <ul>
          {items.map(item => (
            <li key={item.name}>
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    )
  } else {
    return (
      <div className="wrapper">
        <h1>Loading</h1>
      </div>
    );
  }
}

export default App;
