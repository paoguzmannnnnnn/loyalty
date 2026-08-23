import { type User } from './api';

const CLAVE = 'loyalty_session';

type Sesion = { token: string; user: User };

// guardar al iniciar sesión
export function guardarSesion(token: string, user: User) {
    localStorage.setItem(CLAVE, JSON.stringify({ token, user }));
}

// leer al abrir la app (null si no hay o está corrupta)
export function leerSesion(): Sesion | null {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return null;
    try {
    return JSON.parse(raw) as Sesion;
    } catch {
    return null;
    }
}

// borrar al salir
export function borrarSesion() {
    localStorage.removeItem(CLAVE);
}