'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAdmin } = useAppSelector((state) => state.auth);

  const menuItems = [
    { label: 'Ana Səhifə', href: '/' },
    { label: 'Haqqımızda', href: '/about' },
    { label: 'Xidmətlərimiz', href: '/services' },
    { label: 'Layihələr', href: '/projects' },
    { label: 'Əlaqə', href: '/contact' },
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="fixed w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Azərişıq Beyin Mərkəzi"
                width={50}
                height={50}
                className="w-auto h-12"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-orange-500">Azərişıq</span>
                <span className="text-lg font-bold text-gray-700">Beyin Mərkəzi</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex flex-1 justify-center items-center">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons - Right Aligned */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-orange-500 transition-colors duration-300"
                  >
                    Profilim
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-600 hover:text-orange-500 transition-colors duration-300"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-orange-500 transition-colors duration-300"
                >
                  Çıxış
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors duration-300"
              >
                Giriş
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-orange-500 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  {!isAdmin && (
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-orange-500 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profilim
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-orange-500 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-orange-500 hover:bg-gray-50 rounded-md"
                  >
                    Çıxış
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block px-3 py-2 mt-2 text-base font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar; 