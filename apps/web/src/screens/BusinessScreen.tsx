import { useState } from 'react';
import { getEstado, picarSello, canjearRecompensa, type Estado } from '../api';
import { Brand } from '../Brand';
import { Scanner } from '../Scanner';
import { AuditLog } from './AuditLog';

type Props = { token: string; onSalir: () => void };

export function BusinessScreen({ token, onSalir }: Props) {
    const [tarjetaInput, setTarjetaInput] = useState('');
    const [estado, setEstado] = useState<Estado | null>(null);
    const [msg, setMsg] = useState('');
    const [escaneando, setEscaneando] = useState(false);
    const [verHistorial, setVerHistorial] = useState(false);

    const id = tarjetaInput.trim();

    async function correr(accion: () => Promise<Estado>, exito: (e: Estado) => string) {
        setMsg('');
        try {
        const data = await accion();
        setEstado(data);
        setMsg(exito(data));
        } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : 'algo salió mal'}`);
        }
    }

    // cuando el escáner lee un QR
    function onLeido(texto: string) {
        setTarjetaInput(texto.trim());
        setEscaneando(false);
        // consultamos el estado automáticamente con el ID escaneado
        correr(() => getEstado(token, texto.trim()), () => 'Tarjeta escaneada ✅');
    }

    function recargarEstado() {
    if (id) {
        correr(() => getEstado(token, id), () => 'Estado actualizado');
    }
    }

    function limpiar() {
    setTarjetaInput('');
    setEstado(null);
    setMsg('');
    }

    return (
        <div className="app">
        <div className="topbar">
            <Brand />
            <button className="link-btn" onClick={onSalir}>Salir</button>
        </div>

        <h1 className="greeting">Panel</h1>
        <p className="subtle">Escanea el QR del cliente o pega su ID</p>

        <div className="card">
            <button className="btn" onClick={() => setEscaneando(true)} style={{ marginBottom: 12 }}>
            Escanear QR
            </button>

            <input className="field" placeholder="…o pega el ID de la tarjeta"
            value={tarjetaInput} onChange={(e) => setTarjetaInput(e.target.value)} />
            <button className="btn btn--ghost" disabled={!id}
            onClick={() => correr(() => getEstado(token, id), () => 'Estado cargado')}>
            Ver estado
            </button>
        </div>

        {estado && (
            <div className="card">
            <p className="card__meta" style={{ fontSize: 16, marginBottom: 12 }}>
                Balance: <strong style={{ color: 'var(--ink)' }}>{estado.stampBalance}</strong> de {estado.stampsRequired}
            </p>

            {estado.rewardsAvailable > 0 && (
                <div className="reward">
                🎁 {estado.rewardsAvailable} recompensa{estado.rewardsAvailable > 1 ? 's' : ''} sin canjear
                </div>
            )}

            <div className="btn-row">
                <button className="btn"
                onClick={() => correr(() => picarSello(token, id),
                    (e) => (e.rewardEarned ? '🎉 ¡Tarjeta completa! Recompensa bancada.' : 'Sello agregado ✅'))}>
                Picar sello
                </button>
                <button className="btn btn--ghost" disabled={estado.rewardsAvailable <= 0}
                onClick={() => correr(() => canjearRecompensa(token, id), () => 'Recompensa canjeada ✅')}>
                Canjear
                </button>
            </div>
            <button className="link-btn" onClick={limpiar} style={{ marginTop: 12 }}>
            ← Buscar otro cliente
            </button>
            </div>
        )}

        {msg && <p className="msg">{msg}</p>}

        <button className="btn btn--ghost" onClick={() => setVerHistorial((v) => !v)} style={{ marginTop: 16 }}>
        {verHistorial ? 'Ocultar historial' : '📋 Ver historial'}
        </button>

        {verHistorial && <AuditLog token={token} onRevertido={recargarEstado} />}

        {escaneando && <Scanner onLeido={onLeido} onCerrar={() => setEscaneando(false)} />}
        </div>
    );
}