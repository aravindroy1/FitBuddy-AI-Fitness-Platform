import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/index.js';
import { logout } from '../store/authSlice.js';
import { LogOut, User, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const email = useSelector((state: RootState) => state.auth.email);
  const dispatch = useDispatch();

  return (
    <nav className="h-16 border-b border-white/5 bg-card/40 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent">
          BodyGPT
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {email && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <User className="h-4 w-4 text-slate-400" />
            <span>{email}</span>
          </div>
        )}
        <button
          onClick={() => dispatch(logout())}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-accent-rose hover:bg-white/5 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};
