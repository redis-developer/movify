import React, {useState, useContext} from 'react';
import { Link } from 'react-router-dom';

import {insertCollection, popCollection} from '../actions/Actions'
import { usePopper } from 'react-popper';
// import syled from 'styled-components';
//
import {CollectionsContext} from '../App';

import {AiFillHeart, AiFillEye, AiFillPlusCircle} from 'react-icons/ai';

import './MovieTile.css';

const default_img = "https://i.stack.imgur.com/y9DpT.jpg"

function ToggleCol({movie}) {
  const [visible, setVisible] = useState(false);
  const cols = useContext(CollectionsContext);

  const ToggleVal = ({cid, children}) => {
    const [state, setState] = useState(
      movie.collections.includes(cid))

    const onClick = (e) => {
      if (state) {
        popCollection(cid, movie.info.id)
        movie.collections.splice(
          movie.collections.findIndex(c => c.id === cid)
        )
      } else {
        insertCollection(cid, movie.info.id)
        movie.collections.push(cid)
      }
      setState(!state);
      setVisible(false)
      e.stopPropagation();
      e.preventDefault();
    }

    return (
      <div className={state ? "active" : ""} onClick={onClick}>
        {children}
      </div>
    )
  }

  const toggleVis = (e) => {
    setVisible(!visible)
    e.preventDefault()
  }

  if (!cols) return <></>

  return (
    <div class="ToggleCol">
      {cols[0] &&
      <ToggleVal cid={cols[0].id}>
        <AiFillHeart/>
      </ToggleVal>
      }
      {cols[1] &&
      <ToggleVal cid={cols[1].id}>
        <AiFillEye/>
      </ToggleVal>
      }
      {cols.length > 2 && 
        <div className="dropdown" onClick={toggleVis}> 
          <AiFillPlusCircle/>
          {visible &&
          <ul className="popper">
            {cols.slice(2).map((c,i) =>
            <ToggleVal cid={c.id}>
              <li>{c.name}</li>
            </ToggleVal>
            )}
          </ul>
          }

        </div>
      }
    </div>
  )
}

const MovieUser = ({movie}) => {
  const showFriends = (fr) => {
          // {fr[0].name}{fr.lenght > 1 ? "..." : ""}
    return (
      fr.length > 0 &&
        <p><b>{fr.length}F{fr.length > 1 && "s"}</b></p>
    )
  }

  return (
    <div className="MovieUser">
      <ToggleCol movie={movie}/>
      {showFriends(movie.friends)}
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
