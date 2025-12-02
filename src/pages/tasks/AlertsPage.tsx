import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { UseCaseChips } from '@/components/common/UseCaseChips';
import { useToast } from '@/context/ToastContext';

export const AlertsPage = () => {
  const { tasks, notifications, changeTaskStatus, resolveProblem } = useAppContext();
  const { showToast } = useToast();

  const alertTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.status === 'blocked' ||
          (task.status !== 'completed' && new Date(task.deadline) < new Date()),
      ),
    [tasks],
  );

  const tasksWithProblems = useMemo(
    () => tasks.filter((task) => task.problems.length > 0),
    [tasks],
  );

  return (
    <div className="grid" style={{ gap: '1.25rem' }}>
      <section className="card">
        <h2 className="section-title">Alertas automáticas</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.75rem' }}>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-soft)',
                background: 'var(--bg-muted)',
              }}
            >
              <strong style={{ display: 'block' }}>{notification.message}</strong>
              <small style={{ color: 'var(--text-muted)' }}>
                {new Date(notification.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
        <UseCaseChips cases={['CU13']} />
      </section>

      <section className="card">
        <h2 className="section-title">Tareas en riesgo</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Estado</th>
              <th>Plazo</th>
              <th>Problemas abiertos</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alertTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>
                  <span className={`status-pill ${task.status}`}>{task.status}</span>
                </td>
                <td>{new Date(task.deadline).toLocaleDateString()}</td>
                <td>{task.problems.length}</td>
                <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      changeTaskStatus(task.id, task.status === 'blocked' ? 'in_progress' : 'blocked');
                      showToast('Estado actualizado', 'info');
                    }}
                  >
                    {task.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      changeTaskStatus(task.id, 'completed');
                      showToast('Tarea marcada como completada', 'success');
                    }}
                  >
                    Completar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="section-title">Problemas reportados</h2>
        {tasksWithProblems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Sin reportes pendientes.</p>
        ) : (
          <div className="grid two">
            {tasksWithProblems.map((task) => (
              <article key={task.id} style={{ border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                <strong>{task.title}</strong>
                <ul>
                  {task.problems.map((problem) => (
                    <li key={problem.id}>
                      {problem.description}{' '}
                      <small style={{ color: 'var(--text-muted)' }}>
                        ({new Date(problem.createdAt).toLocaleString()})
                      </small>
                      {problem.status === 'open' && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ marginLeft: '0.5rem' }}
                          onClick={() => {
                            const resolution = prompt('Describe la resolución (opcional)');
                            resolveProblem(problem.id, resolution ?? undefined);
                            showToast('Problema resuelto', 'success');
                          }}
                        >
                          Marcar resuelto
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
