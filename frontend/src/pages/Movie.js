import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';

import MovieTile from '../components/MovieTile'

function Movie() {
  const [info, setInfo] = useState();
  const {id} =  useParams();

  useEffect(() => {
    axios.get('/api/movies/' + id)
      .then(res => setInfo(res.data))
  }, [id])

  console.log(info)
  if (info === undefined) {
    return <div>Loading</div>
  } else if (info === null) {
    return <div> not found </div>
  } else {
    return (
      <MovieTile/>
    )
  }
}

export default Movie;
