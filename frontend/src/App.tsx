import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, Check, ChevronDown, CircleAlert,
  LoaderCircle, Mail, MoreHorizontal, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound,
  Users, X,
} from "lucide-react";
import { usersApi, User, UserInput } from "./users";
import { useUserView } from "./store";

type Notice = { type: "success" | "error"; text: string } | null;

export default function App() {
  const queryClient = useQueryClient();
  const { search, page, pageSize, setSearch, setPage, setPageSize } = useUserView();
  const [searchInput, setSearchInput] = useState(search);
  const [editing, setEditing] = useState<User | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const usersQuery = useQuery({
    queryKey: ["users", { page, pageSize, search }],
    queryFn: () => usersApi.list(page, pageSize, search),
    placeholderData: (previous) => previous,
  });
  const data = usersQuery.data;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearch]);
  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages) setPage(data.totalPages);
  }, [data, page, setPage]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: UserInput }) => id ? usersApi.update(id, input) : usersApi.create(input),
    onSuccess: (_data, variables) => {
      if (!variables.id) { setSearchInput(""); setSearch(""); setPage(1); }
      refresh();
      setEditing(undefined);
      setNotice({ type: "success", text: variables.id ? "Los cambios se guardaron." : "Usuario creado correctamente." });
    },
    onError: (error) => setNotice({ type: "error", text: error.message }),
  });
  const deleteMutation = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      refresh();
      setDeleting(null);
      setNotice({ type: "success", text: "Usuario eliminado." });
    },
    onError: (error) => { setDeleting(null); setNotice({ type: "error", text: error.message }); },
  });

  const rangeStart = data?.total ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, data?.total ?? 0);
  const initial = usersQuery.isPending && !data;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand flex items-center" href="#inicio" aria-label="Cymetria, inicio">
          <span className="brand-symbol"><span /><span /><span /><span /></span>
          <span>cymetria<span className="brand-dot">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-switch"><span className="workspace-icon">C</span><span className="workspace-name">Cymetria Studio<small>Plan profesional</small></span><ChevronDown size={15} /></button>
        <div className="nav-label">MENÚ PRINCIPAL</div>
        <nav className="side-nav">
          
          <a className="active" href="#usuarios"><Users size={17} />Usuarios<span className="nav-count">{data?.total ?? "—"}</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-note"><ShieldCheck size={17} /><span>Conexión segura<small>Datos protegidos</small></span><span className="online-dot" /></div>
          <div className="profile"><div className="avatar avatar-admin">AC</div><span className="profile-name">Admin Cymetria<small>Administrador</small></span><MoreHorizontal size={17} /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Gestión</span><span className="crumb-slash">/</span><strong>Usuarios</strong></div>
          <div className="topbar-right"><span className="live-indicator"><i /> Sistema operativo</span><div className="avatar avatar-admin top-avatar">AC</div></div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> ADMINISTRACIÓN</div>
              <h1>Usuarios</h1>
              <p className="subtitle">Administra los miembros y sus accesos desde un solo lugar.</p>
            </div>
            <button className="button button-primary" onClick={() => { setEditing(null); saveMutation.reset(); }}><Plus size={17} strokeWidth={2.4} /> Nuevo usuario</button>
          </div>

          <section className="stats-grid" aria-label="Resumen de usuarios">
            <article className="stat-card"><div className="stat-icon users-icon"><Users size={19} /></div><div className="stat-label">Total de usuarios</div><div className="stat-value">{usersQuery.isPending && !data ? <span className="stat-loading" /> : data?.total ?? 0}</div><div className="stat-foot">Registros en el directorio</div></article>
            <article className="stat-card"><div className="stat-icon active-icon"><Check size={19} /></div><div className="stat-label">Estado del directorio</div><div className="stat-value stat-state"><span className="status-pill"><i /> Activo</span></div><div className="stat-foot">Base de datos conectada</div></article>
            <article className="stat-card stat-card-accent"><div className="stat-orbit orbit-one" /><div className="stat-orbit orbit-two" /><div className="stat-label">Acciones rápidas</div><div className="stat-quick-title">Mantén todo al día</div><div className="stat-foot stat-accent-foot">Exporta el directorio en un clic <ArrowDownToLine size={14} /></div></article>
          </section>

          <section className="table-card">
            <div className="table-card-heading"><div><div className="table-title-row"><h2>Directorio de usuarios</h2><span className="count-badge">{data?.total ?? 0}</span></div><p>Consulta y gestiona las cuentas registradas.</p></div><button className="button button-secondary" onClick={() => window.location.assign(usersApi.exportUrl(search))}><ArrowDownToLine size={16} /> Exportar CSV</button></div>
            <div className="table-toolbar">
              <label className="search-box"><Search size={17} /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Buscar por nombre o correo..." aria-label="Buscar usuarios" />{searchInput && <button className="clear-search" aria-label="Limpiar búsqueda" onClick={() => setSearchInput("")}><X size={14} /></button>}</label>
              <div className="table-meta"><span className="filter-dot" /> Todos los usuarios <span className="meta-divider">·</span> Actualizado en tiempo real</div>
            </div>

            <div className="table-wrap">
              <table>
                <thead><tr><th>USUARIO</th><th>CORREO ELECTRÓNICO</th><th>ID DE USUARIO</th><th className="actions-heading">ACCIONES</th></tr></thead>
                <tbody>
                  {initial && Array.from({ length: 5 }, (_, index) => <tr className="skeleton-row" key={index}><td><span className="skeleton-user"><i /><b /></span></td><td><i className="skeleton-line" /></td><td><i className="skeleton-line short" /></td><td /></tr>)}
                  {!initial && usersQuery.isError && <tr><td colSpan={4}><div className="state-panel error-panel"><span className="state-icon error-state-icon"><CircleAlert size={20} /></span><strong>No pudimos cargar los usuarios</strong><span>{usersQuery.error.message}</span><button className="button button-secondary" onClick={() => usersQuery.refetch()}>Intentar de nuevo</button></div></td></tr>}
                  {!initial && !usersQuery.isError && data?.data.length === 0 && <tr><td colSpan={4}><div className="state-panel"><span className="state-icon"><Users size={20} /></span><strong>{search ? "No encontramos resultados" : "Aún no hay usuarios"}</strong><span>{search ? `No hay usuarios que coincidan con “${search}”.` : "Crea el primer usuario para empezar a organizar tu directorio."}</span>{search ? <button className="text-button" onClick={() => { setSearchInput(""); setSearch(""); }}>Limpiar búsqueda</button> : <button className="button button-primary" onClick={() => setEditing(null)}><Plus size={16} /> Crear usuario</button>}</div></td></tr>}
                  {!initial && !usersQuery.isError && data?.data.map((user) => <tr key={user.id}>
                    <td><div className="user-cell flex items-center"><div className={`avatar rounded-full ${avatarTone(user.name)}`}>{initials(user.name)}</div><div className="user-identity"><strong>{user.name}</strong><span>Miembro</span></div></div></td>
                    <td><span className="email-cell"><Mail size={15} />{user.email}</span></td>
                    <td><code className="id-code">{user.id}</code></td>
                    <td><div className="row-actions"><button className="icon-button edit-button" aria-label={`Editar ${user.name}`} title="Editar usuario" onClick={() => { setEditing(user); saveMutation.reset(); }}><Pencil size={15} /></button><button className="icon-button delete-button" aria-label={`Eliminar ${user.name}`} title="Eliminar usuario" onClick={() => setDeleting(user)}><Trash2 size={15} /></button></div></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <footer className="table-footer"><span>Mostrando <strong>{rangeStart}–{rangeEnd}</strong> de <strong>{data?.total ?? 0}</strong> usuarios</span><div className="pagination"><label className="page-size-label">Filas <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label><button className="page-button" aria-label="Página anterior" disabled={page <= 1 || usersQuery.isFetching} onClick={() => setPage(page - 1)}><ArrowLeft size={15} /></button><span className="page-indicator"><strong>{data?.totalPages ? page : 0}</strong><span>/</span>{data?.totalPages ?? 0}</span><button className="page-button" aria-label="Página siguiente" disabled={!data || page >= data.totalPages || usersQuery.isFetching} onClick={() => setPage(page + 1)}><ArrowRight size={15} /></button></div></footer>
          </section>
          <div className="page-caption flex items-center"><span>© 2025 Cymetria Studio</span><span>Gestión segura de información <ShieldCheck size={13} /></span></div>
        </div>
      </main>

      {editing !== undefined && <UserDialog user={editing} busy={saveMutation.isPending} error={saveMutation.error?.message} onClose={() => { setEditing(undefined); saveMutation.reset(); }} onSave={(input) => saveMutation.mutate({ id: editing?.id, input })} />}
      {deleting && <ConfirmDialog user={deleting} busy={deleteMutation.isPending} onClose={() => setDeleting(null)} onConfirm={() => deleteMutation.mutate(deleting.id)} />}
      {notice && <div className={`toast ${notice.type === "error" ? "toast-error" : "toast-success"}`} role="status"><span>{notice.type === "error" ? <CircleAlert size={17} /> : <Check size={17} />}</span>{notice.text}<button aria-label="Cerrar aviso" onClick={() => setNotice(null)}><X size={15} /></button></div>}
    </div>
  );
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}
function avatarTone(name: string) {
  const tones = ["avatar-lilac", "avatar-blue", "avatar-peach", "avatar-mint", "avatar-pink"];
  return tones[(name.charCodeAt(0) || 0) % tones.length];
}

function UserDialog({ user, busy, error, onClose, onSave }: { user: User | null; busy: boolean; error?: string; onClose: () => void; onSave: (input: UserInput) => void }) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [formError, setFormError] = useState("");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);
  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanName = name.trim(); const cleanEmail = email.trim();
    if (!cleanName || !cleanEmail) return setFormError("Completa ambos campos para continuar.");
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setFormError("Escribe un correo electrónico válido.");
    setFormError(""); onSave({ name: cleanName, email: cleanEmail });
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="user-dialog-title"><div className="dialog-head"><div className="dialog-icon"><UserRound size={19} /></div><button className="icon-button close-dialog" onClick={onClose} aria-label="Cerrar" disabled={busy}><X size={18} /></button></div><h2 id="user-dialog-title">{user ? "Editar usuario" : "Nuevo usuario"}</h2><p className="dialog-subtitle">{user ? "Actualiza la información del miembro." : "Añade una persona al directorio de tu equipo."}</p><form onSubmit={submit} noValidate><label className="form-label">Nombre completo<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. María García" maxLength={120} /></label><label className="form-label">Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@empresa.com" maxLength={254} /></label>{(formError || error) && <div className="form-error"><CircleAlert size={15} />{formError || error}</div>}<div className="dialog-actions"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancelar</button><button className="button button-primary" disabled={busy}>{busy && <LoaderCircle className="spin" size={16} />}{user ? "Guardar cambios" : "Crear usuario"}</button></div></form></section></div>;
}

function ConfirmDialog({ user, busy, onClose, onConfirm }: { user: User; busy: boolean; onClose: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}><section className="dialog confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><div className="dialog-head"><div className="dialog-icon danger-dialog-icon"><Trash2 size={19} /></div><button className="icon-button close-dialog" onClick={onClose} aria-label="Cerrar" disabled={busy}><X size={18} /></button></div><h2 id="delete-title">¿Eliminar este usuario?</h2><p className="dialog-subtitle">Se eliminará <strong>{user.name}</strong> ({user.email}). Esta acción no se puede deshacer.</p><div className="dialog-actions"><button className="button button-secondary" onClick={onClose} disabled={busy}>Cancelar</button><button className="button button-danger" onClick={onConfirm} disabled={busy}>{busy && <LoaderCircle className="spin" size={16} />}Eliminar usuario</button></div></section></div>;
}
