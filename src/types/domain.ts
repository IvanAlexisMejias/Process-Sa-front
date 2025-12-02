export type RoleKey = 'ADMIN' | 'DESIGNER' | 'FUNCTIONARY';

export interface RoleDefinition {
  id: string;
  key: RoleKey;
  name: string;
  description: string;
  permissions: string[];
}

export interface Unit {
  id: string;
  name: string;
  parentId?: string | null;
  leadId?: string | null;
  parent?: Pick<Unit, 'id' | 'name'> | null;
  lead?: Pick<User, 'id' | 'fullName'> | null;
}

export interface UserRoleSummary {
  id: string;
  key: RoleKey;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  unitId: string | null;
  avatarColor?: string | null;
  title?: string | null;
  phone?: string | null;
  about?: string | null;
  workload: number;
  lastLogin?: string | null;
  role?: UserRoleSummary;
  unit?: Unit | null;
}

export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'returned';

export interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeId: string;
  progress: number;
  deadline: string;
}

export interface TaskProblem {
  id: string;
  taskId: string;
  reporterId: string;
  createdAt: string;
  resolvedAt?: string | null;
  resolution?: string | null;
  description: string;
  status: 'open' | 'resolved';
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  action: string;
  performedBy?: string | null;
  performedByName?: string | null;
  timestamp: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  ownerId: string;
  assignerId: string;
  flowInstanceId?: string;
  flowInstance?: FlowInstance | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  durationDays: number;
  dependencies: string[];
  relatedTaskIds: string[];
  tags: string[];
  allowRejection: boolean;
  problems: TaskProblem[];
  history: TaskHistoryEntry[];
  subTasks: SubTask[];
  owner?: Pick<User, 'id' | 'fullName'> | null;
  assigner?: Pick<User, 'id' | 'fullName'> | null;
  ownerUnitId?: string | null;
}

export interface FlowStage {
  id: string;
  name: string;
  description: string;
  expectedDurationDays: number;
  ownerRole: RoleKey;
  exitCriteria: string;
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  businessObjective: string;
  stages: FlowStage[];
  lastUpdated: string;
  ownerId: string;
  typicalDurationDays: number;
}

export interface FlowStageStatusEntry {
  id: string;
  status: TaskStatus;
  progress: number;
  owner?: Pick<User, 'id' | 'fullName'> | null;
  stage: {
    id: string;
    name: string;
    description: string;
    ownerRole: RoleKey;
  };
}

export interface FlowInstance {
  id: string;
  templateId?: string;
  template?: {
    id: string;
    name: string;
  };
  ownerUnitId?: string;
  ownerUnit?: Pick<Unit, 'id' | 'name'> | null;
  name: string;
  kickoffDate: string;
  dueDate: string;
  stageStatuses: FlowStageStatusEntry[];
  /**
   * Legacy field kept for mock data compatibility. Prefer `stageStatuses`.
   */
  stageStatus?: Record<
    string,
    {
      status: TaskStatus;
      ownerId: string;
      progress: number;
    }
  >;
  health: 'on_track' | 'at_risk' | 'delayed';
  progress: number;
}

export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  severity: 'info' | 'warning' | 'danger';
  link?: string;
}

export interface WorkloadSummary {
  userId: string;
  assigned: number;
  inProgress: number;
  blocked: number;
  overdue: number;
  capacity: number;
}

export interface MetricSnapshot {
  date: string;
  completed: number;
  delayed: number;
  reassigned: number;
}
