import { useState } from 'react';
import { registro, type User } from '../api';
import { Brand } from '../Brand';

type Props = {
    onRegistrado: (token: string, user: User) => void;
    onIrALogin: () => void;
};

export function RegisterScreen({ onRegistrado, onIrALogin }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    async function handleRegistro() {
        setCargando(true);
        setError('');
        try {
        const data = await registro(name, email, password);
        onRegistrado(data.accessToken, data.user);
        } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo registrar');
        } finally {
        setCargando(false);
        }
    }

    return (
        <div className="app app--center">
        <Brand />
        <h1 className="greeting">Crear cuenta</h1>
        <p className="subtle">Regístrate para empezar a juntar sellos</p>

        <div className="card">
            <input className="field" placeholder="Nombre"
            value={name} onChange={(e) => setName(e.target.value)} />
            <input className="field" type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="field" type="password" placeholder="Contraseña (mín. 8)"
            value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn" onClick={handleRegistro} disabled={cargando}>
            {cargando ? 'Creando…' : 'Crear cuenta'}
            </button>
            {error && <p className="error">{error}</p>}
        </div>

        <p className="subtle" style={{ textAlign: 'center', marginTop: 16 }}>
            ¿Ya tienes cuenta?{' '}
            <button className="link-btn" onClick={onIrALogin} style={{ color: 'var(--brand)' }}>
            Inicia sesión
            </button>
        </p>
        </div>
    );
}