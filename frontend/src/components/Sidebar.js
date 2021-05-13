import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const data = [
  {
    path: '/home',
    text: 'Home',
  },
  {
    path: '/collections',
    text: 'Friends',
  },
  {
    path: '/collections',
    text: 'Collections',
  },
  {
    path: '/colleions',
    text: 'Liked',
  },
  {
    path: '/colleions',
    text: 'Watchlist',
  },
  {
    path: '/colleions',
    text: 'Watched',
  },
];


function Sidebar() {
  return (
    <div className="Sidebar">
      <ul>
        {data.map((item, index) => (
          <li><NavLink to={item.path} activeClassName="active">
            {item.text}
          </NavLink></li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar;
