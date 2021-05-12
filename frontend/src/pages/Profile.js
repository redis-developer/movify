import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Profile() {
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

export default Profile;
