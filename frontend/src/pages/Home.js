import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';

function Home({user}) {
  return (
    <>
      <h1>Welcome back, {user.name}</h1>
      <h2>profile</h2>
      <div>
        <img className="pic" src={user.picture} alt="profile"/>
        <div>{user.username}</div>
      </div>
    </>
  )
}

export default Home;
