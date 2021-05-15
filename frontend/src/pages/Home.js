import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';

import {UserContext} from '../App';

function Home() {
  const user = useContext(UserContext);
  const link = 'https://redishacks.ew.r.appspot.com/users/'
    + user.id;
  return (
    <>
      <h1>Welcome back, {user.name}</h1>
      <button onClick={() => {navigator.clipboard.writeText(link)}}>
        copy link
      </button>
      <h2>profile</h2>
      <div>
        <img className="pic" src={user.picture} alt="profile"/>
        <div>{user.username}</div>
      </div>
    </>
  )
}

export default Home;
