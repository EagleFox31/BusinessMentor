
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
import { forgeFinancialSimulation } from '../services/blueprintForge';

interface SimulationChartsProps {
  user: UserProfile;
}

const initialData: SimulationDataPoint[] = [
  { month: 1, revenue: 0, expenses: 5000, stress: 20, stability: 80 },
  { month: 3, revenue: 1200, expenses: 4500, stress: 45, stability: 55 },
  { month: 6, revenue: 3800, expenses: 4800, stress: 70, stability: 30 },
  { month: 12, revenue: 8200, expenses: 6000, stress: 50, stability: 50 },
];

const SimulationCharts: React.FC<SimulationChartsProps> = ({ user }) => {
  const [data, setData] = useState<SimulationDataPoint[]>(initialData);
  const [scenario, setScenario] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  
  const currency = user.currency || '€';

  const handleSimulate = async () => {
    if (!scenario.trim()) return;
    setIsSimulating(true);
    try {
      const newData = await forgeFinancialSimulation(scenario, user.country || 'France');
      const formattedData = newData.map(d => ({
        ...d,
        month: `M${d.month}` 
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: user.currency || 'EUR', maximumSignificantDigits: 3 }).format(val);
  };

  return (
    <div className="space-y-8 p-6 animate-fadeIn">
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
            placeholder={`Décrivez votre stratégie (ex: 'Investissement marketing massif')`}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-500"
          />
          <button
            onClick={handleSimulate}
            disabled={isSimulating || !scenario.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
          >
            {isSimulating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            <span>Lancer la Simulation</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-emerald-500">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Revenus Projetés</p>
           <h4 className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</h4>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-red-500">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Coûts Totaux</p>
           <h4 className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</h4>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">ROI Estimé</p>
           <h4 className={`text-2xl font-bold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{roi.toFixed(1)}%</h4>
        </div>
      </div>

      <div className="h-[400px] glass-panel p-6 rounded-2xl">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
            <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
            <Area type="monotone" dataKey="expenses" name="Charges" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimulationCharts;
