import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { getPasswordErrors } from '@/utils/validation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

export default function RegisterScreen() {
	const { register, login, isLoading } = useAuth();
	const [formData, setFormData] = useState({
		nombreCompleto: '',
		email: '',
		password: '',
		passwordConfirm: '',
	});

	const passwordErrors = formData.password ? getPasswordErrors(formData.password) : [];
	const passwordsMatch = formData.password === formData.passwordConfirm;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const registerSuccess = await register(formData);

		if (registerSuccess) {
			await login({ email: formData.email, password: formData.password });
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
			<div className="absolute inset-0 from-blue-100/50 via-gray-50 to-indigo-100/50" />

			<div className="relative w-full max-w-md">
				<div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
							<FontAwesomeIcon icon={faUserPlus} className="text-white text-xl" />
						</div>
						<h1 className="text-2xl font-bold text-gray-800 mb-2">Crear cuenta</h1>
						<p className="text-gray-500">Regístrate para comenzar</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<Input
							label="Nombre completo"
							type="text"
							name="nombreCompleto"
							placeholder="Tu nombre"
							value={formData.nombreCompleto}
							onChange={handleChange}
							required
						/>

						<Input
							label="Correo electrónico"
							type="email"
							name="email"
							placeholder="tu@email.com"
							value={formData.email}
							onChange={handleChange}
							required
						/>

						<div>
						<Input
							label="Contraseña"
							type="password"
							name="password"
							placeholder="*****"
							value={formData.password}
							onChange={handleChange}
							required
						/>
						{formData.password && passwordErrors.length > 0 && (
							<ul className="mt-2 space-y-1">
							{passwordErrors.map((error) => (
								<li key={error} className="text-xs text-red-500 flex items-center gap-1">
								<span>•</span> {error}
								</li>
							))}
							</ul>
						)}
						</div>

						<Input
							label="Confirmar contraseña"
							type="password"
							name="passwordConfirm"
							placeholder="*****"
							value={formData.passwordConfirm}
							onChange={handleChange}
							error={
							formData.passwordConfirm && !passwordsMatch
								? 'Las contraseñas no coinciden'
								: undefined
							}
							required
						/>

						<Button type="submit" isLoading={isLoading} className="w-full" size="lg">
							Registrarse
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-gray-500">
						¿Ya tienes cuenta?{' '}
						<Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
							Iniciar sesión
						</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}