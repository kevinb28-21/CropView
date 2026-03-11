/**
 * Header — CropView
 * Fixed top, horizontal nav, active route with accent, bottom border only
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, Brain, Drone, Lightbulb } from 'lucide-react';

const navItems = [
  { to: '/', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/map', end: false, label: 'Map', icon: Map },
  { to: '/analytics', end: false, label: 'Analytics', icon: BarChart3 },
  { to: '/ml', end: false, label: 'ML Insights', icon: Brain },
  { to: '/drone', end: false, label: 'Drone', icon: Drone },
  { to: '/insights', end: false, label: 'Insights', icon: Lightbulb },
];

export default function Header() {
  return (
    <header>
      <div>
        <h1>CropView</h1>
        <nav className="tabs" role="navigation" aria-label="Main navigation">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              aria-current={end ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={2} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
