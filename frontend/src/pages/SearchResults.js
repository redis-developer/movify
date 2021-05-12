import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import axios from 'axios';


// TODO replace with tile from POL
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
      // <Me init={movie.perso} mid={info.id}/>
}



function SearchResults() {
  const location = useLocation();
  const [query, setQuery] = useState();
  const [results, setResults] = useState();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('q'));
  }, [location]);

  useEffect(() => {
    if (query !== undefined) {
      axios.get('/api/search', {
          params: {q: query}
      }).then(res => {
        setResults(res.data)
      })
    }
  }, [query])

  if (query === undefined)
    return <p>Loading</p>
  if (results === undefined)
    return <p>Search: {query}</p>
  else
    return (
      <div className="search-results">
        <h1>search results for <b>{query}</b></h1>
        <div className="result-grid">
        {results.map(displayOne)}
        </div>
      </div>
    )
}

export default SearchResults;
