import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import Friends from './pages/Friends';
import Movie from './pages/Movie';
import Profile from './pages/Profile';
import Collections from './pages/Collections';
import SomeCollection from './pages/SomeCollection';
import SearchResults from './pages/SearchResults';

import login from './login.html';
import logo from './movify-sm.png';

const UserContext = React.createContext();
// {id, name}

const CollectionsContext = React.createContext();
// [{id, name}]

function App() {

  const [ user, setUser ] = useState('loading');
  const [ collections, setCollections ] = useState([]);
  // console.log(user)

  useEffect(() => {
    axios.get('/api/me')
      .then(res => setUser(res.data))
      .catch(err => setUser('nope'))
  }, [])

  const updateCollections = () => {
    if (user)
      axios.get(`/api/users/${user.id}/collections`)
        .then(res => setCollections(res.data))
  }

  useEffect(updateCollections, [user])

  if (user === 'loading') {
    return <h1>Loading</h1>
  } else if (user === 'nope') {
    const html = login.replace('$MOVIFY_LOGO', logo)
    return <div dangerouslySetInnerHTML={{__html:html}}></div>
  } else { // yay authenticated
    return (
      <>
        <UserContext.Provider value={user}>
        <CollectionsContext.Provider value={collections}>
          <Router>
            <Navbar/>
            <Sidebar uid={user.id}/>
            <div className="Page">
              <Switch>
                <Route path="/search">
                  <SearchResults/>
                </Route>
                <Route path="/movies/:id">
                  <Movie/>
                </Route>
                <Route path="/friends">
                  <Friends/>
                </Route>
                <Route path="/users/:uid/collections">
                  <Collections update={updateCollections}/>
                </Route>
                <Route path="/users/:id">
                  <Profile/>
                </Route>
                <Route path="/collections/:cid">
                  <SomeCollection update={updateCollections}/>
                </Route>
                <Route path="/">
                  <Home user={user}/>
                </Route>
              </Switch>
            </div>
          </Router>
        </CollectionsContext.Provider>
        </UserContext.Provider>
      </>
    )
  }
}

export {UserContext, CollectionsContext}
export default App;
