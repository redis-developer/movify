import React, {useState, useContext} from 'react';
import { Link } from 'react-router-dom';

import {insertCollection} from '../actions/Actions'
import { usePopper } from 'react-popper';
// import syled from 'styled-components';
//
import {CollectionsContext} from '../App';

import {AiOutlinePlusCircle} from 'react-icons/ai';

import './MovieTile.css';

const default_img = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/JPEG_example_subimage.svg/300px-JPEG_example_subimage.svg.png"


function Dropdown({mid}) {
  const [visible, setVisible] = useState(false);
  const collections = useContext(CollectionsContext);

  const toggle = (e) => { setVisible(!visible)
    e.preventDefault()
  }

  return (
    <div className="dropdown" onClick={toggle}>
      <AiOutlinePlusCircle/>
      {visible &&
      <ul className="popper">
        {collections.map((v,i) =>
        <li onClick={() => insertCollection(v.id, mid)}>{v.name}</li>
        )}
      </ul>
          }
    </div>
  )
}

const MovieUser = ({movie}) => {

  return (
    <div className="MovieUser">
      <div className="friends">
        {movie.collections.length} collections
      </div>
      <div className="friends">
        {movie.friends.length} friends
      </div>
      <Dropdown mid={movie.info.id}/>
    </div>
  )
}

function MovieTile({movie}) {
  if (movie === undefined)
    return <p> something went wrong, pls tell us </p>
  const info = movie.info
  console.log(info.poster)
  info.poster = info.poster || default_img
  return (
    <Link to={"/movies/"+info.id}>
      <div className="MovieTile">
        <img className="poster" src={info.poster} alt="poster"/>
        <div className="desc">
          <p className="title">{info.title}</p>
          <p className="date">{info.year}</p>
          <MovieUser movie={movie}/>
        </div>
      </div>
    </Link>
  )
}

export {MovieUser};
export default MovieTile;
