'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BarChart3, 
  Wifi, 
  Settings, 
  Smartphone,
  Router,
  Menu,
  X,
  ChevronRight,
  Zap,
  BookOpen
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/' as const, icon: Home, description: 'System overview' },
  { name: 'Analytics', href: '/analytics' as const, icon: BarChart3, description: 'Real-time insights' },
  { name: 'Network', href: '/network' as const, icon: Wifi, description: 'Network topology' },
  { name: 'Devices', href: '/devices' as const, icon: Smartphone, description: 'Connected devices' },
  { name: 'OpenWrt', href: '/openwrt' as const, icon: Router, description: 'Router management' },
  { name: 'Documentation', href: '/docs' as const, icon: BookOpen, description: 'Project docs' },
  { name: 'Settings', href: '/settings' as const, icon: Settings, description: 'Configuration' },
];

export default function ResponsiveNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Desktop Navigation - Sleek sidebar */}
      <nav className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-72">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 px-6 py-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SmartHome</h1>
              <p className="text-xs text-gray-400">Network Dashboard</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                          : 'text-gray-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                      <div className="flex-1">
                        <div>{item.name}</div>
                        <div className={`text-xs transition-colors duration-200 ${
                          isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-400'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 p-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400">System Online</span>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Simple menu button */}
      <div className="lg:hidden">
        {/* Mobile menu button only */}
        <div className="fixed top-4 left-4 z-50">
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-800 transition-all duration-200 shadow-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Slide-out Menu */}
        <div className={`relative z-50 lg:hidden ${isMobileMenuOpen ? '' : 'pointer-events-none'}`}>
          {/* Background overlay */}
          <div
            className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-out panel */}
          <div className={`fixed inset-y-0 left-0 z-50 w-full max-w-sm transform overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex h-16 shrink-0 items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700">
                  <Zap className="h-4 w-4 text-blue-400" />
                </div>
                <h1 className="text-lg font-bold text-white">SmartHome</h1>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="px-6 py-4">
              <ul role="list" className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-lg p-4 text-sm font-medium leading-6 transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'text-gray-300 hover:text-white hover:bg-slate-800'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className={`h-6 w-6 shrink-0 transition-transform duration-200 ${
                          isActive ? 'scale-110' : 'group-hover:scale-105'
                        }`} />
                        <div className="flex-1">
                          <div className="text-base">{item.name}</div>
                          <div className={`text-sm transition-colors duration-200 ${
                            isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-400'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                        {isActive && (
                          <ChevronRight className="h-5 w-5 shrink-0" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Mobile Status */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-4">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <div>
                  <div className="text-sm font-medium text-white">System Online</div>
                  <div className="text-xs text-gray-400">Real-time monitoring active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
