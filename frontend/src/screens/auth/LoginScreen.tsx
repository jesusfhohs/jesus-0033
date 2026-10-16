import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export default function LoginScreen() {
	const { login, isLoading } = useAuth();
	const [formData, setFormData] = useState({ email: '', password: '' });

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		await login(formData);
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
			<div className="absolute inset-0 from-blue-100/50 via-gray-50 to-indigo-100/50" />

			<div className="relative w-full max-w-md">
				<div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
							<FontAwesomeIcon icon={faUser} className="text-white text-xl" />
						</div>
						<h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</h1>
						<p className="text-gray-500">Inicia sesión</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<Input
							label="Correo electrónico"
							type="email"
							name="email"
							placeholder="tu@email.com"
							value={formData.email}
							onChange={handleChange}
							required
						/>

						<Input
							label="Contraseña"
							type="password"
							name="password"
							placeholder="*****"
							value={formData.password}
							onChange={handleChange}
							required
						/>

						<Button type="submit" isLoading={isLoading} className="w-full" size="lg">
							Iniciar sesión
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-gray-500">
							¿No tienes cuenta?{' '}
							<Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
								Regístrate aquí
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}