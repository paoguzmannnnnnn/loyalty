const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type User = { id: string; name: string; email: string; role: string };

export type Membership = {
    id: string;
    stampBalance: number;
    rewardsAvailable: number;
    business: { name: string; stampsRequired: number };
};

export type Estado = {
    stampBalance: number;
    stampsRequired: number;
    rewardsAvailable: number;
    rewardEarned?: boolean;
};

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Credenciales inválidas');
    return res.json() as Promise<{ accessToken: string; user: User }>;
}

export async function registro(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'customer' }),
    });
    if (!res.ok) {
        const data = await res.json();
        const m = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(m);
    }
    return res.json() as Promise<{ accessToken: string; user: User }>;
}

export async function getMisTarjetas(token: string) {
    const res = await fetch(`${API_URL}/memberships/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('No se pudieron cargar las tarjetas');
    return res.json() as Promise<Membership[]>;
}

export async function unirse(token: string, businessId: string) {
    const res = await fetch(`${API_URL}/memberships/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ businessId }),
    });
    if (!res.ok) {
        const data = await res.json();
        const m = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(m);
    }
    return res.json() as Promise<Membership>;
}

// helper para leer el error venga como texto o como arreglo
async function parseError(res: Response) {
    const data = await res.json();
    const m = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    return { data, m };
}

export async function getEstado(token: string, membershipId: string) {
    const res = await fetch(`${API_URL}/stamps/status/${membershipId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error((await parseError(res)).m);
    return res.json() as Promise<Estado>;
}

export async function picarSello(token: string, membershipId: string) {
    const res = await fetch(`${API_URL}/stamps/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ membershipId, idempotencyKey: crypto.randomUUID() }),
    });
    if (!res.ok) throw new Error((await parseError(res)).m);
    return res.json() as Promise<Estado>;
}

export async function canjearRecompensa(token: string, membershipId: string) {
    const res = await fetch(`${API_URL}/stamps/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ membershipId }),
    });
    if (!res.ok) throw new Error((await parseError(res)).m);
    return res.json() as Promise<Estado>;
}

export type AuditEntry = {
    id: string;
    action: 'stamp_issued' | 'reward_redeemed' | 'stamp_reverted';
    actor: string;
    cliente: string;
    membershipId: string | null;
    transactionId: string | null;
    reverted: boolean;
    createdAt: string;
};

export async function getAuditoria(
    token: string,
    filtros: { action?: string; membershipId?: string } = {},
    ) {
    const params = new URLSearchParams();
    if (filtros.action) params.set('action', filtros.action);
    if (filtros.membershipId) params.set('membershipId', filtros.membershipId);

    const res = await fetch(`${API_URL}/stamps/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('No se pudo cargar el historial');
    return res.json() as Promise<AuditEntry[]>;
}

export async function revertirSello(token: string, transactionId: string) {
    const res = await fetch(`${API_URL}/stamps/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transactionId }),
    });
    if (!res.ok) {
        const data = await res.json();
        const m = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(m);
    }
    return res.json();
}
