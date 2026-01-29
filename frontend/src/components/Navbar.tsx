import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="card" style={{ borderRadius: 0, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
        TaskManager
      </Link>
      
      <div className="flex items-center gap-4">
        <button onClick={toggleDarkMode} className="btn" style={{ background: 'none', color: 'inherit' }}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>{user.name} ({user.role})</span>
            </div>
            <button onClick={logout} className="btn btn-danger flex items-center gap-2">
              <LogOut size={18} /> Quitter
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Connexion</Link>
            <Link to="/register" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Inscription</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
