'use client';

import { useState, useEffect } from 'react';

interface DeviceTimestampProps {
  timestamp: Date;
  className?: string;
  format?: 'time' | 'datetime' | 'date';
}

export function DeviceTimestamp({ timestamp, className = '', format = 'time' }: DeviceTimestampProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server side to prevent hydration mismatch
  if (!mounted) {
    return <span className={className}>--:--:--</span>;
  }

  let formatted = '';
  switch (format) {
    case 'time':
      formatted = timestamp.toLocaleTimeString();
      break;
    case 'datetime':
      formatted = timestamp.toLocaleString();
      break;
    case 'date':
      formatted = timestamp.toLocaleDateString();
      break;
    default:
      formatted = timestamp.toLocaleTimeString();
  }

  return <span className={className}>{formatted}</span>;
}
