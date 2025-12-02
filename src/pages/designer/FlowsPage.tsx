import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAppContext } from "@/context/AppContext";
import { UseCaseChips } from "@/components/common/UseCaseChips";
import type { RoleKey, Task } from "@/types/domain";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useToast } from "@/context/ToastContext";

const stageTemplate = {
  name: "",
  description: "",
  expectedDurationDays: 2,
  ownerRole: "DESIGNER" as RoleKey,
  exitCriteria: "",
};

const taskTemplate = { title: "", description: "", priority: "medium" as const, dueInDays: 3 };

export const FlowsPage = () => {
  const {
    flowTemplates,
    flowInstances,
    roles,
    units,
    users,
    createFlowTemplate,
    instantiateFlow,
    deleteFlowTemplate,
    deleteFlowInstance,
  } = useAppContext();
  const { showToast } = useToast();
  const [stageDraft, setStageDraft] = useState(stageTemplate);
  const [form, setForm] = useState({
    name: "",
    description: "",
    businessObjective: "",
    typicalDurationDays: 10,
    ownerId: "",
  });
  const [stages, setStages] = useState<typeof flowTemplates[number]["stages"]>([]);
  const [stageTasks, setStageTasks] = useState<Record<string, typeof taskTemplate[]>>({});
  const [taskDraft, setTaskDraft] = useState<Record<string, typeof taskTemplate>>({});

  const [instanceForm, setInstanceForm] = useState({
    templateId: "",
    ownerUnitId: "",
    name: "Ejecución personalizada",
    kickoffDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  });

  useEffect(() => {
    setInstanceForm((prev) => ({
      ...prev,
      templateId: flowTemplates[0]?.id ?? "",
      ownerUnitId: units[0]?.id ?? "",
    }));
  }, [flowTemplates, units]);

  const addStage = () => {
    if (!stageDraft.name) return;
    const stageId = `stage-${stages.length + 1}`;
    setStages((prev) => [
      ...prev,
      {
        id: stageId,
        ...stageDraft,
        exitCriteria: stageDraft.exitCriteria || "Por definir",
      },
    ]);
    setTaskDraft((prev) => ({ ...prev, [stageId]: taskTemplate }));
    setStageDraft(stageTemplate);
  };

  const addTaskToStage = (stageId: string) => {
    const draft = taskDraft[stageId] ?? taskTemplate;
    if (!draft.title) return;
    setStageTasks((prev) => ({
      ...prev,
      [stageId]: [...(prev[stageId] ?? []), draft],
    }));
    setTaskDraft((prev) => ({ ...prev, [stageId]: taskTemplate }));
  };

  const handleTemplateSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || stages.length === 0) return;
    createFlowTemplate({
      name: form.name,
      description: form.description,
      businessObjective: form.businessObjective,
      ownerId: form.ownerId || flowTemplates[0]?.ownerId || "",
      typicalDurationDays: form.typicalDurationDays,
      stages,
    });
    setForm({
      name: "",
      description: "",
      businessObjective: "",
      typicalDurationDays: 10,
      ownerId: "",
    });
    setStages([]);
    setStageTasks({});
    setTaskDraft({});
    showToast("Plantilla creada", "success");
  };

  const handleInstanceSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!instanceForm.templateId) return;
    const selectedTemplate = flowTemplates.find((template) => template.id === instanceForm.templateId);
    const payloadStageTasks =
      selectedTemplate?.stages
        .map((stage) => ({
          stageId: stage.id,
          tasks: (stageTasks[stage.id] ?? []).map((task) => ({
            ...task,
            priority: task.priority.toUpperCase() as Uppercase<Task["priority"]>,
          })),
        }))
        .filter((entry) => entry.tasks.length > 0) ?? [];

    instantiateFlow({
      ...instanceForm,
      kickoffDate: new Date(instanceForm.kickoffDate).toISOString(),
      dueDate: new Date(instanceForm.dueDate).toISOString(),
      stageTasks: payloadStageTasks,
    });
    showToast("Instancia creada", "success");
  };

  const [confirm, setConfirm] = useState<{ open: boolean; onConfirm: () => void; message: string }>({
    open: false,
    onConfirm: () => {},
    message: "",
  });

  const askConfirm = (message: string, onConfirm: () => void) => setConfirm({ open: true, message, onConfirm });

  const stagesOfSelectedTemplate = useMemo(
    () => flowTemplates.find((template) => template.id === instanceForm.templateId)?.stages ?? [],
    [flowTemplates, instanceForm.templateId],
  );

  const [templateSearch, setTemplateSearch] = useState("");
  const [instanceSearch, setInstanceSearch] = useState("");
  const filteredTemplates = useMemo(
    () =>
      flowTemplates.filter(
        (tpl) =>
          tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
          tpl.description.toLowerCase().includes(templateSearch.toLowerCase()),
      ),
    [flowTemplates, templateSearch],
  );
  const filteredInstances = useMemo(
    () => flowInstances.filter((inst) => inst.name.toLowerCase().includes(instanceSearch.toLowerCase())),
    [flowInstances, instanceSearch],
  );

  return (
    <div className="grid" style={{ gap: "1.25rem" }}>
      <ConfirmModal
        open={confirm.open}
        message={confirm.message}
        onCancel={() => setConfirm((prev) => ({ ...prev, open: false }))}
        onConfirm={() => {
          confirm.onConfirm();
          setConfirm((prev) => ({ ...prev, open: false }));
        }}
      />
      <section className="card">
        <h2 className="section-title">Diseñar flujo tipo</h2>
        <form onSubmit={handleTemplateSubmit} className="grid" style={{ gap: "1rem" }}>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Nombre del flujo</span>
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
            </label>
            <label className="field">
              <span className="field-label">Objetivo del negocio</span>
              <input value={form.businessObjective} onChange={(event) => setForm((prev) => ({ ...prev, businessObjective: event.target.value }))} />
            </label>
            <label className="field">
              <span className="field-label">Responsable principal</span>
              <select value={form.ownerId} onChange={(event) => setForm((prev) => ({ ...prev, ownerId: event.target.value }))}>
                <option value="">Selecciona un dueño</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
              <span className="field-hint">Define quién mantiene la plantilla.</span>
            </label>
            <label className="field">
              <span className="field-label">Duración típica (días)</span>
              <input
                type="number"
                min={1}
                value={form.typicalDurationDays}
                onChange={(event) => setForm((prev) => ({ ...prev, typicalDurationDays: Number(event.target.value) }))}
              />
            </label>
          </div>
          <label className="field">
            <span className="field-label">Descripción</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              style={{ minHeight: "90px" }}
            />
          </label>
          <div
            style={{
              border: "1px dashed var(--border-soft)",
              borderRadius: "var(--radius)",
              padding: "1rem",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Etapas del flujo y tareas</h3>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              {stages.map((stage) => (
                <span key={stage.id} className="tag">
                  {stage.name} · {stage.ownerRole}
                </span>
              ))}
            </div>
            <div className="form-grid">
              <label className="field">
                <span className="field-label">Nombre de etapa</span>
                <input value={stageDraft.name} onChange={(event) => setStageDraft((prev) => ({ ...prev, name: event.target.value }))} />
              </label>
              <label className="field">
                <span className="field-label">Rol responsable</span>
                <select
                  value={stageDraft.ownerRole}
                  onChange={(event) => setStageDraft((prev) => ({ ...prev, ownerRole: event.target.value as RoleKey }))}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.key}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Duración estimada</span>
                <input
                  type="number"
                  min={1}
                  value={stageDraft.expectedDurationDays}
                  onChange={(event) => setStageDraft((prev) => ({ ...prev, expectedDurationDays: Number(event.target.value) }))}
                />
              </label>
              <label className="field">
                <span className="field-label">Criterio de salida</span>
                <input
                  value={stageDraft.exitCriteria}
                  onChange={(event) => setStageDraft((prev) => ({ ...prev, exitCriteria: event.target.value }))}
                  placeholder="Documento firmado, validación, etc."
                />
              </label>
              <div style={{ alignSelf: "end" }}>
                <button type="button" className="btn btn-outline" onClick={addStage}>
                  Agregar etapa
                </button>
              </div>
            </div>
            {stages.map((stage) => (
              <div key={stage.id} style={{ marginTop: "0.75rem", padding: "0.75rem", borderRadius: "var(--radius)", background: "var(--bg-muted)" }}>
                <strong>{stage.name}</strong>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.5rem 0" }}>
                  {(stageTasks[stage.id] ?? []).map((task, idx) => (
                    <span key={`${stage.id}-task-${idx}`} className="tag">
                      {task.title} · {task.priority}
                    </span>
                  ))}
                  {(stageTasks[stage.id] ?? []).length === 0 && (
                    <small style={{ color: "var(--text-muted)" }}>Aún sin tareas</small>
                  )}
                </div>
                <div className="form-grid">
                  <input
                    placeholder="Título de tarea"
                    value={(taskDraft[stage.id] ?? taskTemplate).title}
                    onChange={(event) =>
                      setTaskDraft((prev) => ({ ...prev, [stage.id]: { ...(prev[stage.id] ?? taskTemplate), title: event.target.value } }))
                    }
                  />
                  <input
                    placeholder="Descripción breve"
                    value={(taskDraft[stage.id] ?? taskTemplate).description}
                    onChange={(event) =>
                      setTaskDraft((prev) => ({ ...prev, [stage.id]: { ...(prev[stage.id] ?? taskTemplate), description: event.target.value } }))
                    }
                  />
                  <select
                    value={(taskDraft[stage.id] ?? taskTemplate).priority}
                    onChange={(event) =>
                      setTaskDraft((prev) => ({
                        ...prev,
                        [stage.id]: { ...(prev[stage.id] ?? taskTemplate), priority: event.target.value as any },
                      }))
                    }
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={(taskDraft[stage.id] ?? taskTemplate).dueInDays}
                    onChange={(event) =>
                      setTaskDraft((prev) => ({
                        ...prev,
                        [stage.id]: { ...(prev[stage.id] ?? taskTemplate), dueInDays: Number(event.target.value) },
                      }))
                    }
                    placeholder="Días para vencer"
                  />
                  <div style={{ alignSelf: "end" }}>
                    <button type="button" className="btn btn-outline" onClick={() => addTaskToStage(stage.id)}>
                      Agregar tarea
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <button type="submit" className="btn btn-primary">
              Guardar flujo
            </button>
          </div>
        </form>
        <UseCaseChips cases={["CU5"]} />
      </section>

      <section className="card">
        <h2 className="section-title">Instanciar flujo</h2>
        <form onSubmit={handleInstanceSubmit} className="form-grid">
          <label className="field">
            <span className="field-label">Plantilla</span>
            <select value={instanceForm.templateId} onChange={(event) => setInstanceForm((prev) => ({ ...prev, templateId: event.target.value }))}>
              {flowTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Unidad propietaria</span>
            <select value={instanceForm.ownerUnitId} onChange={(event) => setInstanceForm((prev) => ({ ...prev, ownerUnitId: event.target.value }))}>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Fecha de inicio</span>
            <input
              type="date"
              value={instanceForm.kickoffDate}
              onChange={(event) => setInstanceForm((prev) => ({ ...prev, kickoffDate: event.target.value }))}
            />
          </label>
          <label className="field">
            <span className="field-label">Fecha de término</span>
            <input
              type="date"
              value={instanceForm.dueDate}
              onChange={(event) => setInstanceForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            />
          </label>
          <div style={{ gridColumn: "1/-1", background: "var(--bg-muted)", borderRadius: "var(--radius)", padding: "0.75rem" }}>
            <p style={{ margin: "0 0 0.5rem", color: "var(--text-muted)" }}>Tareas por etapa (opcional)</p>
            <div className="grid two">
              {stagesOfSelectedTemplate.map((stage) => (
                <div key={stage.id} style={{ border: "1px dashed var(--border-soft)", borderRadius: "var(--radius)", padding: "0.75rem" }}>
                  <strong>{stage.name}</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", margin: "0.4rem 0" }}>
                    {(stageTasks[stage.id] ?? []).map((task, idx) => (
                      <span key={`${stage.id}-inst-task-${idx}`} className="tag">
                        {task.title} · {task.priority}
                      </span>
                    ))}
                    {(stageTasks[stage.id] ?? []).length === 0 && (
                      <small style={{ color: "var(--text-muted)" }}>Sin tareas asignadas aún</small>
                    )}
                  </div>
                  <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", marginTop: "0.25rem" }}>
                    <input
                      placeholder="Título de tarea"
                      value={(taskDraft[stage.id] ?? taskTemplate).title}
                      onChange={(event) =>
                        setTaskDraft((prev) => ({ ...prev, [stage.id]: { ...(prev[stage.id] ?? taskTemplate), title: event.target.value } }))
                      }
                    />
                    <select
                      value={(taskDraft[stage.id] ?? taskTemplate).priority}
                      onChange={(event) =>
                        setTaskDraft((prev) => ({
                          ...prev,
                          [stage.id]: { ...(prev[stage.id] ?? taskTemplate), priority: event.target.value as any },
                        }))
                      }
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={(taskDraft[stage.id] ?? taskTemplate).dueInDays}
                      onChange={(event) =>
                        setTaskDraft((prev) => ({
                          ...prev,
                          [stage.id]: { ...(prev[stage.id] ?? taskTemplate), dueInDays: Number(event.target.value) },
                        }))
                      }
                      placeholder="Días para vencer"
                    />
                    <div style={{ alignSelf: "end" }}>
                      <button type="button" className="btn btn-outline" onClick={() => addTaskToStage(stage.id)}>
                        Agregar tarea
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ alignSelf: "end" }}>
            <button type="submit" className="btn btn-primary">
              Ejecutar flujo
            </button>
          </div>
        </form>
        <UseCaseChips cases={["CU19"]} />
      </section>

      <section className="card">
        <h2 className="section-title">Biblioteca de flujos</h2>
        <div style={{ marginBottom: "0.75rem" }}>
          <input
            placeholder="Buscar plantillas..."
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
            style={{ maxWidth: "320px" }}
          />
        </div>
        <div className="grid two">
          {filteredTemplates.map((template) => (
            <article key={template.id} style={{ border: "1px solid var(--border-soft)", borderRadius: "var(--radius)", padding: "1rem" }}>
              <strong>{template.name}</strong>
              <p style={{ color: "var(--text-muted)" }}>{template.description}</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {template.stages.map((stage) => (
                  <span key={stage.id} className="tag">
                    {stage.name} · {stage.ownerRole}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    askConfirm("¿Eliminar esta plantilla? No debe tener instancias activas.", () => {
                      deleteFlowTemplate(template.id);
                      showToast("Plantilla eliminada", "info");
                    })
                  }
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Ejecuciones recientes</h2>
        <div style={{ marginBottom: "0.75rem" }}>
          <input
            placeholder="Buscar ejecuciones..."
            value={instanceSearch}
            onChange={(e) => setInstanceSearch(e.target.value)}
            style={{ maxWidth: "320px" }}
          />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Unidad</th>
              <th>Avance</th>
              <th>Salud</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredInstances.map((instance) => (
              <tr key={instance.id}>
                <td>{instance.name}</td>
                <td>{units.find((unit) => unit.id === instance.ownerUnitId)?.name}</td>
                <td>{instance.progress}%</td>
                <td>{instance.health}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      askConfirm("¿Eliminar esta instancia? Se borrarán sus tareas asociadas.", () => {
                        deleteFlowInstance(instance.id);
                        showToast("Instancia eliminada", "info");
                      })
                    }
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
