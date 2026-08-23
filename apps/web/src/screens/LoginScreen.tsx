import { useState } from 'react';
import { login, type User } from '../api';
import { Brand } from '../Brand';
import { theme } from '../theme';

type Props = { onLogin: (token: string, user: User) => void; onIrARegistro: () => void };

export function LoginScreen({ onLogin, onIrARegistro }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    async function handleLogin() {
        setCargando(true);
        setError('');
        try {
        const data = await login(email, password);
        onLogin(data.accessToken, data.user);
        } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
        } finally {
        setCargando(false);
        }
    }

    return (
        <div className="app app--center">
        <Brand />
        <h1 className="greeting">Bienvenido</h1>
        <p className="subtle">{theme.tagline}</p>

        <div className="card">
            <input className="field" type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="field" type="password" placeholder="Contraseña"
            value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn" onClick={handleLogin} disabled={cargando}>
            {cargando ? 'Entrando…' : 'Entrar'}
            </button>
            {error && <p className="error">{error}</p>}
        </div>
        <p className="subtle" style={{ textAlign: 'center', marginTop: 16 }}>
        ¿No tienes cuenta?{' '}
        <button className="link-btn" onClick={onIrARegistro} style={{ color: 'var(--brand)' }}>
            Crear cuenta
        </button>
        </p>
        </div>
    );
}