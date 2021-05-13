import React, { useState, useEffect } from 'react';
import Search from './Search';

import './Navbar.css';
import logo from '../movify-sm.png';

function Navbar() {
  return (
  <div className="Navbar">
    <div className="brand">
    <img src={logo} alt="logo"/>
    <div>Movify</div>
    </div>
    <Search/>
  </div>
  )
}

export default Navbar;
