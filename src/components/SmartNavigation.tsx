'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Router, 
  Settings, 
  BarChart3,
  Shield,
  Wifi,
  Zap
} from 'lucide-react';

const navigation = [
  {
    name: 'Smart Home',
    href: '/',
    icon: Home,
    description: 'Device control & automation'
  },
  {
    name: 'OpenWrt Router',
    href: '/openwrt',
    icon: Router,
    description: 'Network management'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Usage & performance'
  },
  {
    name: 'Security',
    href: '/security',
    icon: Shield,
    description: 'Monitoring & alerts'
  }
];

export default function SmartNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-effect rounded-2xl p-3 shadow-2xl border border-white/20 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href as any}
                className={`
                  group relative flex items-center space-x-3 rounded-xl px-5 py-4 text-sm font-medium transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-blue-500/30 text-blue-300 shadow-lg border border-blue-400/30 shadow-blue-500/20' 
                    : 'text-slate-300 hover:bg-white/15 hover:text-white hover:border-white/20 border border-transparent'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-white'}`} />
                <div className="hidden md:block">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className={`text-xs transition-colors duration-300 ${isActive ? 'text-blue-400/80' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.description}
                  </div>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-blue-400 rounded-full shadow-lg" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
