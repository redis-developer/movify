import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {Link, useLocation, useParams, Redirect} from 'react-router-dom';

import {getCollections, newCollection} from '../actions/Actions';
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
  const {uid} = useParams();
  const [cols, setCols] = useState()
  const user = useContext(UserContext);

  const [redirect, setRedirect] = useState();

  const create = () => {
    newCollection()
      .then(res => setRedirect(
        <Redirect to={`/collections/${res.data.id}`}/>
      )).then(update)
  }

  useEffect(() => {
    getCollections(uid).then(res => setCols(res.data))
  }, [uid])

  const content = (
    cols === undefined ?
      <p>Loading</p>
    :
    <div>
      <div className="result-grid">
        {user.id === uid &&
        <div className="NewCollectionTile" onClick={create}>
          <h1>+ new collection</h1>
        </div>
        }
        {cols.map(r => <CollectionTile col={r}/>)}
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
