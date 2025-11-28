import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLink: React.FC<{ to: string; label: string; active: boolean }> = ({ to, label, active }) => (
  <Link
    to={to}
    className={`px-4 py-2 font-bold uppercase tracking-wider transform transition-transform ${
      active
        ? 'bg-yellow-500 text-black -rotate-1 ork-border'
        : 'bg-zinc-800 text-gray-300 hover:text-white hover:bg-zinc-700'
    }`}
  >
    {label}
  </Link>
);

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-zinc-900 border-b-4 border-black p-4 mb-6 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-wrap gap-4 items-center justify-between">
        <div className="text-2xl font-black text-red-600 uppercase tracking-widest drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)]">
          Gorkamorka Tracker
        </div>
        <div className="flex flex-wrap gap-2">
          <NavLink to="/" label="My Mob" active={location.pathname === '/'} />
          <NavLink to="/shop" label="Da Shop" active={location.pathname === '/shop'} />
          <NavLink to="/post-game" label="Post Game" active={location.pathname === '/post-game'} />
          <NavLink to="/settings" label="Settings" active={location.pathname === '/settings'} />
        </div>
      </div>
    </nav>
  );
};