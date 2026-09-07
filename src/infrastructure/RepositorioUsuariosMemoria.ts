import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export interface Usuario {
  id: string;
  nombre: string;
  hashContrasena: string;
}
export class RepositorioUsuariosMemoria {
  private readonly usuarios = new Map<string, Usuario>();
  crear(nombre: string, contrasena: string): Usuario {
    if (!nombre.trim() || contrasena.length < 8)
      throw new Error('Nombre y contraseña de al menos 8 caracteres son obligatorios');
    if ([...this.usuarios.values()].some((usuario) => usuario.nombre === nombre))
      throw new Error('El usuario ya existe');
    const sal = randomBytes(16).toString('hex');
    const hashContrasena = `${sal}:${scryptSync(contrasena, sal, 64).toString('hex')}`;
    const usuario = { id: crypto.randomUUID(), nombre, hashContrasena };
    this.usuarios.set(usuario.id, usuario);
    return usuario;
  }
  autenticar(nombre: string, contrasena: string): Usuario | undefined {
    const usuario = [...this.usuarios.values()].find((actual) => actual.nombre === nombre);
    if (!usuario) return undefined;
    const [sal, hash] = usuario.hashContrasena.split(':');
    const esperado = Buffer.from(hash, 'hex');
    const recibido = scryptSync(contrasena, sal, 64);
    return esperado.length === recibido.length && timingSafeEqual(esperado, recibido)
      ? usuario
      : undefined;
  }
}
