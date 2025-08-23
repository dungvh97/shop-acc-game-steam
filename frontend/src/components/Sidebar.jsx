import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      label: 'Tất Cả Tài Khoản Steam',
      path: '/steam-accounts',
      description: 'All Steam Accounts'
    },
    {
      label: 'Tài Khoản Steam 1 Game',
      path: '/steam-accounts/single-game',
      description: 'Steam Account 1 Game'
    },
    {
      label: 'Tài Khoản Steam Nhiều Game',
      path: '/steam-accounts/multi-game',
      description: 'Steam Account Many Games'
    },
    {
      label: 'Sản Phẩm Ưu Đãi',
      path: '/discounted',
      description: 'Discounted Products'
    },
    {
      label: 'Sản Phẩm Khác',
      path: '/other-products',
      description: 'Other Products'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                  location.pathname === item.path ? 'text-red-600 bg-red-50 border-l-4 border-red-600' : ''
                }`}
              >
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
