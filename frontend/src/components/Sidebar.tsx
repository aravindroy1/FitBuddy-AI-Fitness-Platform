import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  Bot,
  Video,
  FileText,
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Diet Planner', path: '/diet', icon: Utensils },
    { name: 'Workout Planner', path: '/workout', icon: Dumbbell },
    { name: 'AI Fitness Coach', path: '/coach', icon: Bot },
    { name: 'Exercise Detection', path: '/exercise', icon: Video },
    { name: 'Medical Reports', path: '/reports', icon: FileText },
    { name: 'Profile Settings', path: '/profile', icon: Settings }
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-card/25 min-h-[calc(100vh-4rem)] flex flex-col p-4 gap-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary/20 text-primary border-l-4 border-primary'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </aside>
  );
};
