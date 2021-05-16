import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {useParams, Link} from 'react-router-dom';

import {UserContext, CollectionsContext} from '../App';
import {friendsActivity} from '../actions/Actions';

function Home() {
  const user = useContext(UserContext);
  const cols = useContext(CollectionsContext);
  const [copied, setCopied] = useState(false);

  const [act, setAct] = useState([])

  useEffect(() => {
    if (user.id) {
      friendsActivity(user.id)
        .then(res => setAct(res.data))
    }
  }, [user.id])


  const doCopy = () => {
    navigator.clipboard.writeText(`https://redishacks.ew.r.appspot.com/users/${user.id}`)
    setCopied(true)
  }

  return (
    <>
      <h1>Welcome back, {user.name}</h1>
      <h2>Profile</h2>
      <div>
        
        <Link to={`/users/${user.id}`}>
          <img className="pic" src={user.picture} alt="profile"/>
        </Link>
        <button onClick={doCopy}>{!copied ? "copy link" : "copied!"}</button>
      </div>
      <div>
        <Link to={`/users/${user.id}/collections`}>
        <h1>Goto collections ({cols?.length})</h1>
        </Link>
      </div>
      <h1>Friends Activity</h1>
      {act.length ?
      <ul>
        {act.map(x => 
        <p>
          <Link to={`/users/${x.user.id}`}>
            <b>{x.user.name}</b>
          </Link> added <Link 
            to={`/movies/${x.movie.id}`}>
            <b>{x.movie.title}</b>
          </Link> to <Link 
            to={`/collections/${x.collection.id}`}>
            <b>{x.collection.name}</b>
          </Link>
        </p>
        )}
      </ul>
      : "nothing found..." }
    </>
  )
}

export default Home;
