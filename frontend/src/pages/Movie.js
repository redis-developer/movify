import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';

import './Movie.css';
import {MovieUser} from '../components/MovieTile'

function Movie() {
  const [movie, setMovie] = useState();
  const {id} =  useParams();

  useEffect(() => {
    axios.get('/api/movies/' + id)
      .then(res => {
        setMovie(res.data)
      })
  }, [id])

  if (movie === undefined) {
    return <div>Loading</div>
  } else if (movie === null) {
    return <div> not found </div>
  } else {
    const info = movie.info;
    const col = movie.collections;
    const friends = movie.friends;

          // <p>{info.original_language}</p>
    return (
      <div className="Movie">
        <div className="head">
          <img className="poster" src={info.poster} alt="poster"/>
          <div>
          <h1>{info.title}</h1>
          <h2>{info.year}</h2>
            <p>Popularity: {info.popularity}</p>
            <p>Box-office: {info.revenue} $$$</p>
            <p>Runtime: {info.runtime}min</p>
          </div>
        </div>
        <MovieUser movie={movie}/>
        <h2>About</h2>
        <h3>Crew</h3>
        {info.crew && info.crew.map(a => (
          <li>{a.job}: <b>{a.name}</b></li>
        ))}
        <h3>Cast</h3>
        {info.cast && info.cast.map(a => (
          <li><b>{a.name}</b> as {a.character}</li>
        ))}
        <p>{friends?.length} friends</p>
        <p>{col?.length} collectiosn</p>
      </div>
    )
  }
}

export default Movie;
