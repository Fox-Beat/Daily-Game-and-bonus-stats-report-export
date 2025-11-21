import React, { useState, useEffect } from 'react';
import { UserConfig, Tab, ReportDefinition } from './types.ts';
import ReportExporter from './components/BookmarkletGenerator.tsx'; 
import { Settings, BarChart3, CalendarClock, HelpCircle, Puzzle, LayoutDashboard } from 'lucide-react';

// --- Report Definitions ---

const REPORT_TEMPLATES: ReportDefinition[] = [
  {
    id: 'bonus_stats',
    name: 'Bonus Statistics',
    reportId: 'Reporting___Bonus_statistics',
    configurationCode: '477053',
    dateFormat: 'datetime', // Uses YYYY-MM-DD HH:mm:ss
    outputs: "currency_code,username,userid,instance_name,viplevel,bonus_template_name,bonus_type_name,fillrealbalance,fillbonusbalance,fillpendingwinnings,bonus_status,product,game_name,accepted,accepted_fs,bonus_bet_cancel,bonus_bet,bonus_pending_winnings_bet,bonus_pending_winnings_cancel,bonus_pending_winnings_win,bonus_win,cancelled_bonus_initial,cancelled_bonus_initial_fs,cancelled_pending_winnings,cancelled_used_bonus_initial,expired_bonus_initial,expired_bonus_initial_fs,expired_pending_winnings,bonus_bet_fs,player_count,redeemed_bonus_initial,redeemed_bonus_initial_fs,redeemed_pending_winnings,reverse_redeemed_bonus_initial,used_bonus_initial",
    getFilters: (config, dateRangeStr) => ({
      instance: config.instances,
      daterange: dateRangeStr,
      time_zone_picker: config.timeZone,
      reportBy: "username,userid,instance,viplevel,bonus_template_name,bonus_type_name,fillrealbalance,fillbonusbalance,fillpendingwinnings,bonus_status,product,game_name"
    })
  },
  {
    id: 'game_stats',
    name: 'Game Statistics',
    reportId: 'Reporting___Game_statistics',
    configurationCode: '466541',
    dateFormat: 'date', // Uses YYYY-MM-DD
    outputs: "currencycode,username,playercode,casino,date1,clienttype,clientplatform,viplevel,platform,gamename,maximumrtp,gametype,gtype,gamegroup,gameshortname,gameprovider,gametechnology,gamesuite,gamescnt,totalbets,totalgamebets,totalgamewins,totalincome,refund,totalplayerwins,realbets,realmoneyincome",
    getFilters: (config, dateRangeStr) => ({
      sdin: "2",
      siaccounts: "2",
      casino: config.instances, // Maps generic 'instances' to 'casino' param
      daterange: dateRangeStr,
      reportBy: "playerusername,casino,date1,currencycode,clienttype,clientplatform,viplevel,dplatform,gamename,gametype,gtype,gamegroup,gameshortname,gameprovider,gametechnology,gamesuite"
    })
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GENERATOR);
  
  // Default config
  const [userConfig, setUserConfig] = useState<UserConfig>({
    instances: ['4280', '4690'],
    timeZone: 'Africa/Abidjan',
    apiKey: '', 
  });

  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <LayoutDashboard className="text-white" size={24} />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight">Auto Report Dashboard</h1>
                <p className="text-xs text-slate-400">Daily Statistics Exporter</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setShowConfig(!showConfig)}
                className={`p-2 rounded-lg transition-colors ${showConfig ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Settings"
             >
                <Settings size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Config Panel */}
        {showConfig && (
            <div className="mb-8 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl animate-in slide-in-from-top-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-400">
                    <Settings size={18} /> Global Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Instance IDs / Casino IDs</label>
                        <input 
                            type="text" 
                            value={userConfig.instances.join(',')} 
                            onChange={(e) => setUserConfig({...userConfig, instances: e.target.value.split(',').map(s => s.trim())})}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200"
                            placeholder="4280, 4690"
                        />
                        <p className="text-xs text-slate-500 mt-1">Comma separated IDs</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Timezone</label>
                        <input 
                            type="text" 
                            value={userConfig.timeZone} 
                            onChange={(e) => setUserConfig({...userConfig, timeZone: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200"
                        />
                    </div>
                </div>
            </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 border-b border-slate-800 pb-1">
            <button 
                onClick={() => setActiveTab(Tab.GENERATOR)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${activeTab === Tab.GENERATOR ? 'text-white bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <BarChart3 size={16} />
                Dashboard
                {activeTab === Tab.GENERATOR && <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-indigo-500"></div>}
            </button>
             <button 
                onClick={() => setActiveTab(Tab.HELP)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${activeTab === Tab.HELP ? 'text-white bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <HelpCircle size={16} />
                How it works
                {activeTab === Tab.HELP && <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-emerald-500"></div>}
            </button>
        </div>

        {/* Main Content */}
        <div className="animate-in fade-in duration-500">
            {activeTab === Tab.GENERATOR && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden min-h-[400px] flex items-center justify-center">
                         <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                             <LayoutDashboard size={120} />
                         </div>
                         
                         <ReportExporter 
                            userConfig={userConfig} 
                            reports={REPORT_TEMPLATES} 
                         />
                    </div>
                </div>
            )}

            {activeTab === Tab.HELP && (
                <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="bg-slate-900 p-8 rounded-xl border border-slate-800">
                        <h2 className="text-2xl font-bold text-white mb-6">Usage Instructions</h2>
                        
                        <div className="space-y-6">
                            <section>
                                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                                    <h4 className="font-semibold text-indigo-400 mb-2">Prerequisites</h4>
                                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                                        <li>
                                            Ensure you are logged into <span className="text-slate-200">admin-cur.techonlinecorp.com</span> in this same browser.
                                        </li>
                                        <li>
                                            Allow <strong>Pop-ups</strong> from this page. (The tool needs to open multiple export windows rapidly).
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                                    Date Automation
                                </h3>
                                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 text-sm text-slate-300 font-mono space-y-2">
                                   <div className="flex justify-between">
                                      <span>Run on MONDAY</span>
                                      <span className="text-emerald-400">Exports Fri, Sat, Sun (Combined)</span>
                                   </div>
                                   <div className="flex justify-between border-t border-slate-800 pt-2">
                                      <span>Run on TUE-SUN</span>
                                      <span className="text-indigo-400">Exports Yesterday (Daily)</span>
                                   </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;