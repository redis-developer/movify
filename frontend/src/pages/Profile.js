import React, {useState, useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import {getUser, getCollections,
  putFollow, delFollow} from '../actions/Actions'

import {userActivity} from '../actions/Actions';

import './Profile.css'

function Profile() {
  const {id} = useParams();
  const [user, setUser] = useState();
  const [collections, setCollections] = useState([]);

  const [act, setAct] = useState([]);
  useEffect(() => {
    if (id) {
      userActivity(id)
        .then(res => setAct(res.data))
    }
  }, [id])

  useEffect(() => {
    getUser(id).then(res => setUser(res.data))
  }, [id])
  useEffect(() => {
    getCollections(id).then(res => setCollections(res.data))
  }, [id])

  console.log(user)

  const follow = () => {
    if (!user.follows) { putFollow(id) }
    else { delFollow(id) }

    const nxt = {...user, follows: !user.follows}
    setUser(nxt);
  }

  if (user === undefined) {
    return <p>Loading</p>
  }
  return (
    <div className="Profile">
      <div className="head">
        <img alt="" className="pic" src={user.picture}/>
        <div>
          <h1>{user.name}</h1>
          <button onClick={follow}>
            {user.follows
              ? "unfollow"
              : "follow" }
          </button>
        </div>
      </div>

      <div>
        <Link to={`/users/${id}/collections`}>
          <h1>Goto collections ({collections?.length})</h1>
        </Link>
      </div>
      <h1>Recent Activity</h1>
      <ul>
        {act.map(x => 
        <p>
          added <Link 
            to={`/movies/${x.movie.id}`}>
            <b>{x.movie.title}</b>
          </Link> to <Link 
            to={`/collections/${x.collection.id}`}>
            <b>{x.collection.name}</b>
          </Link>
        </p>
        )}
      </ul>
    </div> 
  )
}

export default Profile;
