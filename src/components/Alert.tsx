import React from 'react';

'use client';

import { DeviceTimestamp } from './DeviceTimestamp';

interface AlertProps {
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
}

const severityColors = {
  info: 'blue',
  warning: 'yellow',
  error: 'red',
  critical: 'red',
};

export function Alert({ severity, title, message, timestamp }: AlertProps) {
  const color = severityColors[severity];

  return (
    <div className={`border-l-4 border-${color}-500 pl-4`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <span className={`px-2 py-1 text-xs rounded-full bg-${color}-50 text-${color}-700`}>
          {severity}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{message}</p>
      <p className="text-xs text-gray-400 mt-1">
        <DeviceTimestamp timestamp={timestamp} format="datetime" />
      </p>
    </div>
  );
}
