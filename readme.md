# API Express + TypeScript

API REST organizada por capas, con Express, TypeScript, Sequelize y PostgreSQL.

## Requisitos

- Node.js (compatible con las versiones indicadas en `package-lock.json`).
- npm.
- Un servidor PostgreSQL accesible (la captura muestra PostgreSQL 18).

## Instalación y configuración

1. Instala las dependencias:

   ```sh
   npm install
   ```

2. Configura las variables de conexión en `.env.development` para desarrollo. En producción, configura `.env.production`.
   Puedes tomar `.env.example` como referencia:

   ```dotenv
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   DB_NAME=dev_test
   ```

   Crea previamente la base de datos indicada y asegúrate de que el usuario tenga permisos sobre ella.

## Ejecutar

- Desarrollo con recarga automática: `npm run dev`
- Compilar: `npm run build`
- Iniciar compilado en producción: `npm run start`
- Eliminar `dist`: `npm run clean`

El servidor usa el puerto `3000` por defecto. Puedes cambiarlo con la variable `PORT`.
La configuración de entorno se carga desde `.env.development` o `.env.production`, según el comando.

## Rutas disponibles

- `GET /api/v1/users`: lista usuarios.
- `POST /api/v1/users`: crea un usuario con un JSON como `{"name":"Ana","email":"ana@example.com"}`.

La API crea y sincroniza el modelo `users` al iniciar. La conexión requiere que PostgreSQL esté disponible y que el usuario tenga permisos sobre `dev_test`.
