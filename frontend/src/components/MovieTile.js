import React, {useState} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import './MovieTile.css';


const MovieUser = ({mid, init}) => {
  const [state, setState] = useState(init);
  const update = (newState) => () => {
    setState({...state, ...newState})
    axios.put('/api/movies/' + mid, newState)
      .then(console.log)
  }
  return (
    <div className="me">
      <button onClick={update({liked: !state.liked})}>
        {state.liked ? "Unlike" : "Like"}
      </button>
      <button onClick={update({watched: !state.watched})}>
        {state.watched ? "Unwatch" : "Watch"}
      </button>
      <div className="friends">
        {(state.friends || []).map(f => <div>{f}</div>)}
      </div>
    </div>
  )
}

function MovieTile({movie}) {
  if (movie === undefined)
    return <p> something went wrong, pls tell us </p>
  const info = movie.info
  return (
    <div className="MovieTile">
      <Link to={"movies/"+info.id}>
      <img className="poster" src={info.poster} alt="poster"/>
      <div className="desc">
        <p className="title">{info.title}</p>
        <p className="date">{info.year}</p>
      <MovieUser init={movie.perso} mid={info.id}/>
      </div>
      </Link>
    </div>
  )
}

export default MovieTile;
