import { Settings2, Monitor, Database, Shield, Link2, Bell, Cpu, HardDrive } from 'lucide-react';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';
import { useState } from 'react';

// Import Settings Tabs
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { LocalModelsSettings } from '../components/settings/LocalModelsSettings';
import { PrivacySettings } from '../components/settings/PrivacySettings';
import { ConnectionsSettings } from '../components/settings/ConnectionsSettings';
import { NotificationsSettings } from '../components/settings/NotificationsSettings';

export function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const TABS = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'ai', label: 'Local Models', icon: Database },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <PageLayout color="purple" noPadding>
      <div className="w-full max-w-[2000px] mx-auto px-6 md:px-10 py-10 pb-32">
        <PageHeader
          title="Settings"
          subtitle="Manage your application preferences and connections."
          icon={<Settings2 size={24} className="text-purple-400" />}
          actions={
            <div className="flex items-center gap-3">
              <StatPill label="Authenticated" color="green" />
              <StatPill label="v2.0.0" />
            </div>
          }
        />

        <div className="grid lg:grid-cols-12 gap-10 items-start mt-4">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-4 border-white/5 bg-white/[0.01]">
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-6 ml-4">Preferences</h2>
              <div className="space-y-1" role="tablist" aria-label="Settings sections">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`settings-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all border ${
                      activeTab === tab.id
                        ? 'bg-purple-500/10 border-purple-500/30 text-white shadow-xl shadow-purple-950/20'
                        : 'text-white/40 border-transparent hover:bg-white/[0.02] hover:text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <tab.icon size={18} className={activeTab === tab.id ? 'text-purple-400' : 'text-white/20'} aria-hidden="true" />
                      <span className="text-xs font-bold tracking-wide">{tab.label}</span>
                    </div>
                    {activeTab === tab.id && <div className="w-1.5 h-4 bg-purple-500 rounded-full" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-purple-500/[0.02] to-transparent">
               <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">System Status</h2>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3 text-white/50">
                        <Cpu size={14} />
                        <span className="text-xs font-medium tracking-wide">CPU</span>
                     </div>
                     <span className="text-xs font-bold text-purple-400">Normal</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3 text-white/50">
                        <HardDrive size={14} />
                        <span className="text-xs font-medium tracking-wide">Storage</span>
                     </div>
                     <span className="text-xs font-bold text-cyan-400">Healthy</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Main Configuration Workspace */}
          <div className="lg:col-span-9" role="tabpanel" id={`settings-panel-${activeTab}`} aria-label={`${TABS.find(t => t.id === activeTab)?.label} settings`}>
             {activeTab === 'general' && <GeneralSettings />}
             {activeTab === 'ai' && <LocalModelsSettings />}
             {activeTab === 'privacy' && <PrivacySettings />}
             {activeTab === 'connections' && <ConnectionsSettings />}
             {activeTab === 'notifications' && <NotificationsSettings />}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
