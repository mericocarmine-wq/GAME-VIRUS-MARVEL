import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Carta = { id: string; nombre: string; tipo: string };
type Jugador = {
  id: string;
  nombre: string;
  mano?: Carta[];
  cartasEnMano: number;
  heroes: { id: string; nombre: string; estado: string }[];
};
type Estado = { turnoDe: string; ganador: string | null; descarte: number; jugadores: Jugador[] };

export function App() {
  const [token, setToken] = useState(localStorage.getItem('token') ?? '');
  const [usuarioId, setUsuarioId] = useState(localStorage.getItem('usuarioId') ?? '');
  const [nombre, setNombre] = useState(localStorage.getItem('nombreUsuario') ?? '');
  const [contrasena, setContrasena] = useState('');
  const [rival, setRival] = useState('Rival');
  const [partidaId, setPartidaId] = useState('');
  const [estado, setEstado] = useState<Estado | null>(null);
  const [error, setError] = useState('');
  const [seleccionada, setSeleccionada] = useState<Carta | null>(null);
  const [historial, setHistorial] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!partidaId || !token) return;
    const protocolo = location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(
      `${protocolo}://${location.host}/partidas/${partidaId}/eventos?token=${encodeURIComponent(token)}`,
    );
    socket.onmessage = ({ data }) => setEstado(JSON.parse(data).partida);
    return () => socket.close();
  }, [partidaId, token]);

  useEffect(() => {
    const maquinaId = localStorage.getItem('maquinaId');
    if (!maquinaId || !estado || estado.turnoDe !== maquinaId) return;
    const temporizador = window.setTimeout(() => {
      void turnoMaquina();
    }, 500);
    return () => window.clearTimeout(temporizador);
  }, [estado?.turnoDe, turnoMaquina, estado]);

  async function autenticar(ruta: 'registro' | 'login') {
    setError('');
    setCargando(true);
    try {
      const respuesta = await fetch(`/auth/${ruta}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nombre, contrasena }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) return setError(datos.error ?? 'No se pudo autenticar');
      setToken(datos.token);
      setUsuarioId(datos.id);
      localStorage.setItem('token', datos.token);
      localStorage.setItem('usuarioId', datos.id);
      localStorage.setItem('nombreUsuario', nombre);
    } catch {
      setError('No se puede conectar con el backend. Ejecuta npm run dev en otra terminal.');
    } finally {
      setCargando(false);
    }
  }
  async function crearPartida() {
    const respuesta = await fetch('/partidas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jugadores: [
          { id: usuarioId, nombre },
          { id: crypto.randomUUID(), nombre: rival },
        ],
      }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) return setError(datos.error);
    localStorage.removeItem('maquinaId');
    setPartidaId(datos.id);
    await cargarPartida(datos.id);
  }
  async function crearPartidaLocal() {
    const maquinaId = `maquina-${crypto.randomUUID()}`;
    const respuesta = await fetch('/partidas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jugadores: [
          { id: usuarioId, nombre },
          { id: maquinaId, nombre: 'Máquina' },
        ],
      }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) return setError(datos.error);
    setPartidaId(datos.id);
    localStorage.setItem('maquinaId', maquinaId);
    await cargarPartida(datos.id);
  }
  async function cargarPartida(id = partidaId) {
    const respuesta = await fetch(`/partidas/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) return setError(datos.error);
    setEstado(datos);
  }
  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('nombreUsuario');
    setToken('');
    setUsuarioId('');
    setNombre('');
    setEstado(null);
  }
  async function turnoMaquina() {
    const maquinaId = localStorage.getItem('maquinaId');
    if (!maquinaId) return;
    const respuesta = await fetch(`/partidas/${partidaId}/maquina/turno`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ jugadorMaquinaId: maquinaId }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) setError(datos.error);
    else {
      setEstado(datos);
      setHistorial((actual) => ['La máquina descartó una carta.', ...actual].slice(0, 5));
    }
  }
  async function ejecutar(tipo: string, cartaId: string, extras: Record<string, string> = {}) {
    if (!estado) return;
    const cuerpo =
      tipo === 'descartar'
        ? { jugadorId: usuarioId, tipo, cartaId, cartaIds: [cartaId] }
        : { jugadorId: usuarioId, tipo, cartaId, ...extras };
    const respuesta = await fetch(`/partidas/${partidaId}/jugadas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(cuerpo),
    });
    if (!respuesta.ok) setError((await respuesta.json()).error);
    else {
      setSeleccionada(null);
      setHistorial((actual) => [`Jugaste ${tipo}.`, ...actual].slice(0, 5));
      await cargarPartida();
    }
  }
  if (!token)
    return (
      <main className="auth">
        <h1>Virus! Marvel</h1>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input
          type="password"
          placeholder="Contraseña (8 caracteres)"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
        <div>
          <button disabled={cargando} onClick={() => autenticar('registro')}>
            Registrarme
          </button>
          <button disabled={cargando} onClick={() => autenticar('login')}>
            Entrar
          </button>
        </div>
        {cargando && <p>Conectando…</p>}
        {error && <p className="error">{error}</p>}
      </main>
    );
  if (!estado)
    return (
      <main className="auth">
        <h1>Crear partida</h1>
        <p>Jugando como: {nombre || 'usuario sin nombre'}</p>
        <input
          value={rival}
          onChange={(e) => setRival(e.target.value)}
          placeholder="Nombre del rival"
        />
        <button onClick={crearPartida}>Nueva partida</button>
        <button onClick={crearPartidaLocal}>Jugar contra máquina</button>
        <button onClick={cerrarSesion}>Cerrar sesión</button>
        {error && <p className="error">{error}</p>}
      </main>
    );
  const miTurno = estado.turnoDe === usuarioId;
  const propio = estado.jugadores.find((j) => j.id === usuarioId);
  const instruccion = !miTurno
    ? 'Espera a tu rival.'
    : !seleccionada
      ? 'Selecciona una carta de tu mano.'
      : seleccionada.tipo === 'heroe'
        ? 'Pulsa “Jugar héroe”.'
        : seleccionada.tipo === 'villano'
          ? 'Elige un héroe rival.'
          : seleccionada.tipo === 'poder' || seleccionada.tipo === 'aliado'
            ? 'Elige uno de tus héroes para protegerlo.'
            : 'Esta acción aún se juega desde la API.';
  return (
    <main className="mesa">
      <header className="marcador">
        <span className="puntos azul">
          {propio?.heroes.filter((h) => h.estado !== 'bloqueado').length ?? 0}
          <small>Tu equipo</small>
        </span>
        <div className="estandarte">
          <span aria-hidden="true">★</span>
          <h1>
            VIRUS!<small>MARVEL</small>
          </h1>
        </div>
        <span className="puntos coral">
          {estado.jugadores
            .filter((j) => j.id !== usuarioId)
            .reduce((n, j) => n + j.heroes.filter((h) => h.estado !== 'bloqueado').length, 0)}
          <small>Rivales</small>
        </span>
      </header>
      <div className="indicadores">
        <span>{miTurno ? '↓ Tu turno' : '↑ Turno rival'}</span>
        <span>▧ {estado.descarte} descartes</span>
        <span>★ Objetivo: 4</span>
      </div>
      <section className="equipos" aria-label="Equipos en la mesa">
        {[...estado.jugadores]
          .sort((a, b) => Number(a.id === usuarioId) - Number(b.id === usuarioId))
          .map((jugador) => (
            <article key={jugador.id} className={jugador.id === usuarioId ? 'propio' : 'rival'}>
              <h2>{jugador.nombre}</h2>
              {jugador.id !== usuarioId && (
                <div className="reversos" aria-label={`${jugador.cartasEnMano} cartas ocultas`}>
                  {Array.from({ length: jugador.cartasEnMano }, (_, i) => (
                    <span key={i} aria-hidden="true">
                      ◆
                    </span>
                  ))}
                </div>
              )}
              <div className="heroes">
                {jugador.heroes.map((heroe) => (
                  <button
                    key={heroe.id}
                    disabled={!miTurno || !seleccionada}
                    onClick={() =>
                      seleccionada &&
                      (seleccionada.tipo === 'villano' && jugador.id !== usuarioId
                        ? ejecutar('villano', seleccionada.id, {
                            jugadorObjetivoId: jugador.id,
                            heroeId: heroe.id,
                          })
                        : (seleccionada.tipo === 'poder' || seleccionada.tipo === 'aliado') &&
                            jugador.id === usuarioId
                          ? ejecutar('proteger', seleccionada.id, { heroeId: heroe.id })
                          : undefined)
                    }
                  >
                    <span aria-hidden="true">★</span>
                    {heroe.nombre}
                    <small>{heroe.estado}</small>
                  </button>
                ))}
                {!jugador.heroes.length && (
                  <p className="zona-vacia">Tu equipo empieza aquí · 0 / 4 héroes</p>
                )}
              </div>
            </article>
          ))}
      </section>
      <p className="ayuda" aria-live="polite">
        {estado.ganador ? '¡Partida terminada!' : instruccion}
      </p>
      <section className="mano" aria-label="Tu mano">
        <h2>
          Tus cartas <small>Elige tu próxima jugada</small>
        </h2>
        <div className="cartas">
          {propio?.mano?.map((carta) => (
            <button
              className={`carta carta-${carta.tipo}${seleccionada?.id === carta.id ? ' seleccionada' : ''}`}
              aria-pressed={seleccionada?.id === carta.id}
              key={carta.id}
              disabled={!miTurno}
              onClick={() => setSeleccionada(carta)}
            >
              <small>{carta.tipo}</small>
              <span className="simbolo" aria-hidden="true">
                {
                  (
                    { heroe: '★', poder: 'ϟ', aliado: '✦', villano: '✹', accion: '↔' } as Record<
                      string,
                      string
                    >
                  )[carta.tipo]
                }
              </span>
              <strong>{carta.nombre}</strong>
            </button>
          ))}
        </div>
      </section>
      <footer className="madera">
        <div className="acciones">
          {seleccionada ? (
            <>
              <button onClick={() => ejecutar('descartar', seleccionada.id)}>Descartar</button>
              {seleccionada.tipo === 'heroe' && (
                <button className="principal" onClick={() => ejecutar('heroe', seleccionada.id)}>
                  Jugar héroe
                </button>
              )}
              <button onClick={() => setSeleccionada(null)}>Cancelar</button>
            </>
          ) : (
            <p>Selecciona una carta para ver sus acciones</p>
          )}
        </div>
        <details className="historial">
          <summary>☷ Últimas jugadas</summary>
          {historial.length ? (
            historial.map((evento, i) => <p key={i}>{evento}</p>)
          ) : (
            <p>Aún no hay jugadas.</p>
          )}
        </details>
      </footer>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
const raiz = document.getElementById('root');
if (raiz) createRoot(raiz).render(<App />);
