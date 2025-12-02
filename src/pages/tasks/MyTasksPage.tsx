import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { UseCaseChips } from "@/components/common/UseCaseChips";
import { UserAvatar } from "@/components/common/UserAvatar";
import { trafficLight } from "@/utils/dates";
import type { Task } from "@/types/domain";

type Feedback = { type: "success" | "error"; message: string } | null;

export const MyTasksPage = () => {
  const { tasks, users, currentUser, createTask, changeTaskStatus, updateTask, reportProblem } = useAppContext();
  const [problemDrafts, setProblemDrafts] = useState<Record<string, string>>({});
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    priority: "medium",
    ownerId: currentUser?.id ?? "",
    assignerId: currentUser?.id ?? "",
  });
  const [formFeedback, setFormFeedback] = useState<Feedback>(null);
  const [statusFeedback, setStatusFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (currentUser) {
      setTaskForm((prev) => ({
        ...prev,
        ownerId: currentUser.id,
        assignerId: currentUser.id,
      }));
    }
  }, [currentUser]);

  const myTasks = useMemo(() => tasks.filter((task) => task.ownerId === currentUser?.id), [tasks, currentUser?.id]);

  const grouped = useMemo(() => {
    return myTasks.reduce(
      (acc, task) => {
        acc[task.status] = [...(acc[task.status] ?? []), task];
        return acc;
      },
      {} as Record<string, typeof myTasks>,
    );
  }, [myTasks]);

  const summary = useMemo(() => ({
    total: myTasks.length,
    inProgress: myTasks.filter((task) => task.status === "in_progress").length,
    blocked: myTasks.filter((task) => task.status === "blocked").length,
    overdue: myTasks.filter((task) => new Date(task.deadline) < new Date() && task.status !== "completed").length,
  }), [myTasks]);

  const delegatedPreview = useMemo(
    () =>
      tasks
        .filter((task) => task.assignerId === currentUser?.id && task.ownerId !== currentUser?.id)
        .slice(0, 3),
    [tasks, currentUser?.id],
  );

  const userName = (id?: string) => users.find((user) => user.id === id)?.fullName ?? "Sin asignar";

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser || !taskForm.title || !taskForm.description) return;
    if (taskForm.description.length < 10) {
      setFormFeedback({ type: "error", message: "La descripción debe tener al menos 10 caracteres." });
      return;
    }
    try {
      const created = await createTask({
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority as Task["priority"],
        deadline: new Date(taskForm.deadline).toISOString(),
        ownerId: taskForm.ownerId,
        assignerId: taskForm.assignerId,
      });
      setTaskForm({
        title: "",
        description: "",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        priority: "medium",
        ownerId: currentUser?.id ?? "",
        assignerId: currentUser?.id ?? "",
      });
      setFormFeedback({
        type: "success",
        message: `Tarea "${created.title}" asignada a ${userName(created.ownerId)}.`,
      });
    } catch (error) {
      setFormFeedback({ type: "error", message: (error as Error).message ?? "No fue posible crear la tarea." });
    }
  };

  const handleProgressChange = async (taskId: string, value: number) => {
    try {
      await updateTask(taskId, { progress: value });
      setStatusFeedback({ type: "success", message: "Progreso actualizado." });
    } catch (error) {
      setStatusFeedback({ type: "error", message: "No se pudo actualizar el progreso." });
    }
  };

  const handleReportProblem = async (taskId: string) => {
    const text = problemDrafts[taskId];
    if (!text || text.length < 5) {
      setStatusFeedback({ type: "error", message: "Describe el problema con al menos 5 caracteres." });
      return;
    }
    try {
      await reportProblem(taskId, text);
      setProblemDrafts((prev) => ({ ...prev, [taskId]: "" }));
      setStatusFeedback({ type: "success", message: "Se registró la alerta para el equipo." });
    } catch (error) {
      setStatusFeedback({ type: "error", message: "No se pudo enviar la alerta." });
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"], progress?: number) => {
    try {
      await changeTaskStatus(taskId, status, progress);
      setStatusFeedback({ type: "success", message: "Estado actualizado." });
    } catch (error) {
      setStatusFeedback({ type: "error", message: "No se pudo cambiar el estado." });
    }
  };

  return (
    <div className="grid" style={{ gap: "1.25rem" }}>
      <section className="card">
        <h2 className="section-title">Resumen personal</h2>
        <div className="grid three">
          <article>
            <small style={{ color: "var(--text-muted)" }}>Total</small>
            <h3 style={{ margin: "0.35rem 0" }}>{summary.total}</h3>
          </article>
          <article>
            <small style={{ color: "var(--text-muted)" }}>En curso</small>
            <h3 style={{ margin: "0.35rem 0" }}>{summary.inProgress}</h3>
          </article>
          <article>
            <small style={{ color: "var(--text-muted)" }}>Bloqueadas / vencidas</small>
            <h3 style={{ margin: "0.35rem 0", color: summary.blocked + summary.overdue ? "var(--danger)" : "inherit" }}>
              {summary.blocked + summary.overdue}
            </h3>
          </article>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Registrar tarea rápida</h2>
        {formFeedback && (
          <div
            role="alert"
            style={{
              borderRadius: "var(--radius)",
              padding: "0.75rem 1rem",
              background: formFeedback.type === "success" ? "#e3fcef" : "#ffeceb",
              color: formFeedback.type === "success" ? "#027a48" : "#b71c1c",
              marginBottom: "1rem",
            }}
          >
            {formFeedback.message}
          </div>
        )}
        <form onSubmit={handleCreateTask} className="form-grid">
          <label className="field">
            <span className="field-label">Título</span>
            <input
              placeholder="Diseñar nuevo flujo"
              value={taskForm.title}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <span className="field-hint">Describe el objetivo principal.</span>
          </label>
          <label className="field" style={{ gridColumn: "1/-1" }}>
            <span className="field-label">Descripción</span>
            <textarea
              placeholder="Detalla el alcance de la tarea"
              value={taskForm.description}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, description: event.target.value }))}
              style={{ minHeight: "90px" }}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Fecha límite</span>
            <input
              type="date"
              value={taskForm.deadline}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, deadline: event.target.value }))}
              required
            />
            <span className="field-hint">Define el compromiso de entrega.</span>
          </label>
          <label className="field">
            <span className="field-label">Prioridad</span>
            <select
              value={taskForm.priority}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, priority: event.target.value }))}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Responsable</span>
            <select
              value={taskForm.ownerId}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, ownerId: event.target.value }))}
              required
            >
              <option value="">Selecciona responsable</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Asignador</span>
            <select
              value={taskForm.assignerId}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, assignerId: event.target.value }))}
              required
            >
              <option value="">Selecciona asignador</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </label>
          <div style={{ alignSelf: "end" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!currentUser || !taskForm.ownerId || !taskForm.assignerId}
            >
              Crear tarea
            </button>
          </div>
        </form>
        <UseCaseChips cases={["CU3", "CU6"]} />
      </section>

      <section className="card">
        <h2 className="section-title">Mis tareas (semáforo personal)</h2>
        {statusFeedback && (
          <div
            role="alert"
            style={{
              borderRadius: "var(--radius)",
              padding: "0.75rem 1rem",
              background: statusFeedback.type === "success" ? "#e3fcef" : "#ffeceb",
              color: statusFeedback.type === "success" ? "#027a48" : "#b71c1c",
              marginBottom: "1rem",
            }}
          >
            {statusFeedback.message}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1rem" }}>
          {["pending", "in_progress", "blocked", "completed", "returned"].map((status) => (
            <div key={status} style={{ border: "1px solid var(--border-soft)", borderRadius: "var(--radius)", padding: "1rem" }}>
              <strong style={{ textTransform: "capitalize" }}>{status.replace("_", " ")}</strong>
              {(grouped[status]?.length ?? 0) === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>Sin tareas</p>
              ) : (
                grouped[status]?.map((task) => (
                  <article key={task.id} style={{ marginTop: "0.75rem", padding: "0.75rem", borderRadius: "var(--radius)", background: "var(--bg-muted)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{task.title}</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            trafficLight(task.deadline, task.status) === "red"
                              ? "var(--danger)"
                              : trafficLight(task.deadline, task.status) === "yellow"
                                ? "var(--warning)"
                                : "var(--success)",
                        }}
                      >
                        {trafficLight(task.deadline, task.status)}
                      </span>
                    </div>
                    <small style={{ color: "var(--text-muted)" }}>
                      Vence: {new Date(task.deadline).toLocaleDateString()}
                    </small>
                    <label className="field" style={{ margin: "0.75rem 0" }}>
                      <span className="field-label">Progreso</span>
                      <input type="range" min={0} max={100} value={task.progress} onChange={(event) => handleProgressChange(task.id, Number(event.target.value))} />
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {task.status !== "in_progress" && task.status !== "completed" && currentUser && (
                        <button type="button" className="btn btn-outline" onClick={() => handleStatusChange(task.id, "in_progress")}>
                          Aceptar
                        </button>
                      )}
                      {task.status !== "blocked" ? (
                        <button type="button" className="btn btn-outline" onClick={() => handleStatusChange(task.id, "blocked")}>
                          Bloquear
                        </button>
                      ) : (
                        <button type="button" className="btn btn-outline" onClick={() => handleStatusChange(task.id, "in_progress")}>
                          Desbloquear
                        </button>
                      )}
                      {task.status !== "completed" && currentUser && (
                        <button type="button" className="btn btn-primary" onClick={() => handleStatusChange(task.id, "completed", 100)}>
                          Terminar
                        </button>
                      )}
                      <button type="button" className="btn btn-outline" onClick={() => currentUser && handleStatusChange(task.id, "returned")}>
                        Devolver
                      </button>
                    </div>
                    <label className="field" style={{ marginTop: "0.5rem" }}>
                      <span className="field-label">Reportar problema</span>
                      <textarea
                        placeholder="Describe el bloqueo"
                        value={problemDrafts[task.id] ?? ""}
                        onChange={(event) => setProblemDrafts((prev) => ({ ...prev, [task.id]: event.target.value }))}
                      />
                    </label>
                    <button type="button" className="btn btn-outline" onClick={() => handleReportProblem(task.id)}>
                      Enviar alerta
                    </button>
                  </article>
                ))
              )}
            </div>
          ))}
        </div>
        <UseCaseChips cases={["CU3", "CU6", "CU7", "CU8", "CU9", "CU10", "CU11", "CU14", "CU15", "CU16"]} />
      </section>

      {delegatedPreview.length > 0 && (
        <section className="card">
          <h2 className="section-title">Últimas tareas delegadas</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {delegatedPreview.map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <UserAvatar name={userName(task.ownerId)} color={users.find((user) => user.id === task.ownerId)?.avatarColor} size={36} />
                <div>
                  <strong>{task.title}</strong>
                  <div style={{ color: "var(--text-muted)" }}>
                    Responsable: {userName(task.ownerId)} · Vence {new Date(task.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
