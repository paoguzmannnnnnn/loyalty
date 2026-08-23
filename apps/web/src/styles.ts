import { type CSSProperties } from 'react';

export const estilos: Record<string, CSSProperties> = {
    contenedor: {
        maxWidth: 420, margin: '60px auto', fontFamily: 'system-ui, sans-serif',
        display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    input: { padding: 10, fontSize: 16 },
    boton: { padding: 10, fontSize: 16, cursor: 'pointer' },
    botonSalir: {
        padding: '6px 12px', fontSize: 14, cursor: 'pointer',
        background: 'none', border: '1px solid #ccc', borderRadius: 6,
    },
    tarjeta: {
        border: '1px solid #e5e7eb', borderRadius: 12, padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    reward: {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    color: '#92400e',
    borderRadius: 8,
    padding: '8px 12px',
    fontWeight: 'bold',
    },
    sellos: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 },
    sello: {
        aspectRatio: '1', borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold',
    },
};