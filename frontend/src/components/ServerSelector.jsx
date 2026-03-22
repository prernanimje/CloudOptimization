/**
 * Server Selector Component - Dropdown to switch between servers
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

export const ServerSelector = ({ instances = [], selectedInstance = null, onSelect = () => { } }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Get display name
  const displayName = selectedInstance?.name || 'Select a server...';

  return (
    <div className="relative w-full min-w-[350px] max-w-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] px-4 py-3 flex items-center justify-between hover:border-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-[var(--text-primary)]"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🖥️</span>
          <span className="font-medium text-[var(--text-primary)]">{displayName}</span>
        </div>
        <ChevronDown
          size={20}
          className={`text-[var(--text-secondary)] transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] shadow-xl z-10 max-h-96 overflow-y-auto hide-scrollbar">
          {instances.length === 0 ? (
            <div className="px-4 py-3 text-[var(--text-secondary)] text-center">
              No servers available. Upload data first.
            </div>
          ) : (
            instances.map((instance) => (
              <button
                key={instance.id}
                onClick={() => {
                  onSelect(instance);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-[var(--sidebar-hover)] border-b border-[var(--border-color)] last:border-b-0 transition ${selectedInstance?.id === instance.id ? 'bg-[var(--sidebar-hover)] font-semibold' : ''
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{instance.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{instance.region} • ${instance.monthly_cost}/mo</p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${instance.status === 'healthy'
                      ? 'bg-green-500'
                      : instance.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`}
                  />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ServerSelector;
