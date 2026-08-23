import { useCallback, useEffect, useState } from 'react';
import { getMisTarjetas, unirse, type Membership, type User } from '../api';
import { Brand } from '../Brand';
import { theme } from '../theme';
import { QRCodeSVG } from 'qrcode.react';

type Props = { token: string; user: User; onSalir: () => void };

export function CustomerScreen({ token, user, onSalir }: Props) {
    const [tarjetas, setTarjetas] = useState<Membership[]>([]);
    const [uniendo, setUniendo] = useState(false);
    const [error, setError] = useState('');

    const cargar = useCallback(() => {
        getMisTarjetas(token).then(setTarjetas).catch(() => setTarjetas([]));
    }, [token]);

    useEffect(() => {
        cargar(); // carga inmediata al abrir
        const intervalo = setInterval(cargar, 4000); // y cada 4 segundos
        return () => clearInterval(intervalo); // limpia al salir de la pantalla
    }, [cargar]);

    async function handleUnirse() {
        setUniendo(true);
        setError('');
        try {
        await unirse(token, theme.businessId);
        cargar(); // recargar para ver la tarjeta nueva
        } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo unir');
        } finally {
        setUniendo(false);
        }
    }

    return (
        <div className="app">
        <div className="topbar">
            <Brand />
            <button className="link-btn" onClick={onSalir}>Salir</button>
        </div>

        <h1 className="greeting">Hola, {user.name} 👋</h1>
        <p className="subtle">Estos son tus sellos</p>

        {tarjetas.length === 0 && (
            <div className="card">
            <h2 className="card__title">Empieza a juntar sellos</h2>
            <p className="card__meta">Únete a {theme.brandName} y consigue tu tarjeta.</p>
            <button className="btn" onClick={handleUnirse} disabled={uniendo}>
                {uniendo ? 'Uniéndote…' : `Unirme a ${theme.brandName}`}
            </button>
            {error && <p className="error">{error}</p>}
            </div>
        )}

        {tarjetas.map((t) => (
            <div className="card" key={t.id}>
            <h2 className="card__title">{t.business.name}</h2>
            <p className="card__meta">{t.stampBalance} de {t.business.stampsRequired} sellos</p>

            {t.rewardsAvailable > 0 && (
                <div className="reward">
                🎁 Tienes {t.rewardsAvailable} recompensa{t.rewardsAvailable > 1 ? 's' : ''} sin usar
                </div>
            )}

            <div className="stamps">
                {Array.from({ length: t.business.stampsRequired }).map((_, i) => (
                <div key={i} className={`stamp ${i < t.stampBalance ? 'stamp--filled' : 'stamp--empty'}`}>
                    {i < t.stampBalance ? theme.stamp : ''}
                </div>
                ))}
            </div>
            <div className="qr-box">
            <QRCodeSVG value={t.id} size={160} bgColor="#ffffff" fgColor="#0A0E1F" />
            <p className="subtle" style={{ marginTop: 10, fontSize: 13 }}>
                Muestra este código para sellar
            </p>
            <p style={{ marginTop: 6, fontSize: 11, color: '#0A0E1F', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {t.id}
            </p>
            </div>
            </div>
        ))}
        </div>
    );
}