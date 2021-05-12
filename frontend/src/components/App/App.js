import React, {useState, useEffect} from 'react';
import './App.css';
import Search from '../Search/Search';
import axios from 'axios';
import { BrowserRouter as Router, NavLink, Link, Switch, Route, useLocation, useParams } from 'react-router-dom'


function Collection() {
  const [mov, setMov] = useState()

  useEffect(() => {
    axios.get('/api/movies')
      .then(res => setMov(res.data))
  }, [])

  console.log({mov})

  if (mov === undefined) {
    return <p>Loading</p>
  } else if (mov.length === 0) {
    return <p>NO movz :(</p>
  } else {
    return (
      <div>
        <div className="result-grid">
        {mov.map(displayOne)}
        </div>
      </div>
    )
  }
}

function Nav() {
  return (
    <div className="nav">
      <ul>
        <li><NavLink to="/home" activeClassName="active">
          Home
        </NavLink></li>
        <li><NavLink to="/collection" activeClassName="active">
          My collection
        </NavLink></li>
        <li><NavLink to="/explore" activeClassName="active">
          Explore
        </NavLink></li>
        <li><NavLink to="/feed" activeClassName="active">
          Feed
        </NavLink></li>
      </ul>
    </div>
  )
}

const displayOne = movie => {
  // class ListResult
  const info = movie.info
  return (
    <div className="result-tile">
      <img src={info.poster} alt="poster"/>
      <div className="desc">
        <p className="title">{info.title}</p>
        <p className="date">{info.year}</p>
      </div>
      <Me init={movie.perso} mid={info.id}/>
    </div>
  )
}

function SearchResults() {
  const location = useLocation();
  const [query, setQuery] = useState();
  const [results, setResults] = useState();


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('q'));
  }, [location]);

  useEffect(() => {
    if (query !== undefined) {
      axios.get('/api/search', {
          params: {q: query}
      }).then(res => {
        setResults(res.data)
      })
    }
  }, [query])

  if (query === undefined)
    return <p>Loading</p>
  if (results === undefined)
    return <p>Search: {query}</p>
  else
    return (
      <div className="search-results">
        <h1>search results for <b>{query}</b></h1>
        <div className="result-grid">
        {results.map(displayOne)}
        </div>
      </div>
    )
}

function FriendsActivity({user}) {
  /*
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    axios.get('/api/friends')
      .then(res => setFriends(res.data))
  },[]);
  */

  const friends = [
    {
      name: "Paul",
      uid: "paul",
      lastSeen: "5/4",
      lastMov: "Monty Python",
      pic: "https://media.wired.com/photos/5cdefb92b86e041493d389df/1:1/w_988,h_988,c_limit/Culture-Grumpy-Cat-487386121.jpg",
    },
    {
      name: "Maria",
      uid: "maria",
      lastSeen: "5/2",
      lastMov: "Shrek 4",
      pic: "https://media.wired.com/photos/5cdefb92b86e041493d389df/1:1/w_988,h_988,c_limit/Culture-Grumpy-Cat-487386121.jpg",
    },
  ]
  return (
    <div className="friends">
      <h2>Friends Activity</h2>
      <ul>
        {friends.map(f => 
        <li><Link to={`/users/${f.uid}`}>
          <div>
            <img src={f.pic} alt=""/>
          </div>
          <div className="rhs">
            <div className="tooproo">
              <p><b>{f.name}</b></p>
              <p>{f.lastSeen}</p>
            </div>
            <p>{f.lastMov}</p>
          </div>
        </Link></li>)}
      </ul>
    </div>
  )
}

function ProfilePage() {
  const {id} = useParams();
  const [user, setUser] = useState();

  useEffect(() => {
    axios.get('/api/users/' + id)
    .then(res => setUser(res.data))
  }, [id])

  if (user === undefined) {
    return <p>Loading</p>
  }
  return (
    <div className="profile">
      <img alt="" className="pic" src={user.picture}/>
      <div>
        <h1>User {user.name}</h1>
        <p>{user.username}</p>
      </div>
    </div> 
  )
}

const Me = ({mid, init}) => {
  // class MovieUser
  const [state, setState] = useState(init);
  const update = (newState) => () => {
    setState({...state, ...newState})
    axios.put('/api/movies/' + mid, newState)
      .then(console.log)
  }
  return (
    <div className="me">
      <button onClick={update({liked: !state.liked})}>
        {state.liked ? "Unlike" : "Like"}
      </button>
      <button onClick={update({watched: !state.watched})}>
        {state.watched ? "Unwatch" : "Watch"}
      </button>
      <div className="friends">
        {(state.friends || []).map(f => <div>{f}</div>)}
      </div>
    </div>
  )
}

function MoviePage() {
  const [info, setInfo] = useState();
  const {id} =  useParams();

  useEffect(() => {
    axios.get('/api/movies/' + id)
      .then(res => setInfo(res.data))
  }, [id])

  console.log(info)
  if (info === undefined) {
    return <div>Loading</div>
  } else if (info === null) {
    return <div> not found </div>
  } else {
    const tile  = displayOne(info);
    return (
      <div>
        {tile}
        <Me/>
      </div>
    )
  }
}

function App() {

  const [ user, setUser ] = useState('loading');

  /*
  const errHandler = res => {
    if (!res.ok) {
      res.json()
        .then(err => alert(
          JSON.stringify(err)
        ))
      throw Error
    }
    return res;
  }*/

  useEffect(() => {
    axios.get('/api/me')
      .then(res => setUser(res.data))
      .catch(err => setUser('nope'))
  }, [])
  console.log(user)

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
          <div className="topnav">
              <Search/>
          </div>
          <div className="grid">
            <Nav/>
            <div className="scrollable">
              <div className="main-content">
                <Switch>
                  <Route path="/search">
                    <SearchResults/>
                  </Route>
                  <Route path="/movies/:id">
                    <MoviePage/>
                  </Route>
                  <Route path="/users/:id">
                    <ProfilePage/>
                  </Route>
                  <Route path="/collection">
                    <Collection/>
                  </Route>
                  <Route path="/explore">
                    explor
                  </Route>
                  <Route path="/feed">
                    food
                  </Route>
                  <Route path="/">
                    <h1>Welcome back, {user.name}</h1>
                  </Route>
                </Switch>
              </div>
            </div>
            <FriendsActivity/>
          </div>
        </>
      </Router>
    )
  }
}

export default App;
