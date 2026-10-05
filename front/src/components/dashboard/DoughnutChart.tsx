import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DoughnutChartProps {
  apuestasGanadas: number;
  apuestasPerdidas: number;
}

const COLORS = ['#4caf50', '#f44336'];

export default function DoughnutChart({ apuestasGanadas, apuestasPerdidas }: DoughnutChartProps) {
  const chartData = [
    { name: 'Ganadas', value: apuestasGanadas },
    { name: 'Perdidas', value: apuestasPerdidas },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-600 mb-4">Distribución de apuestas</h2>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex justify-between text-sm text-gray-500">
        <span style={{ color: COLORS[0] }}>{apuestasGanadas} ganadas</span>
        <span style={{ color: COLORS[1] }}>{apuestasPerdidas} perdidas</span>
      </div>
    </div>
  );
}