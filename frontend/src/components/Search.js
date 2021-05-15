import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

// const api = 'http://localhost:8000/api'
// const api = 'http://movify.h4ck.me:8000/api'


function Search() {
  const [ query, setQuery ] = useState('');
  const [ sugg, setSugg ] = useState([]);
  const history = useHistory();

  /*
  useEffect(() => {
    const url = new URL(api + '/suggest')
    const params = { q: query }
    url.search = new URLSearchParams(params);
    axios.get(url)
      .then(res => {
        setSugg(res.data)
        console.log(res.data)
      })
  }, [query])
  */

  const onChange = e => {
    const val = e.target.value;
    setQuery(val)
    // console.log(val)
  }
  const onSubmit = e => {
    history.push(`/search?q=${query}`)
    e.preventDefault();
  }

  return (
    <div className="Search">
      <form onSubmit={onSubmit}>
        <span className="material-icons" onClick={onSubmit}>search</span>
        <input placeholder="Search for a movie" onChange={onChange} />
      </form>
    </div>
  )
  /*
      <ul>{sugg.map((e,i) =>
      <li key={i}>{e}</li>
      )}</ul>
      */
}

export default Search;
