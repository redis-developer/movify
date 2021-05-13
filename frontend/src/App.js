import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import Movie from './pages/Movie';
import Profile from './pages/Profile';
import Collections from './pages/Collections';
import SomeCollection from './pages/SomeCollection';
import SearchResults from './pages/SearchResults';


function App() {

  const [ user, setUser ] = useState('loading');
  // console.log(user)

  useEffect(() => {
    axios.get('/api/me')
      .then(res => setUser(res.data))
      .catch(err => setUser('nope'))
  }, [])

  if (user === 'loading') {
    return <h1>Loading</h1>
  } else if (user === 'nope') {
    // real redirect -> auth server
    return (
      <Router>
        <a href="/api/login">
          Login plz
        </a>
      </Router>
    )
  } else { // yay authenticated
    return (
      <Router>
        <>
          <Navbar/>
          <Sidebar/>
          <div className="Page">
            <Switch>
              <Route path="/search">
                <SearchResults/>
              </Route>
              <Route path="/movies/:id">
                <Movie/>
              </Route>
              <Route path="/users/:id">
                <Profile/>
              </Route>
              <Route path="/collections">
                <Collections/>
              </Route>
              <Route path="/collections/:id">
                <SomeCollection/>
              </Route>
              <Route path="/">
                <Home user={user}/>
              </Route>
            </Switch>
          </div>
        </>
      </Router>
    )
  }
}

export default App;
