import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useAppContext } from '@/context/AppContext';
import { UseCaseChips } from '@/components/common/UseCaseChips';

export const UnitsPage = () => {
  const { units, users, createUnit, updateUnit } = useAppContext();
  const [form, setForm] = useState({
    name: '',
    parentId: '',
    leadId: '',
  });
  const [editSelection, setEditSelection] = useState({
    unitId: '',
    leadId: '',
    parentId: '',
  });

  const hierarchy = useMemo(
    () => units.filter((unit) => unit.parentId === null || unit.parentId === undefined),
    [units],
  );

  const childrenOf = (parentId: string) => units.filter((unit) => unit.parentId === parentId);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name) return;
    createUnit({
      name: form.name,
      parentId: form.parentId || null,
      leadId: form.leadId || null,
    });
    setForm({ name: '', parentId: '', leadId: '' });
  };

  const handleEdit = (event: FormEvent) => {
    event.preventDefault();
    if (!editSelection.unitId) return;
    updateUnit(editSelection.unitId, {
      name: units.find((u) => u.id === editSelection.unitId)?.name ?? '',
      leadId: editSelection.leadId || null,
      parentId: editSelection.parentId || null,
    });
  };

  return (
    <div className="grid" style={{ gap: '1.25rem' }}>
      <section className="card">
        <h2 className="section-title">Unidades internas</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}
        >
          <input
            placeholder="Nombre de la unidad"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-soft)' }}
            required
          />
          <select
            value={form.parentId}
            onChange={(event) => setForm((prev) => ({ ...prev, parentId: event.target.value }))}
            style={{ padding: '0.75rem', borderRadius: '0.75rem' }}
          >
            <option value="">Unidad raíz</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          <select
            value={form.leadId}
            onChange={(event) => setForm((prev) => ({ ...prev, leadId: event.target.value }))}
            style={{ padding: '0.75rem', borderRadius: '0.75rem' }}
          >
            <option value="">Sin líder asignado</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Crear unidad
          </button>
        </form>
        <UseCaseChips cases={['CU2']} />
      </section>

      <section className="card">
        <h2 className="section-title">Organigrama</h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {hierarchy.map((root) => (
            <div key={root.id} style={{ minWidth: '240px' }}>
              <strong>{root.name}</strong>
              <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                Líder: {users.find((user) => user.id === root.leadId)?.fullName ?? 'Pendiente'}
              </small>
              <ul>
                {childrenOf(root.id).map((child) => (
                  <li key={child.id}>
                    {child.name}{' '}
                    <small style={{ color: 'var(--text-muted)' }}>
                      · {users.find((user) => user.id === child.leadId)?.fullName ?? 'sin líder'}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Asignar líder a una unidad existente</h2>
        <form
          onSubmit={handleEdit}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}
        >
          <select
            value={editSelection.unitId}
            onChange={(event) => {
              const unit = units.find((u) => u.id === event.target.value);
              setEditSelection({
                unitId: event.target.value,
                leadId: unit?.leadId ?? '',
                parentId: unit?.parentId ?? '',
              });
            }}
            style={{ padding: '0.75rem', borderRadius: '0.75rem' }}
          >
            <option value="">Selecciona una unidad</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          <select
            value={editSelection.leadId}
            onChange={(event) => setEditSelection((prev) => ({ ...prev, leadId: event.target.value }))}
            style={{ padding: '0.75rem', borderRadius: '0.75rem' }}
            disabled={!editSelection.unitId}
          >
            <option value="">Sin líder asignado</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>
          <select
            value={editSelection.parentId}
            onChange={(event) => setEditSelection((prev) => ({ ...prev, parentId: event.target.value }))}
            style={{ padding: '0.75rem', borderRadius: '0.75rem' }}
            disabled={!editSelection.unitId}
          >
            <option value="">Unidad raíz</option>
            {units
              .filter((unit) => unit.id !== editSelection.unitId)
              .map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
          </select>
          <button type="submit" className="btn btn-primary" disabled={!editSelection.unitId}>
            Guardar cambios
          </button>
        </form>
        <UseCaseChips cases={['CU2']} />
      </section>
    </div>
  );
};
