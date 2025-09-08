import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';

interface AgeBasedRateChartProps {
  ageIncreases: number[];
  currentAge: number;
}

type ChartType = 'bar' | 'line';

export const AgeBasedRateChart: React.FC<AgeBasedRateChartProps> = ({ ageIncreases, currentAge }) => {
  const [chartType, setChartType] = useState<ChartType>('line');

  // Prepare data for the chart
  const chartData = ageIncreases.map((increase, index) => ({
    year: `Year ${index + 1}`,
    yearNumber: index + 1,
    age: currentAge + index,
    increasePercent: increase * 100,
    increaseLabel: increase > 0 ? `+${(increase * 100).toFixed(1)}%` : '0%',
    cumulativeIncrease: ageIncreases.slice(0, index + 1).reduce((sum, inc) => sum + inc, 0) * 100
  }));

  // Calculate max value for better scaling
  const maxIncrease = Math.max(...chartData.map(d => d.increasePercent));
  const yAxisMax = Math.ceil(maxIncrease * 1.2); // Add 20% padding

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{`${label} (Age ${data.age})`}</p>
          <p className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Annual Rate Increase: {data.increaseLabel}
          </p>
          <p className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Cumulative Increase: +{data.cumulativeIncrease.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="year" 
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            domain={[0, yAxisMax]}
            label={{ value: 'Rate Increase (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="increasePercent" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            stroke="#2563eb"
            strokeWidth={1}
          />
        </BarChart>
      );
    } else {
      return (
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="year" 
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            domain={[0, yAxisMax]}
            label={{ value: 'Rate Increase (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone"
            dataKey="increasePercent" 
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#2563eb', strokeWidth: 2 }}
          />
          <Line 
            type="monotone"
            dataKey="cumulativeIncrease" 
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
          />
        </ComposedChart>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Type Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Chart Type:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                chartType === 'bar' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                chartType === 'line' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Line Chart
            </button>
          </div>
        </div>
        
        {chartType === 'line' && (
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
              <span className="text-gray-600">Annual Increase</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-green-500 mr-2"></div>
              <span className="text-gray-600">Cumulative</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      {/* Chart Legend/Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {chartData.map((item, index) => (
          <div key={index} className="text-center p-2 bg-gray-50 rounded border">
            <div className="text-gray-600">{item.year}</div>
            <div className="font-medium text-blue-600">{item.increaseLabel}</div>
            <div className="text-gray-500 text-xs">Age {item.age}</div>
          </div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h6 className="text-sm font-medium text-blue-900 mb-2">Key Insights</h6>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-800">
          <div>
            <span className="font-medium">Total Projected Increase:</span>
            <div className="text-blue-600 font-bold">
              +{chartData[chartData.length - 1]?.cumulativeIncrease.toFixed(1)}%
            </div>
          </div>
          <div>
            <span className="font-medium">Highest Annual Increase:</span>
            <div className="text-blue-600 font-bold">
              +{maxIncrease.toFixed(1)}%
            </div>
          </div>
          <div>
            <span className="font-medium">Age Range:</span>
            <div className="text-blue-600 font-bold">
              {currentAge} - {currentAge + ageIncreases.length - 1} years
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
