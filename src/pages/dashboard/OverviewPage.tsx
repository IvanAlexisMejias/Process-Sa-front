import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { trafficLight } from '@/utils/dates';
import { UseCaseChips } from '@/components/common/UseCaseChips';

export const OverviewPage = () => {
  const { tasks, flowInstances, notifications, metrics } = useAppContext();

  const summary = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const delayed = tasks.filter(
      (task) => new Date(task.deadline) < new Date() && task.status !== 'completed',
    ).length;
    const atRisk = tasks.filter((task) => task.status === 'blocked').length;
    return { completed, delayed, atRisk };
  }, [tasks]);

  return (
    <div className="grid" style={{ paddingBottom: '2rem', gap: '1.25rem' }}>
      <section className="card">
        <h2 className="section-title">Radar operativo</h2>
        <div className="grid three">
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Tareas terminadas</p>
            <strong style={{ fontSize: '2rem' }}>{summary.completed}</strong>
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Tareas retrasadas</p>
            <strong style={{ fontSize: '2rem', color: 'var(--danger)' }}>{summary.delayed}</strong>
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Bloqueadas</p>
            <strong style={{ fontSize: '2rem', color: 'var(--warning)' }}>{summary.atRisk}</strong>
          </div>
        </div>
        <UseCaseChips cases={['CU8', 'CU13', 'CU17', 'CU18']} />
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title">Flujos activos (Diseñador / Administrador)</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {flowInstances.length} ejecuciones
          </span>
        </div>
        <div className="grid two">
          {flowInstances.map((instance) => {
            const stageEntries =
              instance.stageStatuses?.length && instance.stageStatuses.length > 0
                ? instance.stageStatuses.map((stage) => ({
                    id: stage.id,
                    status: stage.status,
                    progress: stage.progress,
                  }))
                : instance.stageStatus
                  ? Object.entries(instance.stageStatus).map(([id, stage]) => ({
                      id,
                      status: stage.status,
                      progress: stage.progress,
                    }))
                  : [];
            return (
              <article
                key={instance.id}
                style={{
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                }}
              >
                <strong>{instance.name}</strong>
                <p style={{ margin: '0.35rem 0', color: 'var(--text-muted)' }}>
                  Avance {instance.progress}% · Salud {instance.health}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {stageEntries.map((stage) => (
                    <span key={stage.id} className={`status-pill ${stage.status}`}>
                      {stage.status} {stage.progress}%
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
        <UseCaseChips cases={['CU5', 'CU19']} />
      </section>

      <section className="card">
        <h2 className="section-title">Semáforo de tareas en ejecución</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {tasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              style={{
                minWidth: '220px',
                borderRadius: 'var(--radius)',
                padding: '0.85rem',
                border: '1px dashed var(--border-soft)',
              }}
            >
              <small style={{ color: 'var(--text-muted)' }}>{task.title}</small>
              <div
                style={{
                  marginTop: '0.4rem',
                  fontWeight: 600,
                  color:
                    trafficLight(task.deadline, task.status) === 'red'
                      ? 'var(--danger)'
                      : trafficLight(task.deadline, task.status) === 'yellow'
                        ? 'var(--warning)'
                        : 'var(--success)',
                }}
              >
                Semáforo {trafficLight(task.deadline, task.status)}
              </div>
            </div>
          ))}
        </div>
        <UseCaseChips cases={['CU13', 'CU15']} />
      </section>

      <section className="card">
        <h2 className="section-title">Tendencia de rendimiento</h2>
        {metrics.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Sin datos de rendimiento aún.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <span className="tag" style={{ background: 'rgba(76, 175, 80, 0.15)', color: 'var(--success)' }}>
                Completadas
              </span>
              <span className="tag" style={{ background: 'rgba(245, 166, 35, 0.15)', color: 'var(--warning)' }}>
                Retrasadas
              </span>
            </div>
            {(() => {
              const maxValue = Math.max(...metrics.map((m) => m.completed + m.delayed), 1);
              return (
                <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-end',
                minHeight: '160px',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                background: 'linear-gradient(180deg, rgba(12,30,66,0.04), rgba(12,30,66,0.02))',
              }}
            >
              {metrics.map((metric) => {
                const completedHeight = Math.max((metric.completed / maxValue) * 120, 4);
                const delayedHeight = Math.max((metric.delayed / maxValue) * 120, 2);
                return (
                  <div key={metric.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.15rem', minHeight: '120px' }}>
                      <div
                        style={{
                          width: '14px',
                          height: `${completedHeight}px`,
                          borderRadius: '10px',
                          background: 'linear-gradient(180deg, #4caf50, #2e7d32)',
                          boxShadow: '0 6px 12px rgba(46, 125, 50, 0.18)',
                        }}
                        title={`Completadas: ${metric.completed}`}
                      />
                      <div
                        style={{
                          width: '14px',
                          height: `${delayedHeight}px`,
                          borderRadius: '10px',
                          background: 'linear-gradient(180deg, #f5a623, #e07a00)',
                          boxShadow: '0 6px 12px rgba(224, 122, 0, 0.2)',
                        }}
                        title={`Retrasadas: ${metric.delayed}`}
                      />
                    </div>
                    <small style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                      {new Date(metric.date).toLocaleDateString()}
                    </small>
                  </div>
                );
              })}
            </div>
              );
            })()}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">Alertas generadas</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-soft)',
                paddingBottom: '0.75rem',
              }}
            >
              <span>{notification.message}</span>
              <small style={{ color: 'var(--text-muted)' }}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </small>
            </li>
          ))}
        </ul>
        <UseCaseChips cases={['CU13', 'CU18']} />
      </section>
    </div>
  );
};
