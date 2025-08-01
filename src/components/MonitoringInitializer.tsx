'use client';

import { useEffect } from 'react';

export function MonitoringInitializer() {
  useEffect(() => {
    const startMonitoring = async () => {
      try {
        console.log('Starting real-time monitoring...');
        
        const response = await fetch('/api/monitoring', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Real-time monitoring started:', data);
        } else {
          console.error('Failed to start monitoring:', await response.text());
        }
      } catch (error) {
        console.error('Error starting monitoring:', error);
      }
    };

    // Start monitoring when component mounts
    startMonitoring();
  }, []);

  return null; // This component doesn't render anything
}

export default MonitoringInitializer;
