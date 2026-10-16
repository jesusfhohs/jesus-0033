import { BrowserRouter } from 'react-router-dom';
import AppRouter from '@/router/AppRouter';
import { useAuth } from '@/hooks/useAuth';

function AuthWrapper() {
    const { logout } = useAuth();

    return <AppRouter onLogout={logout} />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthWrapper />
        </BrowserRouter>
    );
}

export default App;