import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `relative pb-1 text-sm font-medium tracking-wide transition-colors duration-200 ${
      isActive
        ? 'text-accent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent after:rounded-full'
        : 'text-text-muted hover:text-text'
    }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/80 border-b border-border">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-text">
          Trackr
        </span>
        <div className="flex items-center gap-8">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/charts" className={linkClass}>
            Charts
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
