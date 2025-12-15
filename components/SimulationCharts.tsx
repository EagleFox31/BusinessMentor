import React, { useState } from 'react';
    import {
      AreaChart,
      Area,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      ResponsiveContainer,
      LineChart,
      Line,
      Legend
    } from 'recharts';
    import { Play, RotateCcw, TrendingUp, Wallet, Activity } from 'lucide-react';
    import { SimulationDataPoint, UserProfile } from '../types';
    import { generateFinancialSimulation } from '../services/geminiService';
    
    interface SimulationChartsProps {
      user: UserProfile;
    }
    
    const initialData: SimulationDataPoint[] = [
      { month: 1, revenue: 0, expenses: 5000, stress: 20, stability: 80 },
      { month: 3, revenue: 1200, expenses: 4500, stress: 45, stability: 55 },
      { month: 6, revenue: 3800, expenses: 4800, stress: 70, stability: 30 },
      { month: 9, revenue: 5500, expenses: 5200, stress: 60, stability: 40 },
      { month: 12, revenue: 8200, expenses: 6000, stress: 50, stability: 50 },
      { month: 18, revenue: 15000, expenses: 8500, stress: 40, stability: 60 },
      { month: 24, revenue: 24000, expenses: 11000, stress: 30, stability: 70 },
    ];
    
    const SimulationCharts: React.FC<SimulationChartsProps> = ({ user }) => {
      const [data, setData] = useState<SimulationDataPoint[]>(initialData);
      const [scenario, setScenario] = useState('');
      const [isSimulating, setIsSimulating] = useState(false);
    
      const handleSimulate = async () => {
        if (!scenario.trim()) return;
        setIsSimulating(true);
        try {
          const newData = await generateFinancialSimulation(scenario, user.country);
          // Convert month numbers to "M{x}" format for display if needed, but Recharts handles numbers fine.
          // Let's ensure consistency with the initial data format for the axis
          const formattedData = newData.map(d => ({
            ...d,
            month: `M${d.month}` // Mapping number to string label
          }));
          setData(formattedData as any);
        } catch (error) {
          console.error("Simulation failed", error);
        } finally {
          setIsSimulating(false);
        }
      };
    
      const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
      const totalExpenses = data.reduce((acc, curr) => acc + curr.expenses, 0);
      const roi = totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;
    
      return (
        <div className="space-y-8 p-6 animate-fadeIn">
          
          {/* Controls Section */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Simulateur de Scénarios
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Décrivez votre stratégie (ex: 'Investissement marketing massif, prix bas, 2 embauches au M6')"
                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-500"
              />
              <button
                onClick={handleSimulate}
                disabled={isSimulating || !scenario.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
              >
                {isSimulating ? (
                  <RotateCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>Lancer la Simulation</span>
              </button>
            </div>
          </div>
    
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-emerald-500">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Revenus Projetés (24M)</p>
                    <h4 className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()}€</h4>
                  </div>
                  <TrendingUp className="text-emerald-500 w-8 h-8 opacity-50" />
               </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-red-500">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Coûts Totaux (24M)</p>
                    <h4 className="text-2xl font-bold text-white">{totalExpenses.toLocaleString()}€</h4>
                  </div>
                  <Wallet className="text-red-500 w-8 h-8 opacity-50" />
               </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">ROI Estimé</p>
                    <h4 className={`text-2xl font-bold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {roi.toFixed(1)}%
                    </h4>
                  </div>
                  <Activity className="text-blue-500 w-8 h-8 opacity-50" />
               </div>
            </div>
          </div>
    
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Financial Projections */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-200">Flux de Trésorerie</h3>
                  <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700">Vision Comptable</span>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expenses" name="Charges" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} />
                    <Legend iconType="circle" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
    
            {/* Founder Stress/Stability */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Charge Mentale & Stabilité</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} 
                    />
                    <Line type="monotone" dataKey="stress" name="Stress" stroke="#f59e0b" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="stability" name="Stabilité" stroke="#3b82f6" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                    <Legend iconType="circle" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
    
        </div>
      );
    };
    
    export default SimulationCharts;