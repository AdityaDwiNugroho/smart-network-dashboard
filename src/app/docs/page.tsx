'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Zap, 
  Network, 
  Settings, 
  Code, 
  Globe, 
  Shield, 
  Cpu,
  ChevronRight,
  ExternalLink,
  Github,
  BarChart3,
  Smartphone,
  Router
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

const docSections: DocSection[] = [
  {
    id: 'overview',
    title: 'Project Overview',
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Smart Home Network Management Dashboard</h3>
          <p className="text-gray-300 leading-relaxed">
            A comprehensive web-based dashboard for managing OpenWrt routers and IoT devices in your smart home network. 
            Built with modern technologies to provide real-time monitoring, device management, and network analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-blue-400" />
              <h4 className="font-medium text-white">Real-time Monitoring</h4>
            </div>
            <p className="text-sm text-gray-400">
              Live network statistics, device status, and performance metrics with WebSocket connections.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Network className="h-5 w-5 text-green-400" />
              <h4 className="font-medium text-white">Network Topology</h4>
            </div>
            <p className="text-sm text-gray-400">
              Visual representation of your network structure and device connections.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <h4 className="font-medium text-white">OpenWrt Integration</h4>
            </div>
            <p className="text-sm text-gray-400">
              Direct integration with OpenWrt routers via SSH and SNMP protocols.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-5 w-5 text-orange-400" />
              <h4 className="font-medium text-white">Device Management</h4>
            </div>
            <p className="text-sm text-gray-400">
              Comprehensive IoT device discovery, monitoring, and control capabilities.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'tech-stack',
    title: 'Technology Stack',
    icon: Code,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Frontend Technologies</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <span className="font-medium text-white">Next.js 14</span>
                <p className="text-sm text-gray-400">React framework with App Router</p>
              </div>
              <div className="text-sm text-blue-400">Framework</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <span className="font-medium text-white">TypeScript</span>
                <p className="text-sm text-gray-400">Type-safe JavaScript development</p>
              </div>
              <div className="text-sm text-green-400">Language</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <span className="font-medium text-white">Tailwind CSS</span>
                <p className="text-sm text-gray-400">Utility-first CSS framework</p>
              </div>
              <div className="text-sm text-purple-400">Styling</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <span className="font-medium text-white">Recharts</span>
                <p className="text-sm text-gray-400">Data visualization and charting</p>
              </div>
              <div className="text-sm text-orange-400">Charts</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Backend & Services</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <span className="font-medium text-white">Socket.io</span>
                <p className="text-sm text-gray-400">Real-time WebSocket communication</p>
              </div>
              <div className="text-sm text-blue-400">Real-time</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <span className="font-medium text-white">SNMP</span>
                <p className="text-sm text-gray-400">Network device monitoring protocol</p>
              </div>
              <div className="text-sm text-green-400">Protocol</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <span className="font-medium text-white">SSH2</span>
                <p className="text-sm text-gray-400">Secure Shell connections to routers</p>
              </div>
              <div className="text-sm text-purple-400">Security</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Installation & Setup</h3>
          
          <div className="space-y-4">
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-2">1. Clone the Repository</h4>
              <div className="bg-black/50 p-3 rounded border border-slate-600">
                <code className="text-green-400 text-sm">
                  git clone https://github.com/AdityaDwiNugroho/smart-network-dashboard.git<br/>
                  cd smart-network-dashboard
                </code>
              </div>
            </div>
            
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-2">2. Install Dependencies</h4>
              <div className="bg-black/50 p-3 rounded border border-slate-600">
                <code className="text-green-400 text-sm">
                  npm install
                </code>
              </div>
            </div>
            
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-2">3. Environment Configuration</h4>
              <div className="bg-black/50 p-3 rounded border border-slate-600">
                <code className="text-green-400 text-sm">
                  cp .env.example .env.local<br/>
                  # Edit .env.local with your router credentials
                </code>
              </div>
            </div>
            
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-2">4. Start Development Server</h4>
              <div className="bg-black/50 p-3 rounded border border-slate-600">
                <code className="text-green-400 text-sm">
                  npm run dev
                </code>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Environment Variables</h3>
          <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-gray-400 w-32">ROUTER_HOST</span>
                <span className="text-white">Your OpenWrt router IP address</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">ROUTER_USER</span>
                <span className="text-white">SSH username for router</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">ROUTER_PASS</span>
                <span className="text-white">SSH password for router</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">SNMP_COMMUNITY</span>
                <span className="text-white">SNMP community string (default: public)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'architecture',
    title: 'Architecture',
    icon: Network,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">System Architecture</h3>
          <p className="text-gray-300 mb-6">
            The dashboard follows a modern, scalable architecture with clear separation of concerns.
          </p>
          
          <div className="space-y-4">
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-400" />
                Frontend Layer
              </h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong>Next.js App Router:</strong> Server and client components with proper hydration</p>
                <p><strong>React Server Components:</strong> Optimized rendering and data fetching</p>
                <p><strong>Real-time Updates:</strong> WebSocket integration for live data</p>
                <p><strong>Responsive Design:</strong> Mobile-first approach with Tailwind CSS</p>
              </div>
            </div>
            
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-green-400" />
                API Layer
              </h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong>RESTful APIs:</strong> Standard HTTP endpoints for CRUD operations</p>
                <p><strong>WebSocket Server:</strong> Real-time data streaming on port 3003</p>
                <p><strong>SNMP Integration:</strong> Network device monitoring and statistics</p>
                <p><strong>SSH Commands:</strong> Direct router management and configuration</p>
              </div>
            </div>
            
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-400" />
                Network Layer
              </h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong>OpenWrt Routers:</strong> Primary network infrastructure</p>
                <p><strong>IoT Devices:</strong> Connected smart home devices</p>
                <p><strong>Network Discovery:</strong> Automatic device detection and mapping</p>
                <p><strong>Traffic Analysis:</strong> Bandwidth monitoring and usage statistics</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Directory Structure</h3>
          <div className="bg-black/50 p-4 rounded-lg border border-slate-600">
            <pre className="text-green-400 text-sm">
{`src/
├── app/                 # Next.js App Router pages
│   ├── analytics/       # Real-time analytics dashboard
│   ├── devices/         # Device management
│   ├── network/         # Network topology
│   ├── openwrt/         # Router management
│   ├── settings/        # Configuration
│   └── api/             # API routes
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions & services
├── services/            # External service integrations
└── types/               # TypeScript type definitions`}
            </pre>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Features & Usage',
    icon: Settings,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Core Features</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Real-time Analytics
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Live network traffic monitoring</li>
                <li>• Bandwidth usage statistics</li>
                <li>• Device performance metrics</li>
                <li>• Historical data visualization</li>
                <li>• Custom time range analysis</li>
              </ul>
            </div>
            
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-400" />
                Device Management
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Automatic device discovery</li>
                <li>• Device status monitoring</li>
                <li>• MAC address tracking</li>
                <li>• IP assignment management</li>
                <li>• Device categorization</li>
              </ul>
            </div>
            
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-400" />
                Network Topology
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Visual network mapping</li>
                <li>• Connection status tracking</li>
                <li>• Network path visualization</li>
                <li>• Subnet management</li>
                <li>• Port status monitoring</li>
              </ul>
            </div>
            
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Router className="h-5 w-5 text-orange-400" />
                OpenWrt Integration
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Router configuration management</li>
                <li>• Wireless settings control</li>
                <li>• Firewall rule management</li>
                <li>• Package installation</li>
                <li>• System monitoring</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">How to Use</h3>
          
          <div className="space-y-4">
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-2">1. Configure Router Connection</h4>
              <p className="text-sm text-gray-300">
                Navigate to Settings and enter your OpenWrt router's IP address, SSH credentials, and SNMP community string.
              </p>
            </div>
            
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-2">2. Monitor Network Activity</h4>
              <p className="text-sm text-gray-300">
                Visit the Analytics page to view real-time network statistics, bandwidth usage, and device activity.
              </p>
            </div>
            
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-2">3. Manage Connected Devices</h4>
              <p className="text-sm text-gray-300">
                Use the Devices page to view all connected devices, monitor their status, and manage IP assignments.
              </p>
            </div>
            
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-2">4. Visualize Network Topology</h4>
              <p className="text-sm text-gray-300">
                Check the Network page for a visual representation of your network structure and device connections.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const currentSection = docSections.find(section => section.id === activeSection);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700">
            <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Documentation</h1>
                <p className="text-gray-400">Complete guide to the Smart Home Dashboard</p>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://github.com/AdityaDwiNugroho/smart-network-dashboard"
                className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub Repository
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://nextjs.org/docs"
                className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Next.js Docs
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://tailwindcss.com/docs"
                className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Tailwind CSS
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-4">
                <h3 className="font-medium text-white mb-4">Contents</h3>
                <nav className="space-y-1">
                  {docSections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'text-gray-300 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <section.icon className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`} />
                        {section.title}
                        {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-6 min-h-[600px]">
                {currentSection && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <currentSection.icon className="h-6 w-6 text-blue-400" />
                      <h2 className="text-2xl font-bold text-white">{currentSection.title}</h2>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      {currentSection.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  );
}
