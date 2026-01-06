/**
 * Header Component
 * Modern navigation header with distinctive styling
 */
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header>
      <div>
        <h1>Precision Agriculture</h1>
        <nav className="tabs" role="navigation" aria-label="Main navigation">
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => isActive ? 'tab active' : 'tab'}
            aria-current="page"
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/map" 
            className={({ isActive }) => isActive ? 'tab active' : 'tab'}
          >
            Map
          </NavLink>
          <NavLink 
            to="/analytics" 
            className={({ isActive }) => isActive ? 'tab active' : 'tab'}
          >
            Analytics
          </NavLink>
          <NavLink 
            to="/ml" 
            className={({ isActive }) => isActive ? 'tab active' : 'tab'}
          >
            ML Insights
          </NavLink>
          <NavLink 
            to="/drone" 
            className={({ isActive }) => isActive ? 'tab active' : 'tab'}
          >
            Drone
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

