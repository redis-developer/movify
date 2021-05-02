import React, {useState, useEffect} from 'react';
// import './App.css';
import Search from '../Search/Search';
import axios from 'axios';
import { BrowserRouter as Router, Link, Route, useLocation } from 'react-router-dom'

function SearchResults() {
  const params = new URLSearchParams(useLocation().search);
  const query = params.get('q');
  // TODO query and result list
  return <p>{query}</p>
}

function App() {

  const [ user, setUser ] = useState('loading');
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
    axios.get('/api/me')
      .then(res => setUser(res.data))
      .catch(err => setUser(null))
  }, [])

  if (user === 'loading') {
    return <h1>Loading</h1>
  } else if (user === null) {
    // real redirect -> auth server
    window.location.href = '/api/login'
    return null
  } else {
    return (
      <Router>
        <Search/>
        <p>{user.name}</p>
        <Route path="/search">
          <SearchResults/>
        </Route>
      </Router>
    )
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
