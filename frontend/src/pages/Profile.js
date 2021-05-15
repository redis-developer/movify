import React, {useState, useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import {getUser, getCollections} from '../actions/Actions'

function Profile() {
  const {id} = useParams();
  const [user, setUser] = useState();
  const [collections, setCollections] = useState();

  useEffect(() => {
    getUser(id).then(res => setUser(res.data))
  }, [id])
  useEffect(() => {
    getCollections(id).then(res => setCollections(res.data))
  }, [id])

  if (user === undefined) {
    return <p>Loading</p>
  }
  return (
    <div className="profile">
      <img alt="" className="pic" src={user.picture}/>
      <div>
        <h1>User {user.name}</h1>
      </div>

      <div>
        <Link to={`/users/{id}/collections`}>
        <h1>Collections</h1>
        </Link>
        {collections && collections.map(c =>
        <li>{c.name}</li>)}
      </div>
    </div> 
  )
}

export default Profile;
