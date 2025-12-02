import type { ReactElement } from "react";
import type { RoleKey } from "@/types/domain";
import { OverviewPage } from "@/pages/dashboard/OverviewPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { UnitsPage } from "@/pages/admin/UnitsPage";
import { FlowsPage } from "@/pages/designer/FlowsPage";
import { MyTasksPage } from "@/pages/tasks/MyTasksPage";
import { AssignedTasksPage } from "@/pages/tasks/AssignedTasksPage";
import { AlertsPage } from "@/pages/tasks/AlertsPage";
import { GlobalReportsPage } from "@/pages/reports/GlobalReportsPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";

export type RouteSection = "general" | "admin" | "designer" | "tasks" | "reports";

export interface AppRoute {
  path: string;
  label: string;
  description: string;
  icon: string;
  roles: RoleKey[];
  section: RouteSection;
  cases: string[];
  element: ReactElement;
}

export const appRoutes: AppRoute[] = [
  {
    path: "/app/profile",
    label: "Mi perfil",
    description: "Actualiza tu información personal",
    icon: "👤",
    roles: ["ADMIN", "DESIGNER", "FUNCTIONARY"],
    section: "general",
    cases: ["CU3"],
    element: <ProfilePage />,
  },
  {
    path: "/app/overview",
    label: "Visión global",
    description: "Indicadores y semáforos del proceso",
    icon: "📊",
    roles: ["ADMIN", "DESIGNER", "FUNCTIONARY"],
    section: "general",
    cases: ["CU8", "CU13", "CU17", "CU18"],
    element: <OverviewPage />,
  },
  {
    path: "/app/admin/users",
    label: "Usuarios y roles",
    description: "Alta de usuarios y definición de perfiles",
    icon: "🛡️",
    roles: ["ADMIN"],
    section: "admin",
    cases: ["CU1", "CU4"],
    element: <UsersPage />,
  },
  {
    path: "/app/admin/units",
    label: "Unidades internas",
    description: "Estructura organizacional",
    icon: "🏢",
    roles: ["ADMIN"],
    section: "admin",
    cases: ["CU2"],
    element: <UnitsPage />,
  },
  {
    path: "/app/designer/flows",
    label: "Flujos y plantillas",
    description: "Diseño e instanciación de procesos",
    icon: "🌀",
    roles: ["ADMIN", "DESIGNER"],
    section: "designer",
    cases: ["CU5", "CU19"],
    element: <FlowsPage />,
  },
  {
    path: "/app/tasks/board",
    label: "Mi panel de tareas",
    description: "Ejecución diaria y semáforo",
    icon: "✅",
    roles: ["ADMIN", "DESIGNER", "FUNCTIONARY"],
    section: "tasks",
    cases: ["CU3", "CU6", "CU7", "CU8", "CU9", "CU10", "CU11", "CU14", "CU15", "CU16"],
    element: <MyTasksPage />,
  },
  {
    path: "/app/tasks/assigned",
    label: "Tareas delegadas",
    description: "Control de responsables",
    icon: "🔀",
    roles: ["ADMIN", "DESIGNER", "FUNCTIONARY"],
    section: "tasks",
    cases: ["CU7", "CU9", "CU10"],
    element: <AssignedTasksPage />,
  },
  {
    path: "/app/tasks/alerts",
    label: "Alertas y riesgos",
    description: "Visor de atrasos y bloqueos",
    icon: "🚨",
    roles: ["ADMIN", "DESIGNER", "FUNCTIONARY"],
    section: "tasks",
    cases: ["CU13"],
    element: <AlertsPage />,
  },
  {
    path: "/app/reports/global",
    label: "Reportes globales",
    description: "Carga y cumplimiento por unidad",
    icon: "📈",
    roles: ["ADMIN", "DESIGNER"],
    section: "reports",
    cases: ["CU17", "CU18"],
    element: <GlobalReportsPage />,
  },
];

export const sectionLabels: Record<RouteSection, string> = {
  general: "Panel",
  admin: "Administración",
  designer: "Diseño de procesos",
  tasks: "Operación diaria",
  reports: "Reportes",
};
