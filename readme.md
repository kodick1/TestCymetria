# Cymetria · Gestión de usuarios

Aplicación full-stack para consultar y administrar usuarios. El backend está construido con Node.js, Express, TypeScript, Sequelize y PostgreSQL. El frontend usa React, TypeScript, React Query, Zustand y Tailwind CSS.

## Requisitos

- Node.js 20.19 o posterior y npm.
- PostgreSQL accesible desde el backend.
- Una base de datos PostgreSQL ya creada, por defecto `dev_test`.

## Instalación y configuración

Instala las dependencias desde la raíz del repositorio:

```sh
npm install
npm --prefix frontend install
```

Crea o configura `.env.development` en la raíz del proyecto:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=dev_test
```

La base de datos debe existir antes de iniciar la API. El backend sincroniza el modelo `users` al arrancar; el usuario de PostgreSQL necesita permisos para crear y modificar tablas.

## Ejecutar en desarrollo

Abre dos terminales desde la raíz:

```sh
npm run dev
```

```sh
npm run frontend:dev
```

Vite muestra la dirección local, normalmente `http://localhost:5173`. Durante el desarrollo, Vite reenvía las solicitudes `/api` al backend en `http://localhost:3000`.

## Compilar y probar

```sh
npm run build
npm run frontend:build
npm test
```

`npm test` compila el backend y ejecuta las pruebas con el runner integrado `node:test`. Las pruebas son unitarias y no requieren una instancia de PostgreSQL.

## Funcionalidades del frontend

- Listado paginado con búsqueda por nombre o correo y selección del tamaño de página.
- Creación, edición y eliminación de usuarios.
- Exportación de todos los resultados coincidentes a CSV, sin limitarse a la página visible.
- Estados de carga, error y lista vacía, además de validación y confirmación para acciones destructivas.

React Query administra las consultas y mutaciones del servidor. Zustand conserva el estado compartido de búsqueda y paginación de la vista.

## API

Todas las rutas usan el prefijo `/api/v1/users`.

| Método y ruta | Descripción | Respuesta principal |
| --- | --- | --- |
| `GET /api/v1/users?page=1&pageSize=10&search=` | Lista usuarios paginados; búsqueda opcional | `{ "data": [], "page": 1, "pageSize": 10, "total": 0, "totalPages": 0 }` |
| `GET /api/v1/users/:id` | Consulta un usuario por UUID | `{ "data": { "id": "…", "name": "…", "email": "…" } }` |
| `POST /api/v1/users` | Crea un usuario | HTTP 201 y el usuario dentro de `data` |
| `PATCH /api/v1/users/:id` | Actualiza nombre o correo | El usuario actualizado dentro de `data` |
| `DELETE /api/v1/users/:id` | Elimina un usuario | HTTP 204; HTTP 404 si no existe |
| `GET /api/v1/users/export.csv?search=` | Exporta todos los usuarios o los que coinciden con la búsqueda | Archivo CSV compatible con Excel |

El cuerpo de creación y actualización acepta JSON con `name` y `email`, por ejemplo:

```json
{
  "name": "Ana García",
  "email": "ana@example.com"
}
```

La paginación admite `pageSize` entre 1 y 100. Las respuestas de error tienen un objeto `error.message`; los UUID inválidos devuelven HTTP 400.

## Decisiones técnicas

- El puerto `UserRepository` define las operaciones que requiere la aplicación; `UserRepositorySequelize` las implementa con Sequelize y PostgreSQL. El controller HTTP valida y presenta las respuestas, y `UserService` coordina las reglas del caso de uso.
- La consulta paginada se ejecuta en PostgreSQL, no sobre todos los usuarios en memoria. El orden por fecha de creación se desempata por UUID para que el orden de página sea estable.
- La exportación se entrega como CSV con BOM para que las hojas de cálculo reconozcan correctamente el archivo y los acentos. El servidor obtiene grupos de 500 registros usando paginación por cursor UUID, en vez de cargar toda la tabla o recorrerla con offsets crecientes.
- Cada grupo se escribe directamente en la respuesta HTTP. Cuando el cliente no consume los datos con suficiente rapidez, el servidor espera el evento `drain` antes de continuar. Esto mantiene acotado el uso de memoria y permite que el event loop atienda otras solicitudes entre consultas y escrituras. Los valores que podrían interpretarse como fórmulas se neutralizan al exportarlos.
- Las pruebas sustituyen el puerto de persistencia para probar el servicio y simulan métodos del modelo Sequelize para comprobar el adaptador sin conectarse a una base de datos.

## Pruebas unitarias actuales

- `tests/user.service.test.cjs`: normalización del correo al crear y rechazo de correos duplicados.
- `tests/user.repository.test.cjs`: paginación, orden determinístico, mapeo al dominio y consulta de exportación por cursor.
