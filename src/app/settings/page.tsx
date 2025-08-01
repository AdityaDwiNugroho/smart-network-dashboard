'use client';

import { useState } from 'react';

type FieldType = {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'select' | 'checkbox';
  defaultValue: string | boolean;
  options?: string[];
};

type Section = {
  id: string;
  title: string;
  fields: FieldType[];
};

const sections: Section[] = [
  {
    id: 'general',
    title: 'General Settings',
    fields: [
      { name: 'siteName', label: 'Site Name', type: 'text', defaultValue: 'Smart Home Dashboard' },
      { name: 'timezone', label: 'Timezone', type: 'select', defaultValue: 'UTC', options: ['UTC', 'EST', 'PST', 'GMT'] },
    ],
  },
  {
    id: 'router',
    title: 'Router Configuration',
    fields: [
      { name: 'routerIp', label: 'Router IP', type: 'text', defaultValue: '192.168.1.1' },
      { name: 'routerUsername', label: 'Username', type: 'text', defaultValue: '' },
      { name: 'routerPassword', label: 'Password', type: 'password', defaultValue: '' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    fields: [
      { name: 'emailNotifications', label: 'Email Notifications', type: 'checkbox', defaultValue: true },
      { name: 'emailAddress', label: 'Email Address', type: 'email', defaultValue: '' },
    ],
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </header>

        <div className="bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-lg border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Sidebar */}
            <nav className="p-4 border-r border-slate-700">
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                          activeSection === section.id
                            ? 'bg-blue-900/50 text-blue-300'
                            : 'text-gray-300 hover:bg-slate-800'
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Main content */}
              <div className="p-6 md:col-span-3">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={activeSection === section.id ? '' : 'hidden'}
                  >
                    <h2 className="text-lg font-medium text-white mb-4">
                      {section.title}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {section.fields.map((field) => (
                        <div key={field.name}>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium text-gray-300"
                          >
                            {field.label}
                          </label>
                          <div className="mt-1">
                            {field.type === 'select' && field.options ? (
                              <select
                                id={field.name}
                                name={field.name}
                                defaultValue={field.defaultValue as string}
                                className="bg-slate-800 border border-slate-600 text-white rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                {field.options.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === 'checkbox' ? (
                              <input
                                id={field.name}
                                name={field.name}
                                type="checkbox"
                                defaultChecked={field.defaultValue as boolean}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-600 rounded"
                              />
                            ) : (
                              <input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                defaultValue={field.defaultValue as string}
                                className="bg-slate-800 border border-slate-600 text-white rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="pt-5">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
