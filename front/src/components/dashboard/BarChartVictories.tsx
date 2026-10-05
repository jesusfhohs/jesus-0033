import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import snailVictories from '@/data/snailVictories.json';

export default function BarChartVictories() {
	return (
		<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
			<h2 className="text-lg font-semibold text-gray-600 mb-4">Victorías por Caracol</h2>
			<div style={{ width: '100%', height: '300px' }}>
				<ResponsiveContainer width="100%" height="100%">
				<BarChart data={snailVictories} layout="vertical">
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis type="number" domain={[0, 'dataMax + 1']} tick={{ fill: '#666' }} />
					<YAxis type="category" dataKey="name" tick={{ fill: '#666' }} width={80} />
					<Tooltip
					contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
					/>
					<Legend layout="horizontal" align="center" verticalAlign="bottom" />
					<Bar dataKey="victorias" name="Victorías">
					{snailVictories.map((snail, index) => (
						<Cell key={`bar-${index}`} fill={snail.color} />
					))}
					</Bar>
				</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}