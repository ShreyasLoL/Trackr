import { NavLink } from 'react-router-dom';

const linkBase = 'text-sm text-gray-600 hover:text-gray-900';
const activeClass = 'text-sm text-gray-900 font-medium';

export default function Navbar() {
  const navLinkClass = ({ isActive }) => (isActive ? activeClass : linkBase);

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-6">
        <NavLink to="/" className="text-lg font-bold text-gray-900 tracking-tight">
          Trackr
        </NavLink>
        <div className="flex items-center gap-4">
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/gym" className={navLinkClass}>Gym</NavLink>
          <NavLink to="/heatmap" className={navLinkClass}>Activity</NavLink>
          <NavLink to="/nutrition" className={navLinkClass}>Nutrition</NavLink>
        </div>
      </div>
      <NavLink to="/settings" className={navLinkClass}>
        ⚙ Settings
      </NavLink>
    </nav>
  );
}
