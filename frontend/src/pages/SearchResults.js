import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import axios from 'axios';

import MovieTile from '../components/MovieTile';


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

  console.log(results)

  if (query === undefined)
    return <p>Loading</p>
  if (results === undefined)
    return <p>Search: {query}</p>
  else
    return (
      <div className="SearchResults">
        <h1>search results for <b>{query}</b></h1>
        <div className="result-grid">
          {results.map((res,i) => <MovieTile key={i} movie={res}/>)}
        </div>
      </div>
    )
}

export default SearchResults;
