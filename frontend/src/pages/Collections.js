import React, {useState, useEffect} from 'react';
import axios from 'axios';

import MovieTile from '../components/MovieTile';


export default function Collections() {
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
          {mov.map(r => <MovieTile movie={r}/>)}
        </div>
      </div>
    )
  }
}
