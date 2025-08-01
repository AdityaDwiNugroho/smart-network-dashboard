'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Devices', href: '/devices' },
  { name: 'Network', href: '/network' },
  { name: 'Settings', href: '/settings' },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e5e5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '64px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', margin: 0 }}>
              Smart Home Dashboard
            </h1>
            <div style={{ display: 'flex', marginLeft: '40px', gap: '30px' }}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href as any}
                  style={{
                    color: pathname === item.href ? '#0070f3' : '#666',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderBottom: pathname === item.href ? '2px solid #0070f3' : '2px solid transparent',
                    fontWeight: '500'
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>{session.user?.email}</span>
                <button
                  onClick={() => signOut()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
