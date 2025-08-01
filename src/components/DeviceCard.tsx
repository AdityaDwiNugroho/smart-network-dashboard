'use client';

import React from 'react';
import { DeviceTimestamp } from './DeviceTimestamp';

interface DeviceCardProps {
  name: string;
  type: 'router' | 'switch' | 'iot' | 'computer' | 'mobile' | 'other';
  status: 'online' | 'offline' | 'warning' | 'error';
  ipAddress: string;
  macAddress: string;
  lastSeen: Date;
}

const statusColors = {
  online: 'green',
  offline: 'gray',
  warning: 'yellow',
  error: 'red',
};

const deviceIcons = {
  router: '🌐',
  switch: '🔌',
  iot: '🏠',
  computer: '💻',
  mobile: '📱',
  other: '📦',
};

export function DeviceCard({
  name,
  type,
  status,
  ipAddress,
  macAddress,
  lastSeen,
}: DeviceCardProps) {
  const color = statusColors[status];
  const icon = deviceIcons[type];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{type}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full bg-${color}-50 text-${color}-700`}
        >
          {status}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>IP: {ipAddress}</p>
        <p>MAC: {macAddress}</p>
        <p className="text-xs text-gray-400">
          Last seen: <DeviceTimestamp timestamp={lastSeen} format="datetime" />
        </p>
      </div>
    </div>
  );
}
