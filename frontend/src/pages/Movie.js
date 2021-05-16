import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';

import './Movie.css';
import {MovieUser} from '../components/MovieTile'

const human = (n) => {
  // https://github.com/Kikobeats/human-number
  const ALPHABET = 'KMGTPEZY'.split('')
  const TRESHOLD = 1e3

  n = Math.abs(n)
  var index = 0
  while (n >= TRESHOLD && ++index < ALPHABET.length) { n /= TRESHOLD }
  n = Math.trunc(n*10) / 10
  return index === 0 ? n : n + ALPHABET[index]
}

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
            <p>Popularity: {info.popularity}<br/>
              Box-office: {info.revenue && human(info.revenue)} $$$<br/>
              Runtime: {info.runtime}min</p>
            <MovieUser movie={movie}/>
          </div>
        </div>
        {friends.length > 0 && <h2>Known by</h2>}
        {friends.map(f => <p>{f.name}</p>)}
        <h2>About</h2>
        <h3>Crew</h3>
        {info.crew && info.crew.map(a => (
          <li>{a.job}: <b>{a.name}</b></li>
        ))}
        <h3>Cast</h3>
        {info.cast && info.cast.map(a => (
          <li><b>{a.name}</b> as {a.character}</li>
        ))}
      </div>
    )
  }
}

export default Movie;
