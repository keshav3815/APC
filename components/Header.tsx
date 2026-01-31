'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Moon, Sun, User, LogOut, LayoutDashboard, ChevronDown, Settings, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const { user, profile, signOut, isAdmin, isLibrarian, loading } = useAuth()

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', String(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/community', label: 'Community' },
    { href: '/books', label: 'Books' },
    { href: '/events', label: 'Events' },
    { href: '/donations', label: 'Donations' },
    { href: '/transparency', label: 'Transparency' },
    { href: '/expenses', label: 'Expenses' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  const getDashboardLink = () => {
    if (isAdmin) return '/admin'
    if (isLibrarian) return '/librarian'
    return '/dashboard'
  }

  const getRoleBadge = () => {
    if (isAdmin) return { text: 'Admin', color: 'bg-red-100 text-red-700' }
    if (isLibrarian) return { text: 'Librarian', color: 'bg-green-100 text-green-700' }
    return { text: 'Member', color: 'bg-blue-100 text-blue-700' }
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 shadow-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover-scale group">
            <div className="logo-container group-hover:animate-scale-bounce">
              <Image 
                src="/images/apc.svg" 
                alt="APC Logo" 
                width={50}
                height={50}
                className="logo-image"
                priority
              />
            </div>
            <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:animate-gradient-shift">
              APC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 rounded-lg hover:bg-white dark:hover:bg-gray-800 relative group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover-scale"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500 animate-float" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500 animate-float-slow" />
              )}
            </button>

            {/* Auth Section */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                        {profile?.full_name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-in-up">
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {profile?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge().color}`}>
                              {getRoleBadge().text}
                            </span>
                          </div>

                          <div className="py-1">
                            <Link
                              href={getDashboardLink()}
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-3" />
                              Dashboard
                            </Link>
                            
                            {isAdmin && (
                              <Link
                                href="/admin"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Shield className="w-4 h-4 mr-3" />
                                Admin Panel
                              </Link>
                            )}

                            {isLibrarian && (
                              <Link
                                href="/librarian"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Settings className="w-4 h-4 mr-3" />
                                Library Panel
                              </Link>
                            )}

                            <Link
                              href="/dashboard/settings"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <User className="w-4 h-4 mr-3" />
                              Profile Settings
                            </Link>
                          </div>

                          <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                            <button
                              onClick={() => {
                                setShowUserMenu(false)
                                signOut()
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center space-x-2">
                    <Link
                      href="/auth/signin"
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden hover-scale"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 animate-slide-in-up">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth Links */}
            {!loading && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                {user ? (
                  <>
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        signOut()
                      }}
                      className="block w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-3 px-4 text-white bg-gradient-to-r from-orange-500 to-green-600 rounded-lg text-center font-medium"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
