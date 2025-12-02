import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { UseCaseChips } from "@/components/common/UseCaseChips";
import { UserAvatar } from "@/components/common/UserAvatar";

const emptyProfile = {
  fullName: "",
  email: "",
  unitId: "",
  password: "",
  avatarColor: "#2684ff",
  title: "",
  phone: "",
  about: "",
};

type Feedback = { type: "success" | "error"; message: string } | null;

export const ProfilePage = () => {
  const { currentUser, roles, units, users, updateProfile, updateUser } = useAppContext();
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [selectedUser, setSelectedUser] = useState("");
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    email: "",
    roleId: "",
    unitId: "",
    password: "",
  });
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [adminFeedback, setAdminFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.fullName,
        email: currentUser.email,
        unitId: currentUser.unitId ?? "",
        password: "",
        avatarColor: currentUser.avatarColor ?? "#2684ff",
        title: currentUser.title ?? "",
        phone: currentUser.phone ?? "",
        about: currentUser.about ?? "",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!selectedUser) return;
    const target = users.find((user) => user.id === selectedUser);
    if (!target) return;
    setAdminForm({
      fullName: target.fullName,
      email: target.email,
      roleId: target.roleId,
      unitId: target.unitId ?? "",
      password: "",
    });
  }, [selectedUser, users]);

  const currentRole = useMemo(
    () => roles.find((role) => role.id === currentUser?.roleId),
    [roles, currentUser?.roleId],
  );
  const isAdmin = currentRole?.key === "ADMIN";

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateProfile({
        fullName: profileForm.fullName,
        email: profileForm.email,
        unitId: profileForm.unitId || null,
        password: profileForm.password || undefined,
        avatarColor: profileForm.avatarColor,
        title: profileForm.title || undefined,
        phone: profileForm.phone || undefined,
        about: profileForm.about || undefined,
      });
      setProfileForm((prev) => ({ ...prev, password: "" }));
      setProfileFeedback({ type: "success", message: "Actualizamos tu perfil correctamente." });
    } catch (error) {
      setProfileFeedback({ type: "error", message: "No se pudo actualizar el perfil." });
    }
  };

  const handleAdminSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser) return;
    try {
      await updateUser({
        id: selectedUser,
        fullName: adminForm.fullName,
        email: adminForm.email,
        roleId: adminForm.roleId,
        unitId: adminForm.unitId,
        password: adminForm.password || undefined,
      });
      setAdminForm((prev) => ({ ...prev, password: "" }));
      setAdminFeedback({ type: "success", message: "El perfil fue actualizado." });
    } catch (error) {
      setAdminFeedback({ type: "error", message: "No fue posible actualizar el usuario." });
    }
  };

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <section className="card">
        <h2 className="section-title">Mi perfil</h2>
        <p className="field-hint">Actualiza tus datos personales y personaliza el avatar.</p>
        {profileFeedback && (
          <div
            role="alert"
            style={{
              borderRadius: "var(--radius)",
              padding: "0.75rem 1rem",
              background: profileFeedback.type === "success" ? "#e3fcef" : "#ffeceb",
              color: profileFeedback.type === "success" ? "#027a48" : "#b71c1c",
              marginBottom: "1rem",
            }}
          >
            {profileFeedback.message}
          </div>
        )}
        <form className="form-grid" onSubmit={handleProfileSubmit} style={{ alignItems: "center" }}>
          <label className="field">
            <span className="field-label">Nombre completo</span>
            <input value={profileForm.fullName} onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
          </label>
          <label className="field">
            <span className="field-label">Correo</span>
            <input type="email" value={profileForm.email} onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))} required />
          </label>
          <label className="field">
            <span className="field-label">Unidad</span>
            <select value={profileForm.unitId} onChange={(event) => setProfileForm((prev) => ({ ...prev, unitId: event.target.value }))}>
              <option value="">Sin unidad</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Contraseña nueva</span>
            <input
              type="password"
              value={profileForm.password}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="•••••••"
            />
            <span className="field-hint">Déjalo vacío si no deseas cambiarla.</span>
          </label>
          <label className="field">
            <span className="field-label">Color de avatar</span>
            <input
              type="color"
              value={profileForm.avatarColor}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, avatarColor: event.target.value }))}
            />
            <span className="field-hint">Se usará en toda la app.</span>
          </label>
          <label className="field">
            <span className="field-label">Cargo / Rol</span>
            <input value={profileForm.title} onChange={(event) => setProfileForm((prev) => ({ ...prev, title: event.target.value }))} />
            <span className="field-hint">Opcional, visible en reportes.</span>
          </label>
          <label className="field">
            <span className="field-label">Contacto</span>
            <input
              value={profileForm.phone}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Teléfono o enlace de contacto"
            />
          </label>
          <label className="field" style={{ gridColumn: "1/-1" }}>
            <span className="field-label">Sobre mí</span>
            <textarea
              value={profileForm.about}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, about: event.target.value }))}
              style={{ minHeight: "120px" }}
              placeholder="Comparte tu enfoque o proyectos actuales."
            />
          </label>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <UserAvatar name={profileForm.fullName} color={profileForm.avatarColor} size={60} />
            <small style={{ color: "var(--text-muted)" }}>Vista previa</small>
          </div>
          <div style={{ gridColumn: "1/-1", textAlign: "right" }}>
            <button className="btn btn-primary" type="submit">
              Guardar cambios
            </button>
          </div>
        </form>
        <UseCaseChips cases={["CU3"]} />
      </section>

      {isAdmin && (
        <section className="card">
          <h2 className="section-title">Editar como administrador</h2>
          <p className="field-hint">Selecciona cualquier usuario para ajustar su rol, unidad o contraseña.</p>
          {adminFeedback && (
            <div
              role="alert"
              style={{
                borderRadius: "var(--radius)",
                padding: "0.75rem 1rem",
                background: adminFeedback.type === "success" ? "#e3fcef" : "#ffeceb",
                color: adminFeedback.type === "success" ? "#027a48" : "#b71c1c",
                marginBottom: "1rem",
              }}
            >
              {adminFeedback.message}
            </div>
          )}
          <form className="grid" style={{ gap: "1rem" }} onSubmit={handleAdminSubmit}>
            <label className="field">
              <span className="field-label">Usuario</span>
              <select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)}>
                <option value="">Selecciona un perfil</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </label>
            {selectedUser && (
              <div className="form-grid">
                <label className="field">
                  <span className="field-label">Nombre completo</span>
                  <input value={adminForm.fullName} onChange={(event) => setAdminForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
                </label>
                <label className="field">
                  <span className="field-label">Correo</span>
                  <input type="email" value={adminForm.email} onChange={(event) => setAdminForm((prev) => ({ ...prev, email: event.target.value }))} required />
                </label>
                <label className="field">
                  <span className="field-label">Rol</span>
                  <select value={adminForm.roleId} onChange={(event) => setAdminForm((prev) => ({ ...prev, roleId: event.target.value }))}>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Unidad</span>
                  <select value={adminForm.unitId} onChange={(event) => setAdminForm((prev) => ({ ...prev, unitId: event.target.value }))}>
                    <option value="">Sin unidad</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Contraseña nueva</span>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(event) => setAdminForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Opcional"
                  />
                </label>
                <div style={{ alignSelf: "end" }}>
                  <button className="btn btn-primary" type="submit">
                    Actualizar usuario
                  </button>
                </div>
              </div>
            )}
          </form>
          <UseCaseChips cases={["CU1", "CU4"]} />
        </section>
      )}
    </div>
  );
};
