import type { Usuario } from '@/interfaces/user';

const STORAGE_KEYS = {
	USERS: 'caracoles_users',
	AUTH: 'caracoles_auth',
} as const;

export function getUsers(): Usuario[] {
	try {
		const data = localStorage.getItem(STORAGE_KEYS.USERS);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export function saveUser(user: Usuario): void {
	const users = getUsers();
	users.push(user);
	localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function findUserByEmail(email: string): Usuario | undefined {
	const users = getUsers();
	return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function updateUser(updatedUser: Usuario): void {
	const users = getUsers();
	const index = users.findIndex((u) => u.id === updatedUser.id);
	if (index !== -1) {
		users[index] = updatedUser;
		localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
	}
}

export function getAuth(): Usuario | null {
	try {
		const data = localStorage.getItem(STORAGE_KEYS.AUTH);
		return data ? JSON.parse(data) : null;
	} catch {
		return null;
	}
}

export function setAuth(user: Usuario): void {
  	localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
}

export function clearAuth(): void {
  	localStorage.removeItem(STORAGE_KEYS.AUTH);
}
