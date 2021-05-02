import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
const axios = require('axios');

function Search() {
  const [ query, setQuery ] = useState('');
  const [ sugg, setSugg ] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const url = new URL('http://127.0.0.1:8000/api/suggest')
    const params = { q: query }
    url.search = new URLSearchParams(params);
    axios.get(url)
      .then(res => setSugg(res.data))
  }, [query])

  const handleSubmit = e => {
    history.push(`/search?q=${query}`)
    e.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={e => setQuery(e.target.value)} />
      <ul>{sugg.map((e,i) =>
        <p key={i}>{e}</p>
      )}</ul>
    </form>
  )
}

export default Search;
