# Process SA · Plataforma de procesos

SPA en React 19 + Vite que consume el backend NestJS/Prisma para gestionar usuarios, unidades, tareas y flujos operativos. Incluye branding propio (`src/assets/logo.svg`), navegación por roles y componentes de flujo con tareas por etapa.

## Índice rápido

- [Arquitectura y stack](#arquitectura-y-stack)
- [Variables de entorno](#variables-de-entorno)
- [Comandos útiles](#comandos-útiles)
- [Manual de integración (Render + Netlify)](#manual-de-integración-render--netlify)
- [Módulos principales](#módulos-principales)
- [Flujos y funcionalidades destacadas](#flujos-y-funcionalidades-destacadas)
- [Iconos del sidebar](#iconos-del-sidebar)
- [Seed y datos demo](#seed-y-datos-demo)
- [Notas de seguridad y buenas prácticas](#notas-de-seguridad-y-buenas-prácticas)

## Arquitectura y stack

- **Frontend:** React 19, React Router 7, TypeScript 5.9, Vite 7.
- **Backend:** NestJS 11, Prisma, PostgreSQL, JWT, guards por rol.
- **Estilos:** CSS base con gradientes, layout fijo (sidebar + topbar), toasts globales (`ToastProvider`).
- **Rutas y layout:** `src/App.tsx`, `src/routes/appRoutes.tsx`, `src/components/layout/Sidebar.tsx`, `AppLayout`.

## Variables de entorno

| Archivo            | Clave         | Descripción                                   | Ejemplo                                     |
| ------------------ | ------------- | --------------------------------------------- | ------------------------------------------- |
| `frontend/.env`    | `VITE_API_URL`| URL base del backend (incluye `/api`)         | `https://process-sa-back.onrender.com/api`  |
| `backend/.env`     | `DATABASE_URL`| Cadena PostgreSQL completa                    | `postgresql://user:pass@host/db?sslmode=require` |
| `backend/.env`     | `JWT_SECRET`  | Clave para firmar JWT                         | `super-secret-key`                          |
| `backend/.env`     | `PORT`        | Puerto de escucha del API                     | `4000`                                      |

## Comandos útiles

| Contexto  | Comando                | Descripción                                   |
| --------- | ---------------------- | --------------------------------------------- |
| Frontend  | `npm install`          | Instala dependencias                          |
| Frontend  | `npm run dev`          | Levanta Vite en modo desarrollo               |
| Frontend  | `npm run build`        | Genera build de producción                    |
| Backend   | `npm install`          | Instala dependencias                          |
| Backend   | `npx prisma migrate deploy` | Aplica migraciones en la BD                |
| Backend   | `npx prisma db seed`   | Carga datos demo (idempotente)                |
| Backend   | `npm run start:dev`    | Levanta NestJS en modo desarrollo             |

## Manual de integración (Render + Netlify)

1) **Backend en Render**
- Variables: `DATABASE_URL`, `JWT_SECRET`, `PORT` (opcional, 4000).
- Comando de build/deploy recomendado:  
  `npx prisma migrate deploy && npx prisma db seed && npm run start:prod`
- Endpoint público: `https://<tu-back>.onrender.com/api`

2) **Frontend en Netlify**
- Variables: `VITE_API_URL` apuntando al backend Render, e.g. `https://<tu-back>.onrender.com/api`.
- Build command: `npm run build`
- Publish directory: `dist`

3) **Pruebas rápidas**
- `GET /api/public/options` debe devolver roles/unidades.
- Login demo: `gabriela@processsa.com` / `Process123*`.
- En el front, asegúrate de que el sidebar y el topbar cargan datos (tokens enviados en `Authorization: Bearer ...`). 

## Módulos principales

- **Auth:** login/register con JWT, tokens almacenados en `localStorage` y toasts de feedback.
- **Dashboard (`OverviewPage`):** radar operativo, salud de flujos, semáforo de tareas y alertas.
- **Tareas:** panel personal, delegadas y alertas (`MyTasksPage`, `AssignedTasksPage`, `AlertsPage`).
- **Usuarios/Unidades:** ABM, asignación de rol y líder de unidad (`UsersPage`, `UnitsPage`).
- **Flujos (`FlowsPage`):** crear plantillas con etapas, añadir tareas por etapa al instanciar, buscar plantillas/instancias, eliminar con confirm modal.
- **Perfil:** actualización de datos personales y unidad.

## Flujos y funcionalidades destacadas

- **Contexto global (`AppContext`):** maneja sesión, catálogos, tareas, flujos y notificaciones. Expone helpers para CRUD de tareas, usuarios, unidades y flujos.
- **Tareas por etapa:** al instanciar un flujo puedes definir `stageTasks` para cada etapa; el backend genera tareas con owner según rol/owner asignado.
- **Toasts y modales:** `ToastProvider` muestra estados (éxito/error/info); `ConfirmModal` evita confirm nativo en eliminaciones.
- **Búsquedas rápidas:** filtros en biblioteca de flujos y ejecuciones.
- **Iconografía custom:** el sidebar usa SVG embebidos (ver `Sidebar.tsx`), no emojis.

## Iconos del sidebar

| Icono     | Clave   | Vista            |
| --------- | ------- | ---------------- |
| Profile   | `profile` | Mi perfil      |
| Overview  | `overview` | Visión global |
| Users     | `users` | Usuarios y roles |
| Units     | `units` | Unidades internas |
| Flows     | `flows` | Flujos y plantillas |
| Tasks     | `tasks` | Panel de tareas  |
| Assigned  | `assigned` | Tareas delegadas |
| Alerts    | `alerts` | Alertas y riesgos |
| Reports   | `reports` | Reportes globales |

Los SVG están definidos inline en `Sidebar.tsx` para evitar dependencias de icon packs.

## Seed y datos demo

Backend (`backend/prisma/seed.ts`) crea:
- Roles: ADMIN, DESIGNER, FUNCTIONARY (+ permisos).
- Unidades: Operaciones, Finanzas, Tecnología, Calidad (sin líder por defecto).
- Usuarios demo: Gabriela (Admin), Joaquín (Designer), María (Functionary), pass `Process123*`.
- Plantilla: “Onboarding Cliente” con etapas y tareas por etapa.
- Instancia: “Onboarding Cliente Kora” con stage statuses y tareas ligadas.

Idempotente: puedes correr `npx prisma db seed` varias veces sin duplicar roles/unidades/usuarios.

## Notas de seguridad y buenas prácticas

- JWT en `Authorization: Bearer <token>`; no exponer tokens en logs.
- CORS habilitado en backend; controla orígenes permitidos en despliegue productivo.
- Passwords cifradas con bcrypt; no reutilizar `JWT_SECRET` default en producción.
- Para evitar loops en frontend, mantén el backend despierto (Render puede tardar la primera llamada). Manejo de errores con toasts y estados vacíos.

---

**Mantención:** Para cambios de copy/UI, edita `src/pages/**` y `src/components/layout/**`. Para nuevos iconos, agrega un caso en `Sidebar.tsx`. Para nuevos endpoints, actualiza `AppContext` y tipos en `src/types/domain.ts`.*** End Patch}}"## Test Output Reasoning
