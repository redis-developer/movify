import React, {useState} from 'react';
import axios from 'axios';


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
  const info = movie.info
  return (
    <div className="result-tile">
      <img src={info.poster} alt="poster"/>
      <div className="desc">
        <p className="title">{info.title}</p>
        <p className="date">{info.year}</p>
      </div>
      <MovieUser init={movie.perso} mid={info.id}/>
    </div>
  )
}

export default MovieTile;
