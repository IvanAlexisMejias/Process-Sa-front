import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { trafficLight } from '@/utils/dates';
import { UseCaseChips } from '@/components/common/UseCaseChips';
import type { TaskStatus } from '@/types/domain';

export const OverviewPage = () => {
  const { tasks, flowInstances, notifications, units, users } = useAppContext();

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
                  Avance {instance.progress}% · Estado {instance.state.replace('_', ' ')}
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
        <h2 className="section-title">Rendimiento general</h2>
        <div className="grid three">
          <article>
            <small style={{ color: 'var(--text-muted)' }}>Total tareas</small>
            <h3 style={{ margin: '0.35rem 0' }}>{tasks.length}</h3>
          </article>
          <article>
            <small style={{ color: 'var(--text-muted)' }}>Completadas</small>
            <h3 style={{ margin: '0.35rem 0', color: 'var(--success)' }}>
              {tasks.filter((t) => t.status === 'completed').length}
            </h3>
          </article>
          <article>
            <small style={{ color: 'var(--text-muted)' }}>Bloqueadas / retrasadas</small>
            <h3 style={{ margin: '0.35rem 0', color: 'var(--danger)' }}>
              {tasks.filter(
                (t) => t.status === 'blocked' || (t.status !== 'completed' && new Date(t.deadline) < new Date()),
              ).length}
            </h3>
          </article>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Rendimiento por unidad</h2>
        {units.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Sin unidades.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {units.map((unit) => {
              const unitTasks = tasks.filter((t) => t.ownerUnitId === unit.id || t.flowInstance?.ownerUnitId === unit.id);
              const completed = unitTasks.filter((t) => t.status === 'completed').length;
              const total = unitTasks.length || 1;
              const pct = Math.round((completed / total) * 100);
              const pctLabel = `${pct}%`;
              return (
                <div
                  key={unit.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr 60px',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <strong>{unit.name}</strong>
                    <small style={{ color: 'var(--text-muted)', display: 'block' }}>
                      {completed}/{total} completadas
                    </small>
                  </div>
                  <div style={{ width: '100%', background: 'var(--bg-muted)', borderRadius: 12, overflow: 'hidden', height: '12px' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #43c6ac, #1b63d8)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ justifySelf: 'end', color: 'var(--text-muted)' }}>{pctLabel}</span>
                </div>
              );
            })}
          </div>
        )}
        <UseCaseChips cases={['CU17', 'CU18']} />
      </section>

      <section className="card">
        <h2 className="section-title">Top individual</h2>
        {users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Sin usuarios.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(() => {
              const leaderboard = users
                .map((u) => ({
                  user: u,
                  completed: tasks.filter((t) => t.ownerId === u.id && t.status === 'completed').length,
                }))
                .sort((a, b) => b.completed - a.completed)
                .slice(0, 5);
              const maxCompleted = Math.max(...leaderboard.map((l) => l.completed), 1);

              return leaderboard.map(({ user, completed }, idx) => {
                const pct = Math.min(100, (completed / maxCompleted) * 100);
                return (
                  <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 60px', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>
                    <div>
                      <strong>{user.fullName}</strong>
                      <div style={{ width: '100%', background: 'var(--bg-muted)', borderRadius: 999, overflow: 'hidden', height: '10px', marginTop: '0.3rem' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #4caf50, #2e7d32)' }} />
                      </div>
                      <small style={{ display: 'block', color: 'var(--text-muted)' }}>{user.email}</small>
                    </div>
                    <span style={{ color: 'var(--success)', justifySelf: 'end' }}>{completed} ✓</span>
                  </div>
                );
              });
            })()}
          </div>
        )}
        <UseCaseChips cases={['CU8', 'CU13']} />
      </section>

      <section className="card">
        <h2 className="section-title">Distribución por estado</h2>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay tareas aún.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {(['completed', 'in_progress', 'blocked', 'pending', 'returned'] as TaskStatus[]).map((status) => {
              const count = tasks.filter((t) => t.status === status).length;
              const pct = Math.round((count / tasks.length) * 100);
              const color =
                status === 'completed'
                  ? 'linear-gradient(90deg,#4caf50,#2e7d32)'
                  : status === 'blocked'
                    ? 'linear-gradient(90deg,#ff6b6b,#c62828)'
                    : status === 'in_progress'
                      ? 'linear-gradient(90deg,#1b63d8,#43c6ac)'
                      : 'linear-gradient(90deg,#bfc6d4,#9aa3b5)';
              return (
                <div key={status} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 50px', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</strong>
                  <div style={{ width: '100%', height: '12px', borderRadius: 12, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ color: 'var(--text-muted)', justifySelf: 'end' }}>
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <UseCaseChips cases={['CU13']} />
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
