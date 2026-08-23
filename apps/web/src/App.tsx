import { useState } from 'react';
import { type User } from './api';
import { guardarSesion, leerSesion, borrarSesion } from './session';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { CustomerScreen } from './screens/CustomerScreen';
import { BusinessScreen } from './screens/BusinessScreen';

function App() {
  // al abrir la app, intentamos recuperar la sesión guardada
  const sesionGuardada = leerSesion();
  const [token, setToken] = useState(sesionGuardada?.token ?? '');
  const [user, setUser] = useState<User | null>(sesionGuardada?.user ?? null);
  const [vista, setVista] = useState<'login' | 'registro'>('login');

  function handleLogin(tk: string, u: User) {
    setToken(tk);
    setUser(u);
    guardarSesion(tk, u); // persistimos
  }

  function salir() {
    setToken('');
    setUser(null);
    setVista('login');
    borrarSesion(); // limpiamos
  }

  if (!token || !user) {
    return vista === 'login' ? (
      <LoginScreen onLogin={handleLogin} onIrARegistro={() => setVista('registro')} />
    ) : (
      <RegisterScreen onRegistrado={handleLogin} onIrALogin={() => setVista('login')} />
    );
  }

  if (user.role === 'business') return <BusinessScreen token={token} onSalir={salir} />;
  return <CustomerScreen token={token} user={user} onSalir={salir} />;
}

export default App;