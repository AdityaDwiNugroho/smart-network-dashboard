'use client';

import { useState, useEffect } from 'react';

interface ClientTimeProps {
  className?: string;
  format?: 'time' | 'datetime' | 'date';
}

export function ClientTime({ className = '', format = 'time' }: ClientTimeProps) {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      const now = new Date();
      let formatted = '';
      
      switch (format) {
        case 'time':
          formatted = now.toLocaleTimeString();
          break;
        case 'datetime':
          formatted = now.toLocaleString();
          break;
        case 'date':
          formatted = now.toLocaleDateString();
          break;
        default:
          formatted = now.toLocaleTimeString();
      }
      
      setTime(formatted);
    };

    // Update immediately
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [format]);

  // Don't render anything on server side to prevent hydration mismatch
  if (!mounted) {
    return <span className={className}>--:--:--</span>;
  }

  return <span className={className}>{time}</span>;
}
