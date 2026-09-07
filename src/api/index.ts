import { crearServidor } from './servidor';

const servidor = crearServidor();
servidor
  .listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
  .catch((error: unknown) => {
    servidor.log.error(error);
    process.exit(1);
  });
