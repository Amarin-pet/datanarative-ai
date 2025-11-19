import React from 'react';
import { CSVAnalysis } from '../types';
import { TrendingUp, DollarSign, PieChart, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface StatsDashboardProps {
  analysis: CSVAnalysis;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ analysis }) => {
  // Format for chart
  const chartData = analysis.monthlyTrend.slice(-6); // Last 6 months only for mini chart

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-500 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Volume</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {analysis.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-400 mt-1 truncate">Col: {analysis.amountColumnName}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Records</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{analysis.rowCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Top Categories */}
      <div>
        <div className="flex items-center space-x-2 text-slate-500 mb-3">
            <PieChart className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Top Areas ({analysis.categoryColumnName})</span>
        </div>
        <div className="space-y-3">
            {analysis.topCategories.slice(0, 5).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 truncate">
                        <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex-shrink-0">{idx + 1}</span>
                        <span className="text-slate-700 truncate max-w-[120px]" title={cat.name}>{cat.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">{cat.value.toLocaleString(undefined, { notation: 'compact' })}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Mini Trend Chart */}
      {chartData.length > 1 && (
        <div className="h-32 mt-4">
            <div className="flex items-center space-x-2 text-slate-500 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Recent Trend</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis dataKey="month" hide />
                    <YAxis hide />
                    <Tooltip 
                        contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [value.toLocaleString(), 'Amount']}
                    />
                    <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StatsDashboard;