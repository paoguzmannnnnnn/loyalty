import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type Props = {
    onLeido: (texto: string) => void;
    onCerrar: () => void;
    };

    export function Scanner({ onLeido, onCerrar }: Props) {
    const contenedorId = 'qr-reader';
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const yaInicio = useRef(false); // candado: evita el doble arranque
    const yaLeyo = useRef(false);   // candado: procesar solo la 1ra lectura

    useEffect(() => {
        if (yaInicio.current) return; // si ya arrancó, no arranca de nuevo
        yaInicio.current = true;

        const scanner = new Html5Qrcode(contenedorId);
        scannerRef.current = scanner;

        scanner
        .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (texto) => {
            if (yaLeyo.current) return; // ignora lecturas repetidas
            yaLeyo.current = true;
            detener().then(() => onLeido(texto));
            },
            () => {},
        )
        .catch((err) => console.error('Error al abrir la cámara:', err));

        async function detener() {
        const s = scannerRef.current;
        if (s?.isScanning) {
            await s.stop().catch(() => {});
        }
        }

        return () => {
        detener();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="scanner-overlay">
        <div className="scanner-box">
            <div id={contenedorId} style={{ width: '100%' }} />
            <button className="btn btn--ghost" onClick={onCerrar} style={{ marginTop: 12 }}>
            Cancelar
            </button>
        </div>
        </div>
    );
}