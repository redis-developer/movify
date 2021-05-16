import React, {useState, useEffect, useContext} from 'react';
import {Link} from 'react-router-dom';
import {putFollow, delFollow, getFollows, getFollowers} from '../actions/Actions'
import {UserContext} from '../App'

const Friend = ({data}) => {
  const {picture, name, id} = data;

  return (
      <Link to={`/users/${id}`}>
    <li className="Friend">
        <img src={picture} alt="profile"/>
        <h1>{name}</h1>
    </li>
      </Link>
  )
}

export default function Friends() {
  const user = useContext(UserContext);
  const [friends, setFriends] = useState()

  useEffect(() => {
    getFollows(user.id)
      .then(res => setFriends(res.data))
  }, [user.id])

  const content = (friends === undefined
    ?  <p>Loading</p>
    : (friends.length === 0)
    ? <p>No friends</p>
    : <ul>{friends.map(r => <Friend data={r}/>)}</ul>
  )
  return (
    <>
      <h1>Friends</h1>
      {content}
    </>
  )
}
