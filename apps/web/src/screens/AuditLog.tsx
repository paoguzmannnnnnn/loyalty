import { useEffect, useMemo, useState } from 'react';
import { getAuditoria, revertirSello, type AuditEntry } from '../api';

type Props = { token: string; onRevertido?: () => void };

const ETIQUETA: Record<string, string> = {
    stamp_issued: '🎫 Sello',
    reward_redeemed: '🎁 Canje',
    };

    export function AuditLog({ token, onRevertido }: Props) {
    const [entradas, setEntradas] = useState<AuditEntry[]>([]);
    const [accion, setAccion] = useState<'' | 'stamp_issued' | 'reward_redeemed'>('');
    const [busqueda, setBusqueda] = useState('');
    const [msg, setMsg] = useState('');
    const [revirtiendo, setRevirtiendo] = useState<string | null>(null); // candado
    
    function fechaLocal(iso: string) {
    // aseguramos que se interprete como UTC y se muestre en hora local
        const fecha = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
        return fecha.toLocaleString();
}
    function cargar() {
        return getAuditoria(token).then(setEntradas).catch(() => setEntradas([]));
    }

    useEffect(() => { cargar(); }, [token]);

    async function handleRevertir(transactionId: string) {
        if (revirtiendo) return; // ya hay uno en curso → no dejar tocar
        setRevirtiendo(transactionId);
        setMsg('');
        try {
        await revertirSello(token, transactionId);
        await cargar();       // esperamos a que la tabla se actualice
        onRevertido?.();      // avisamos al panel para refrescar el balance
        setMsg('Sello revertido ');
        } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : 'no se pudo revertir'}`);
        } finally {
        setRevirtiendo(null);
        }
    }

    // ocultamos las filas de reversión: el estado ya se ve en cada sello
    const filtradas = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        return entradas
        .filter((e) => e.action !== 'stamp_reverted')
        .filter((e) => {
            if (accion && e.action !== accion) return false;
            if (!q) return true;
            return (
            e.cliente.toLowerCase().includes(q) ||
            e.actor.toLowerCase().includes(q) ||
            (e.membershipId ?? '').toLowerCase().includes(q)
            );
        });
    }, [entradas, accion, busqueda]);

    return (
        <div className="card">
        <div className="topbar" style={{ marginBottom: 12 }}>
            <h2 className="card__title" style={{ margin: 0 }}>Historial</h2>
            <button className="link-btn" onClick={cargar}>↻ Actualizar</button>
        </div>

        <input
            className="field"
            placeholder="Buscar por cliente, admin o ID…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="btn-row" style={{ marginTop: 0, marginBottom: 8 }}>
            <button className={accion === '' ? 'btn' : 'btn btn--ghost'} onClick={() => setAccion('')}>Todos</button>
            <button className={accion === 'stamp_issued' ? 'btn' : 'btn btn--ghost'} onClick={() => setAccion('stamp_issued')}>Sellos</button>
            <button className={accion === 'reward_redeemed' ? 'btn' : 'btn btn--ghost'} onClick={() => setAccion('reward_redeemed')}>Canjes</button>
        </div>

        {msg && <p className="msg">{msg}</p>}

        {filtradas.length === 0 && <p className="subtle" style={{ marginTop: 12 }}>Sin registros.</p>}

        {filtradas.map((e) => (
            <div key={e.id} className="audit-row">
            <div style={{ minWidth: 0 }}>
                <p className="audit-action">{ETIQUETA[e.action] ?? e.action}</p>
                <p className="subtle" style={{ fontSize: 13 }}>{e.cliente}</p>
                <p className="subtle" style={{ fontSize: 12 }}>
                {e.actor} · {fechaLocal(e.createdAt)}
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                {e.action === 'stamp_issued' && (
                <span className={`chip ${e.reverted ? 'chip--reverted' : 'chip--ok'}`}>
                    {e.reverted ? 'Revertido' : 'Activo'}
                </span>
                )}
                {e.action === 'stamp_issued' && !e.reverted && e.transactionId && (
                <button
                    className="link-btn"
                    disabled={revirtiendo !== null}
                    onClick={() => handleRevertir(e.transactionId!)}
                >
                    {revirtiendo === e.transactionId ? 'Revirtiendo…' : 'Revertir'}
                </button>
                )}
            </div>
            </div>
        ))}
        </div>
    );
}