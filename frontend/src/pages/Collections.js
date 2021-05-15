import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {Link, useLocation, Redirect} from 'react-router-dom';

import {UserContext, CollectionsContext} from '../App';
import './Collections.css'

const CollectionTile = ({col}) => {
  return (
    <Link to={"/collections/"+col.id}>
      <div className="CollectionTile">
        <h1>{col.name}</h1>
      </div>
    </Link>
  )
}


export default function Collections({update}) {
  const collections = useContext(CollectionsContext);
  const user = useContext(UserContext);

  const [redirect, setRedirect] = useState();

  const create = () => {
    axios.post(`/api/collections`)
      .then(res => setRedirect(
        <Redirect to={`/collections/${res.data.id}`}/>
      )).then(update)
  }

  const content = (
    collections === undefined ?
      <p>Loading</p>
    : collections.length === 0 ?
      <button onClick={create}>new collection</button>
    :
    <div>
      <button onClick={create}>new collection</button>
      <div className="result-grid">
        {collections.map(r => <CollectionTile col={r}/>)}
      </div>
    </div>
  )

  return (
    <div class="Collections">
      <h1>Collections</h1>
      {redirect}
      {content}
    </div>
  )
}
