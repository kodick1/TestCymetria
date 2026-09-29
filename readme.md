# Cymetria · Gestión de usuarios

Aplicación web para administrar usuarios. El backend usa Express, TypeScript, Sequelize y PostgreSQL; el frontend usa React, TypeScript, React Query, Zustand y Tailwind CSS.

## Requisitos

- Node.js 20.19 o posterior y npm.
- PostgreSQL accesible y una base llamada `dev_test` (o la indicada en el archivo de entorno).

## Configuración y arranque

1. Instala las dependencias del backend y frontend:

   ```sh
   npm install
   npm --prefix frontend install
   ```

2. Configura `.env.development` en la raíz:

   ```dotenv
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   DB_NAME=dev_test
   ```

3. Abre dos terminales desde la raíz. Inicia el backend con `npm run dev` y el frontend con `npm run frontend:dev`.
   Abre la dirección que muestra Vite (normalmente `http://localhost:5173`). Vite reenvía `/api` al backend en el puerto 3000.

Para compilar, ejecuta `npm run build` para el backend y `npm run frontend:build` para el frontend. Ejecuta las pruebas unitarias con `npm test`.

## Funcionalidades

- Listado paginado, búsqueda por nombre o correo y selección del tamaño de página.
- Crear, editar y eliminar usuarios, con validación y confirmación antes de borrar.
- Exportar todos los resultados coincidentes como CSV, independientemente de la página actual.
- Estados de carga, error y lista vacía.

## API de usuarios

- `GET /api/v1/users?page=1&pageSize=10&search=` devuelve `data`, `page`, `pageSize`, `total` y `totalPages`.
- `GET /api/v1/users/:id` devuelve el usuario dentro de `data`.
- `POST /api/v1/users` crea un usuario con `name` y `email`.
- `PATCH /api/v1/users/:id` actualiza nombre y correo.
- `DELETE /api/v1/users/:id` elimina un usuario.
- `GET /api/v1/users/export.csv?search=` descarga el directorio completo o los resultados de búsqueda como CSV compatible con Excel.

El backend sincroniza el modelo `users` al iniciar. La base `dev_test` debe existir y el usuario de PostgreSQL debe tener permisos para crear y modificar tablas.

## Decisiones técnicas

- El listado pagina en base de datos y desempata por ID para que el orden sea estable entre páginas.
- La exportación usa CSV con BOM para facilitar la apertura en Excel. Consulta bloques de 500 registros ordenados por UUID, escribe cada bloque en la respuesta y espera el evento `drain` cuando el cliente consume más lento. Esto limita la memoria y permite que el event loop atienda otras solicitudes durante las consultas y la escritura.
- Las pruebas usan `node:test`: validan normalización y duplicados en el servicio, y paginación/mapeo del adaptador con el método del modelo Sequelize simulado; no requieren PostgreSQL.
