import React from 'react';
import { NavLink } from 'react-router-dom';
// import './Sidebar.css';

const data = [
  {
    path: '/home',
    text: 'Home',
  },
  {
    path: '/collections',
    text: 'Collections',
  },
];


function Sidebar() {
  return (
    <div className="sidebar">
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
