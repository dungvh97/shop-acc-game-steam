import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ accountType, accountId, isGameDetail = false, accountName = '' }) => {
  const getBreadcrumbText = () => {
    switch (accountType) {
      case 'ONE_GAME':
        return 'Tài Khoản Steam 1 Game';
      case 'MULTI_GAMES':
        return 'Tài Khoản Steam Nhiều Game';
      case 'DISCOUNTED':
        return 'Sản Phẩm Ưu Đãi';
      case 'OTHER_ACCOUNT':
        return 'Sản Phẩm Khác';
      default:
        return 'Tài Khoản Steam Online';
    }
  };

  const getBreadcrumbLink = () => {
    switch (accountType) {
      case 'ONE_GAME':
        return '/steam-accounts/single-game';
      case 'MULTI_GAMES':
        return '/steam-accounts/multi-game';
      case 'DISCOUNTED':
        return '/discounted';
      case 'OTHER_ACCOUNT':
        return '/other-products';
      default:
        return '/steam-accounts';
    }
  };

  return (
    <nav className="flex items-center text-sm text-gray-600 mb-6 flex-nowrap overflow-hidden">
      <Link to="/" className="hover:text-red-600 whitespace-nowrap">Trang chủ</Link>
      <span className="mx-2 whitespace-nowrap">{'>>'}</span>
      <Link to="/steam-accounts" className="hover:text-red-600 whitespace-nowrap">Tài khoản Steam Online</Link>
      <span className="mx-2 whitespace-nowrap">{'>>'}</span>
      <Link
        to={getBreadcrumbLink()}
        className="hover:text-red-600 whitespace-nowrap"
      >
        {getBreadcrumbText()}
      </Link>
      {accountName && (
        <>
          <span className="mx-2 whitespace-nowrap">{'>>'}</span>
          <span className="text-gray-800 whitespace-nowrap">{accountName}</span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumbs;
