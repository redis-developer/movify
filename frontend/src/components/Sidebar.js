import React, {useContext} from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

import {UserContext, CollectionsContext} from '../App';


function Sidebar() {
  const user = useContext(UserContext);
  const collections = useContext(CollectionsContext);

  const fixed = [
    {
      path: '/home',
      text: 'Home',
    },
    {
      path: '/friends',
      text: 'Friends',
    },
    {
      path: `/users/${user.id}/collections/`,
      text: 'Collections',
    },
  ]

  const cols = collections.map(c => {
    return {
      path: `/collections/${c.id}`,
      text: c.name,
    }
  });

  return (
    <div className="Sidebar">
      <ul>
        {fixed.concat(cols).map((item, index) => (
          <li><NavLink exact to={item.path} activeClassName="active">
            {item.text}
          </NavLink></li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar;
