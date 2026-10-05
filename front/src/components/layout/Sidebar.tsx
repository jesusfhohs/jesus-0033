import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMoneyBill, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const menuItems = [
  { path: '/dashboard', icon: faHome, label: 'Dashboard' },
  { path: '/saldo', icon: faMoneyBill, label: 'Saldo y movimientos' },
] as const;

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="sidebar w-64 min-h-screen border-r border-gray-200 flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Snail Pay</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const iconProp: IconProp = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:text-blue-600',
                    isActive ? 'bg-blue-50 text-blue-600' : ''
                  )
                )
              }
            >
              <FontAwesomeIcon icon={iconProp} fixedWidth />
              <span className="font-medium hidden md:block">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span className="font-medium">Salir</span>
        </button>
      </div>
    </aside>
  );
}