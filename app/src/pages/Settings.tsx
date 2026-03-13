import { Settings2, Monitor, Database, Shield, Link2, Bell } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white mb-2">
          <Settings2 className="text-cyan-400" />
          Nexus Settings
        </h1>
        <p className="text-white/40 text-sm">Configure your DLX Studio local environment</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {[
            { id: 'general', label: 'General', icon: Monitor, active: true },
            { id: 'ai', label: 'Local Models', icon: Database },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'connections', label: 'Connections', icon: Link2 },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map(tab => (
            <button key={tab.id} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              tab.active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
            }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-6">General Preferences</h2>
            
            <div className="space-y-8">
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-white font-medium mb-1">Theme Preferences</div>
                    <div className="text-xs text-white/40">Nexus natively uses Tailwind v4 dark mode</div>
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-white/50">LOCKED TO DARK</div>
                </label>
              </div>

              <div className="border-t border-white/5 pt-8">
                <label className="flex items-center justify-between cursor-pointer mb-6">
                  <div>
                    <div className="text-white font-medium mb-1">Tailscale Remote Access</div>
                    <div className="text-xs text-white/40">Allow connections from your authorized Tailnet Mesh</div>
                  </div>
                  <div className="w-12 h-6 bg-cyan-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </label>

                <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/30">Local Host:</span>
                    <span className="text-emerald-400">http://localhost:3001</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/30">Tailscale IP:</span>
                    <span className="text-cyan-400">http://100.x.x.x:3001</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-8">
                <h3 className="text-white font-medium mb-4">Google Drive Integration</h3>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-blue-400">Service Account Online</span>
                  </div>
                  <p className="text-xs text-blue-400/60">
                    Nexus is authenticated via Service Account and mapping `LuxRig_Brain` perfectly.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
