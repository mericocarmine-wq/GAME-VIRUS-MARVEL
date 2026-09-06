# GAME-VIRUS-MARVEL

Modelo de dominio en TypeScript para un juego de cartas inspirado en Virus y Marvel.

## Desarrollo

```bash
npm install
npm test
npm run typecheck
```

La fase actual incluye las cartas, compatibilidad de colores, héroes en juego,
protección, bloqueo, combate, captura y la condición de victoria de la zona de juego.
Las reglas están contrastadas con el reglamento oficial de Virus! Marvel.

La capa de aplicación incorpora partidas de 2 a 5 personas, reparto, manos,
mazo, reciclaje del descarte y el ciclo completo de cada turno.

## Persistencia local

La configuración de PostgreSQL está en `prisma/schema.prisma`. Copia
`.env.example` a `.env`, configura `DATABASE_URL` y ejecuta:

```bash
npm run prisma:generate
npm run prisma:migrate
```
