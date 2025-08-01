'use client';

import { NetworkStats } from '@/components/NetworkStats';

export default function NetworkPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Network Status</h1>

        <NetworkStats
          deviceId="router-1"
          host="192.168.1.1"
          interfaces={[1]} // Main interface
        />

        <div className="bg-slate-900/80 backdrop-blur-sm shadow rounded-lg border border-slate-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-white">
              Network Topology
            </h3>
            <div className="mt-4 h-96 bg-slate-800 rounded border border-slate-600 flex items-center justify-center">
              <p className="text-gray-400">Network visualization coming soon...</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm shadow rounded-lg border border-slate-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-white">
              Network Performance History
            </h3>
            <div className="mt-4 h-64 bg-slate-800 rounded border border-slate-600 flex items-center justify-center">
              <p className="text-gray-400">Performance graph coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
