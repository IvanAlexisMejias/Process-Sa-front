# Process SA · Frontend (React + Vite)

SPA en React 19 + TypeScript que consume el backend NestJS/Prisma. Incluye navegación por roles, dashboard con flujos/etapas/tareas, modo oscuro, branding propio y gestión completa de usuarios, unidades, tareas y flujos.

---

## Índice
- [Arquitectura y patrones](#arquitectura-y-patrones)
- [Estructura del proyecto y jerarquía](#estructura-del-proyecto-y-jerarquía)
- [Variables de entorno](#variables-de-entorno)
- [Comandos](#comandos)
- [Manual de integración (Render + Netlify)](#manual-de-integración-render--netlify)
- [Flujos funcionales destacados](#flujos-funcionales-destacados)
- [Componentes y páginas clave](#componentes-y-páginas-clave)
- [Tipos y dominio](#tipos-y-dominio)
- [UI/UX (sidebar, topbar, modo oscuro)](#uiux-sidebar-topbar-modo-oscuro)
- [Tablas rápidas de progreso](#tablas-rápidas-de-progreso)
- [Seed y datos demo](#seed-y-datos-demo)
- [Buenas prácticas y troubleshooting](#buenas-prácticas-y-troubleshooting)
- [Manual de usuario (front)](#manual-de-usuario-front)
- [Manual de mantenimiento (front)](#manual-de-mantenimiento-front)
- [Extensiones y roadmap sugerido](#extensiones-y-roadmap-sugerido)
- [Convenciones de estilo y calidad](#convenciones-de-estilo-y-calidad)
- [FAQ corta](#faq-corta)
- [Próximos pasos y escalabilidad](#próximos-pasos-y-escalabilidad)

---

## Arquitectura y patrones

| Área / Patrón       | Implementación                                      | Notas                                                             |
| ------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| Estado + Fetch      | `AppContext` + `apiFetch`                           | Contexto global: token, catálogos, tareas, flujos, notifs.        |
| Router protegido    | React Router 7 + guards en `App.tsx`                | `RoleGuard` y `ProtectedApp` validan sesión/roles.                |
| DI / Hooks          | Hooks custom (`useAppContext`, `useToast`)          | Acceso centralizado a estado/acciones.                           |
| DTO en front        | Tipos TS en `src/types/domain.ts`                   | Alineados con DTO del backend.                                   |
| UI pattern          | Layout fijo (sidebar + topbar), cards, barras       | Sidebar con íconos SVG inline (sin emojis).                      |
| Feedback            | Toasts (`ToastProvider`) + modales (`ConfirmModal`) | Para acciones críticas (eliminar flujos/instancias/unidades).    |
| Theming             | Modo claro/oscuro con CSS vars                      | Toggle en Topbar; gradientes en botones/barras.                  |

---

## Estructura del proyecto y jerarquía

```
frontend/
├─ src/
│  ├─ App.tsx                     # Rutas y guards
│  ├─ context/
│  │   ├─ AppContext.tsx          # Estado global y helpers CRUD
│  │   └─ ToastContext.tsx        # Toasts
│  ├─ routes/appRoutes.tsx        # Definición de rutas + roles
│  ├─ components/
│  │   ├─ layout/Sidebar.tsx      # Sidebar con íconos SVG
│  │   ├─ layout/Topbar.tsx       # Topbar, perfil, modo oscuro
│  │   └─ common/ConfirmModal.tsx # Modal de confirmación
│  ├─ pages/
│  │   ├─ dashboard/OverviewPage.tsx   # Dashboard KPIs, flujos, etapas, tareas
│  │   ├─ designer/FlowsPage.tsx       # Plantillas/instancias, tareas por etapa
│  │   ├─ tasks/*                      # Panel personal, delegadas, alertas
│  │   ├─ admin/UsersPage.tsx          # ABM usuarios
│  │   ├─ admin/UnitsPage.tsx          # ABM unidades/líderes
│  │   └─ auth/LoginPage.tsx           # Login/registro
│  ├─ services/api.ts             # Wrapper fetch con token
│  ├─ types/domain.ts             # Tipos compartidos (Roles, Task, Flow, etc.)
│  └─ assets/logo.svg             # Branding Process SA
├─ public/
└─ .env
```

---

## Variables de entorno

| Archivo         | Clave          | Descripción                               | Ejemplo                                         |
| --------------- | -------------- | ----------------------------------------- | ----------------------------------------------- |
| `frontend/.env` | `VITE_API_URL` | URL base del backend (incluye `/api`)     | `https://process-sa-back.onrender.com/api`      |

---

## Comandos

```bash
npm install          # dependencias
npm run dev          # desarrollo
npm run build        # build de producción (Netlify)
npm run preview      # preview local del build
```

---

## Manual de integración (Render + Netlify)

1) **Backend en Render**: variables `DATABASE_URL`, `JWT_SECRET`, `PORT`; ejecutar `npx prisma migrate deploy` + `npx prisma db seed` en el hook de deploy.  
2) **Frontend en Netlify**:
   - `VITE_API_URL` apuntando a `https://<tu-back>.onrender.com/api`
   - Build: `npm run build`
   - Publish: `dist`
3) **Smoke tests**:
   - `GET <VITE_API_URL>/public/options` → roles/unidades.
   - Login demo: `gabriela@processsa.com` / `Process123*`.
   - Dashboard muestra flujos, etapas y tareas con barras de progreso.

---

## Flujos funcionales destacados

- **Dashboard (OverviewPage)**:
  - Barra de progreso por flujo y estado (`no_iniciado`, `en_progreso`, `terminada`).
  - Barras por etapa (promedio de progreso de sus tareas).
  - Tareas por etapa (hasta 3 visibles) con barras individuales.
  - Ranking por unidad: flujos completados y progreso promedio.
  - Top individual, semáforo de tareas, distribución por estado, alertas.
- **Flujos y plantillas (FlowsPage)**:
  - Crear/editar plantillas con etapas (rol dueño por etapa).
  - Instanciar flujo exigiendo nombre y tareas por etapa; botón deshabilitado hasta cumplir requisitos.
  - Búsqueda de plantillas/instancias, eliminación con confirm modal.
- **Tareas y problemas**:
  - Progreso con slider; estados (pending, in_progress, blocked, completed, returned).
  - Reporte y resolución de problemas (con texto de resolución) visibles en “Alertas y riesgos”.
- **Usuarios y unidades**:
  - ABM completo; asignar líder a unidad existente; eliminar unidad.
- **Perfil**:
  - Campos opcionales `title`, `phone`, `about`, color de avatar persistente.
- **Modo oscuro**:
  - Toggle en topbar; estilos basados en variables CSS.

---

## Componentes y páginas clave

| Área        | Archivo                                     | Qué hace                                                      |
| ----------- | ------------------------------------------- | ------------------------------------------------------------- |
| Router      | `src/App.tsx`                               | Guards por rol; `ProtectedApp` controla sesión/carga inicial. |
| Contexto    | `src/context/AppContext.tsx`                | Estado global; CRUD de tareas, usuarios, unidades, flujos.    |
| Dashboard   | `src/pages/dashboard/OverviewPage.tsx`      | KPIs, flujos/etapas/tareas, ranking por unidad y estado.      |
| Flujos      | `src/pages/designer/FlowsPage.tsx`          | Plantillas, instancias, tareas por etapa, búsqueda, borrado.  |
| Tareas      | `src/pages/tasks/*`                         | Panel personal, delegadas, alertas y riesgos.                 |
| Admin       | `src/pages/admin/UsersPage.tsx`, `UnitsPage.tsx` | ABM usuarios/unidades, roles y líderes.                 |
| Layout      | `src/components/layout/Sidebar.tsx`, `Topbar.tsx` | Navegación, modo oscuro, perfil/cierre.                 |

---

## Tipos y dominio

Definidos en `src/types/domain.ts`:
- `FlowInstance`: `state` (`no_iniciado`, `en_progreso`, `terminada`), `progress`, `stageStatuses`, `ownerUnit`.
- `Task`: `progress`, `stageStatusId`, `ownerUnitId`, problemas, historial.
- `FlowStageStatusEntry`: estado/progreso por etapa y rol dueño.

---

## UI/UX (sidebar, topbar, modo oscuro)

- Sidebar con íconos SVG inline, hover states y badges; branding con `logo.svg`.
- Topbar: toggle de modo oscuro, acceso a perfil y logout.
- Estilo: gradientes en botones/barras, tarjetas con sombras suaves, toasts para feedback.

---

## Tablas rápidas de progreso

- Progreso de etapa = promedio del `progress` de sus tareas (100% solo si todas están al 100%).
- Progreso de flujo = promedio de progreso de sus etapas; 100% solo si todas las etapas están al 100%.
- Estado del flujo: `no_iniciado` (sin avance), `en_progreso` (algún avance), `terminada` (todas las etapas 100%).

---

## Seed y datos demo

Backend (`prisma/seed.ts`) crea:
- Roles: ADMIN, DESIGNER, FUNCTIONARY.
- Unidades: Operaciones, Finanzas, Tecnología, Calidad.
- Usuarios demo: Gabriela (Admin), Joaquín (Designer), María (Functionary) con `Process123*`.
- Plantilla e instancia de Onboarding con etapas y tareas ligadas.

Login rápido en frontend: `gabriela@processsa.com` / `Process123*`.

---

## Buenas prácticas y troubleshooting

| Tema                        | Recomendación                                                |
| --------------------------- | ------------------------------------------------------------ |
| Tokens                      | Se guardan en `localStorage` (`psa:token`); limpiar en logout. |
| Errores iniciales           | Si el backend tarda (Render “cold start”), el guard muestra “Cargando sesión…”. Reintenta. |
| Progreso inconsistente      | Asegura que las tareas tengan `stageStatusId` y `progress` > 0. |
| CORS                        | `VITE_API_URL` debe apuntar al backend con `/api`; backend con CORS habilitado. |
| Builds en Netlify           | Verifica que `VITE_API_URL` esté configurada en el dashboard de Netlify. |

---

## Manual de usuario (front)

| Área                | Cómo usar                                                         |
| ------------------- | ----------------------------------------------------------------- |
| Autenticación       | Inicia sesión con correo/clave; si falla, usa credenciales demo (`gabriela@processsa.com` / `Process123*`). |
| Dashboard           | Visualiza KPIs, flujos activos, etapas y tareas con barras; ranking por unidad y top individual. |
| Flujos y plantillas | Crea plantillas con etapas; edita/busca; elimina con confirm; instancia flujos llenando tareas por etapa (nombre requerido). |
| Tareas              | Ajusta progreso con slider; cambia estado (Aceptar/Terminar/Devolver/Bloquear); reporta problemas con texto; resuelve con resolución. |
| Alertas y riesgos   | Ver tareas bloqueadas/vencidas; marcar problemas resueltos; completar o desbloquear tareas. |
| Usuarios y unidades | Crear/editar usuarios (roles, unidad); crear/eliminar unidades; asignar líder a unidad existente. |
| Perfil              | Actualiza nombre, email, password, unidad, color de avatar, título, teléfono, sobre mí. |
| Modo oscuro         | Toggle en topbar; se mantiene mientras dure la sesión. |

---

## Manual de mantenimiento (front)

| Tarea                     | Paso                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| Actualizar API URL        | Editar `frontend/.env` (`VITE_API_URL`), rebuild y redeploy.         |
| Agregar endpoint nuevo    | 1) Crear helper en `AppContext` con `apiFetch`. 2) Añadir tipos en `src/types/domain.ts`. 3) Consumir en la página/componente. |
| Cambiar iconos del sidebar| Editar `src/components/layout/Sidebar.tsx` (SVG inline).             |
| Branding/logo             | Reemplazar `src/assets/logo.svg` y referencias en layout.            |
| Ajustar estilos           | Variables CSS en `src/index.css` (gradientes, colores claro/oscuro). |
| Debug de red              | Revisar consola; verificar `VITE_API_URL`; chequear token en `localStorage` (`psa:token`). |
| Build local               | `npm run build`; si falla por tipos, sincronizar tipos con backend.  |

---

## Extensiones y roadmap sugerido

- Internacionalización (i18n) con `react-i18next`.
- Accesibilidad: contrastes AA, focus visibles, aria-labels en iconos.
- Performance: memoizar listas grandes, lazy loading en vistas pesadas.
- Offline/PWA: cache de assets y catálogos públicos.
- Tests UI: Playwright/Cypress para flujos críticos (login, crear flujo, cambiar estado de tarea).
- Theming avanzado: presets de colores corporativos y selector persistente.

---

## Convenciones de estilo y calidad

- Tipado estricto; evitar `any`. Tipos en `src/types/domain.ts` sincronizados con backend.
- API centralizada en `apiFetch`; manejo de errores con toasts.
- Componentes pequeños y reusables; evitar lógica pesada en JSX.
- CSS: usar variables; mantener consistencia de paddings/radios; minimizar inline.
- Accesibilidad: labels asociados, aria en iconos, foco visible.
- Commits: convención `feat/fix/docs/chore` para claridad.

---

## FAQ corta

| Pregunta                                  | Respuesta                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| Pantalla blanca tras login                | Verifica `VITE_API_URL`, token válido y que el backend no esté “cold”.    |
| Progreso no sube                          | Asegura `stageStatusId` y `progress` en las tareas de la etapa.           |
| No aparecen unidades/roles                | Checa `GET /public/options` y variables de entorno en Netlify.            |
| Cómo cambiar iconos del sidebar           | Edita `src/components/layout/Sidebar.tsx` (SVG inline).                   |
| Cómo ajustar colores                      | Modifica variables en `src/index.css` (claro/oscuro).                     |

---

## Próximos pasos y escalabilidad

- **Arquitectura hexagonal en front**: separar dominio/lógica (hooks y servicios) de infra UI (componentes), para tests y mantenibilidad.
- **Micro-frontends / BFF**: si crece, considerar BFF específico y micro-fronts por dominio (tasks, flows) coordinados por shell.
- **Caching y estado remoto**: evaluar `react-query`/`RTK Query` para caché y dedupe de requests críticos.
- **AWS/Edge**: servir assets desde CDN, usar funciones edge para auth ligera si se requiere, e integrar con API gateway.
- **Monitoreo de UX**: instrumentar métricas de rendimiento (LCP, FID) y trazas de error (Sentry/RRWeb).
- **Design system**: consolidar tokens de diseño y biblioteca de componentes reutilizables versionada.

---

Mantenedor: Equipo Process SA. Para extender UI, agrega componentes en `src/components/` y actualiza tipos en `src/types/domain.ts`. Para nuevos endpoints, incorpora métodos en `AppContext` y mapea datos en `normalize*`.***
