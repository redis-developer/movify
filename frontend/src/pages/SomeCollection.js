import React, {useState, useEffect} from 'react';
import axios from 'axios';


const displayOne = movie => {
  // class ListResult
  const info = movie.info
  return (
    <div className="result-tile">
      <img src={info.poster} alt="poster"/>
      <div className="desc">
        <p className="title">{info.title}</p>
        <p className="date">{info.year}</p>
      </div>
    </div>
  )
}

// TODO load from a collection
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
        {mov.map(displayOne)}
        </div>
      </div>
    )
  }
}
