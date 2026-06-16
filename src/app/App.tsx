import { useState, useEffect } from "react";
import {
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  CalendarRange,
  X,
  Pencil,
  Trash2,
  CalendarDays,
  Archive,
  CheckCircle,
  Settings as SettingsIcon,
  Minimize2,
  Maximize,
  PanelLeft,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Project = {
  id: string;
  name: string;
  color: string;
  startDate: string;
  endDate: string;
  description?: string;
  archived?: boolean;
  completed?: boolean;
};

type DateType = "none" | "due" | "range";

type Task = {
  id: string;
  title: string;
  projectId: string;
  status: "todo" | "done";
  dateType: DateType;
  dueDate: string;
  startDate: string;
  endDate: string;
};

type Event = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  notes?: string;
};

type AppSettings = {
  name: string;
  weekStartsMonday: boolean;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  density: "comfortable" | "compact";
  showTooltips: boolean;
};

const defaultSettings: AppSettings = {
  name: "",
  weekStartsMonday: true,
  dateFormat: "DD/MM/YYYY",
  density: "comfortable",
  showTooltips: true,
};

// ── Constants ────────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  "#D4E157", "#81C784", "#64B5F6", "#FFB74D",
  "#F06292", "#BA68C8", "#4DB6AC", "#FF8A65",
  "#90A4AE", "#A5D6A7",
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ── Version ───────────────────────────────────────────────────────────────────

const CURRENT_VERSION = "1.0.0";

// ── Seed data ────────────────────────────────────────────────────────────────

const seedProjects: Project[] = [];
const seedTasks: Task[] = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string, format: AppSettings["dateFormat"] = "DD/MM/YYYY") {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mon = months[Number(m) - 1];
  const day = Number(d);
  if (format === "YYYY-MM-DD") return `${y}-${m}-${d}`;
  if (format === "MM/DD/YYYY") return `${mon} ${day}`;
  return `${day} ${mon}`;
}

function textForBackground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#1a1a1a' : '#ffffff';
}

function TaskCard({ task, project, todayIso, dateFormat, onToggle, onEdit, onDelete, onProjectClick }: {
  task: Task; project: Project | undefined; todayIso: string; dateFormat: AppSettings["dateFormat"];
  onToggle: () => void; onEdit: () => void; onDelete: () => void; onProjectClick?: () => void;
}) {
  const overdue = task.status !== "done" && (
    (task.dateType === "due" && !!task.dueDate && task.dueDate < todayIso) ||
    (task.dateType === "range" && !!task.endDate && task.endDate < todayIso)
  );
  return (
    <div className="bg-card rounded-2xl border border-border group p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="mt-0.5 size-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors"
          style={task.status === "done" ? { backgroundColor: "#E8F5E9", borderColor: "#4CAF50" } : overdue ? { borderColor: "var(--destructive)", backgroundColor: "white" } : { borderColor: "var(--border)", backgroundColor: "white" }}
        >
          {task.status === "done" && <span className="text-[9px] font-bold" style={{ color: "#2E7D32" }}>✓</span>}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-base font-medium mb-2 ${task.status === "done" ? "line-through text-muted-foreground" : overdue ? "text-destructive" : "text-foreground"}`}>{task.title}</p>
          {project && (
            <div
              className={`flex items-center gap-1.5 mb-1.5 max-w-full ${onProjectClick ? "cursor-pointer hover:opacity-70 transition-opacity" : ""}`}
              onClick={onProjectClick}
            >
              <div className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
              <span className="text-sm text-muted-foreground truncate">{project.name}</span>
            </div>
          )}
          {task.dateType !== "none" && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <CalendarDays className="size-3.5 text-muted-foreground flex-shrink-0" />
              <span className={`text-sm ${overdue ? "text-destructive" : "text-muted-foreground"}`}>{taskDateLabel(task, overdue, dateFormat)}</span>
            </div>
          )}
          {overdue ? (
            <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium bg-destructive/15 text-destructive">Overdue</span>
          ) : task.status === "done" ? (
            <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>Done</span>
          ) : (
            <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium bg-muted text-muted-foreground">To Do</span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
          <button onClick={onEdit} className="p-1 hover:bg-muted rounded"><Pencil className="size-3.5 text-muted-foreground" /></button>
          <button onClick={onDelete} className="p-1 hover:bg-muted rounded"><Trash2 className="size-3.5 text-destructive" /></button>
        </div>
      </div>
    </div>
  );
}

function taskDateLabel(task: Task, overdue = false, format: AppSettings["dateFormat"] = "DD/MM/YYYY") {
  if (task.dateType === "due" && task.dueDate) return overdue ? `Was due on ${fmtDate(task.dueDate, format)}` : `Due ${fmtDate(task.dueDate, format)}`;
  if (task.dateType === "range" && task.startDate && task.endDate)
    return `${fmtDate(task.startDate, format)} – ${fmtDate(task.endDate, format)}`;
  return "No date";
}

function Tooltip({ label, children, enabled = true }: { label: string; children: React.ReactNode; enabled?: boolean }) {
  if (!enabled) return <>{children}</>;
  return (
    <div className="relative group/tooltip inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs font-medium rounded bg-foreground text-background whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
        {label}
      </span>
    </div>
  );
}

function daysRemaining(endDate: string | undefined): { label: string; warn: boolean } | null {
  if (!endDate) return null;
  const end = new Date(endDate); end.setHours(0, 0, 0, 0);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.round((end.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: "Overdue", warn: true };
  if (diff === 0) return { label: "Due today", warn: true };
  if (diff === 1) return { label: "1 day left", warn: false };
  return { label: `${diff} days left`, warn: false };
}

// ── Empty form factories ──────────────────────────────────────────────────────

const emptyProjectForm = () => ({ name: "", color: COLOR_OPTIONS[0], startDate: "", endDate: "", description: "" });
const emptyTaskForm = (projectId = "") => ({
  title: "", projectId, status: "todo" as Task["status"],
  dateType: "none" as DateType, dueDate: "", startDate: "", endDate: "",
});

const emptyEventForm = (startDate = "") => ({ title: "", startDate, endDate: startDate, notes: "" });

// ── App ───────────────────────────────────────────────────────────────────────

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => loadStored('planner:projects', seedProjects));
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadStored<any[]>('planner:tasks', seedTasks).map(t => ({
      ...t,
      status: t.status === "completed" ? "done" : t.status === "pending" || t.status === "in-progress" ? "todo" : t.status,
    }))
  );
  const [events, setEvents] = useState<Event[]>(() => loadStored('planner:events', []));

  useEffect(() => { localStorage.setItem('planner:projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('planner:tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('planner:events', JSON.stringify(events)); }, [events]);

  // Update check
  const [updateAvailable, setUpdateAvailable] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    fetch('https://raw.githubusercontent.com/boughstudio/Rone/main/version.json', { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (data.version && data.version !== CURRENT_VERSION) setUpdateAvailable(data.version); })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
  }, []);

  // Settings (must be before calendar — calFirstOffset/calWeekDays depend on settings.weekStartsMonday)
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...defaultSettings, ...loadStored("planner_settings", {}) }));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmImport, setConfirmImport] = useState<{ data: { projects: Project[]; tasks: Task[]; events: Event[] } } | null>(null);

  // All-projects expanded view
  const [allProjectsOpen, setAllProjectsOpen] = useState(false);
  const [allProjectsTab, setAllProjectsTab] = useState<"active" | "completed" | "archived">("active");
  const [allProjectsSearch, setAllProjectsSearch] = useState("");

  // Responsive breakpoint tracking for animated grid transitions
  const [isLg, setIsLg] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => { localStorage.setItem('planner_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSettingsOpen(false); setConfirmImport(null); setAllProjectsOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const check = () => setIsLg(window.innerWidth >= 1024);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Calendar
  const [calDate, setCalDate] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const calYear = calDate.getFullYear();
  const calMonthIdx = calDate.getMonth();
  const calMonthLabel = `${monthNames[calMonthIdx]} ${calYear}`;
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();
  const calFirstOffset = settings.weekStartsMonday
    ? (new Date(calYear, calMonthIdx, 1).getDay() + 6) % 7
    : new Date(calYear, calMonthIdx, 1).getDay();
  const calWeekDays = settings.weekStartsMonday
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const prevMonth = () => setCalDate(new Date(calYear, calMonthIdx - 1, 1));
  const nextMonth = () => setCalDate(new Date(calYear, calMonthIdx + 1, 1));
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");
  const [weekOffset, setWeekOffset] = useState(0);
  const [calFullView, setCalFullView] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const selectedDayIso = selectedDay !== null ? `${calYear}-${String(calMonthIdx + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}` : "";

  // Task table filter
  const [taskFilter, setTaskFilter] = useState<"all" | "todo" | "done" | "overdue" | "events">("all");

  // Project panel (from task row click)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Stats panel
  const [statsPanel, setStatsPanel] = useState<"due" | "overdue" | "ending" | "proj-overdue" | "events" | null>(null);

  // Event panel
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Project search
  const [projectSearch, setProjectSearch] = useState("");

  // Dropdown menus
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<{ type: "project" | "task" | "event"; id: string; label: string } | null>(null);

  // ── Project modal ──
  type ProjModalMode = "create" | "edit";
  const [projModal, setProjModal] = useState<{ open: boolean; mode: ProjModalMode; id: string | null }>({ open: false, mode: "create", id: null });
  const [projForm, setProjForm] = useState(emptyProjectForm());

  const openCreateProject = () => { setProjForm(emptyProjectForm()); setProjModal({ open: true, mode: "create", id: null }); };
  const openEditProject = (p: Project) => { setProjForm({ name: p.name, color: p.color, startDate: p.startDate, endDate: p.endDate, description: p.description ?? "" }); setProjModal({ open: true, mode: "edit", id: p.id }); setOpenMenuId(null); };
  const closeProjModal = () => setProjModal(m => ({ ...m, open: false }));

  const saveProjModal = () => {
    if (!projForm.name.trim()) return;
    if (projModal.mode === "create") {
      setProjects(prev => [...prev, { id: Date.now().toString(), name: projForm.name.trim(), color: projForm.color, startDate: projForm.startDate, endDate: projForm.endDate, description: projForm.description }]);
    } else {
      setProjects(prev => prev.map(p => p.id === projModal.id ? { ...p, ...projForm, name: projForm.name.trim() } : p));
    }
    closeProjModal();
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    setOpenMenuId(null);
  };

  const archiveProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, archived: true, completed: false } : p));
    setOpenMenuId(null);
  };

  const unarchiveProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, archived: false } : p));
  };

  const completeProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, completed: true, archived: false } : p));
    setOpenMenuId(null);
  };

  const uncompleteProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, completed: false } : p));
  };

  // ── Task modal ──
  type TaskModalMode = "create" | "edit";
  const [taskModal, setTaskModal] = useState<{ open: boolean; mode: TaskModalMode; id: string | null }>({ open: false, mode: "create", id: null });
  const [taskForm, setTaskForm] = useState(emptyTaskForm());
  const [taskModalShowProjectSelect, setTaskModalShowProjectSelect] = useState(true);

  // ── Event modal ──
  const [eventModal, setEventModal] = useState<{ open: boolean; mode: "create" | "edit"; id: string | null }>({ open: false, mode: "create", id: null });
  const [eventForm, setEventForm] = useState(emptyEventForm());

  const openCreateEvent = (startDate = "") => { setEventForm(emptyEventForm(startDate)); setEventModal({ open: true, mode: "create", id: null }); };
  const openEditEvent = (e: Event) => { setEventForm({ title: e.title, startDate: e.startDate, endDate: e.endDate, notes: e.notes ?? "" }); setEventModal({ open: true, mode: "edit", id: e.id }); };
  const closeEventModal = () => setEventModal(m => ({ ...m, open: false }));
  const saveEventModal = () => {
    if (!eventForm.title.trim()) return;
    const end = eventForm.endDate || eventForm.startDate;
    if (eventModal.mode === "create") {
      setEvents(prev => [...prev, { id: Date.now().toString(), title: eventForm.title.trim(), startDate: eventForm.startDate, endDate: end, notes: eventForm.notes }]);
    } else {
      setEvents(prev => prev.map(e => e.id === eventModal.id ? { ...e, title: eventForm.title.trim(), startDate: eventForm.startDate, endDate: end, notes: eventForm.notes } : e));
    }
    closeEventModal();
  };
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const openCreateTask = (projectId: string, dueDate?: string) => { setTaskForm({ ...emptyTaskForm(projectId), ...(dueDate ? { dateType: "due" as DateType, dueDate } : {}) }); setTaskModalShowProjectSelect(!projectId); setTaskModal({ open: true, mode: "create", id: null }); };
  const openEditTask = (t: Task) => { setTaskForm({ title: t.title, projectId: t.projectId, status: t.status, dateType: t.dateType, dueDate: t.dueDate, startDate: t.startDate, endDate: t.endDate }); setTaskModalShowProjectSelect(true); setTaskModal({ open: true, mode: "edit", id: t.id }); };
  const closeTaskModal = () => setTaskModal(m => ({ ...m, open: false }));

  const saveTaskModal = () => {
    if (!taskForm.title.trim()) return;
    if (taskModalShowProjectSelect && !taskForm.projectId) return;
    if (taskModal.mode === "create") {
      setTasks(prev => [...prev, { id: Date.now().toString(), ...taskForm, title: taskForm.title.trim() }]);
    } else {
      setTasks(prev => prev.map(t => t.id === taskModal.id ? { ...t, ...taskForm, title: taskForm.title.trim() } : t));
    }
    closeTaskModal();
  };

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const requestDeleteProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    setOpenMenuId(null);
    setConfirmDelete({ type: "project", id, label: proj?.name ?? "this project" });
  };
  const requestDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setConfirmDelete({ type: "task", id, label: task?.title ?? "this task" });
  };
  const requestDeleteEvent = (id: string) => {
    const event = events.find(e => e.id === id);
    setConfirmDelete({ type: "event", id, label: event?.title ?? "this event" });
  };
  const executeDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "project") {
      deleteProject(confirmDelete.id);
      if (selectedProjectId === confirmDelete.id) setSelectedProjectId(null);
    } else if (confirmDelete.type === "task") {
      deleteTask(confirmDelete.id);
    } else {
      deleteEvent(confirmDelete.id);
      if (selectedEventId === confirmDelete.id) setSelectedEventId(null);
    }
    setConfirmDelete(null);
  };

  // ── Settings helpers ──
  const updateSettings = (patch: Partial<AppSettings>) => setSettings(s => ({ ...s, ...patch }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ projects, tasks, events }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rone-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.tasks)) throw new Error("Invalid format");
        setConfirmImport({ data: { projects: parsed.projects, tasks: parsed.tasks, events: parsed.events ?? [] } });
      } catch {
        setImportError("Could not read file — make sure it's a valid Planner backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const executeImport = () => {
    if (!confirmImport) return;
    setProjects(confirmImport.data.projects);
    setTasks(confirmImport.data.tasks);
    setEvents(confirmImport.data.events);
    setConfirmImport(null);
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 3000);
  };

  // ── Date format shorthand ──
  const fmt = (iso: string) => fmtDate(iso, settings.dateFormat);
  const fmtTask = (task: Task, overdue?: boolean) => taskDateLabel(task, overdue, settings.dateFormat);

  // ── Button style constants ──
  const btnPrimary   = "bg-primary text-primary-foreground hover:brightness-90 transition-all";
  const btnSecondary = "bg-card text-foreground hover:bg-muted transition-colors";
  const btnTertiary  = "bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-foreground/40 transition-colors";

  // ── Density helpers ──
  const compact = settings.density === "compact";
  const statsCardCls = compact
    ? "bg-card rounded-xl p-3 lg:p-4 border border-border cursor-pointer hover:border-foreground/20 transition-colors"
    : "bg-card rounded-xl p-4 lg:p-6 border border-border cursor-pointer hover:border-foreground/20 transition-colors";
  const projectCardInnerCls = compact ? "p-2 lg:p-3" : "p-3 lg:p-5";
  const tableRowCellPy = compact ? "py-2" : "py-4";

  // ── Derived ──
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const isOverdue = (p: { endDate: string; completed?: boolean; archived?: boolean }) => !p.completed && !p.archived && !!p.endDate && new Date(p.endDate) < now;
  const activeProjects = projects.filter(p => !p.archived && !p.completed);
  const sortedActiveProjects = [...activeProjects].sort((a, b) => {
    const aOver = isOverdue(a), bOver = isOverdue(b);
    if (aOver !== bOver) return aOver ? -1 : 1;
    if (a.endDate && b.endDate) return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    if (a.endDate) return -1;
    if (b.endDate) return 1;
    return 0;
  });
  const panelProjects = projectSearch
    ? sortedActiveProjects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
    : sortedActiveProjects.slice(0, 3);
  const expandedProjects = projects
    .filter(p => {
      if (allProjectsTab === 'active') return !p.archived && !p.completed;
      if (allProjectsTab === 'completed') return !!p.completed;
      return !!p.archived;
    })
    .filter(p => !allProjectsSearch || p.name.toLowerCase().includes(allProjectsSearch.toLowerCase()));
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const thisWeekDates = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
  const weekStartIso = thisWeekDates[0].toISOString().slice(0, 10);
  const weekEndIso = thisWeekDates[6].toISOString().slice(0, 10);
  const dueThisWeekTasks: Array<{ task: Task; dayLabel: string }> = [];
  const _seenDueIds = new Set<string>();
  const _dowNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  for (const date of thisWeekDates) {
    const iso = date.toISOString().slice(0, 10);
    if (iso < todayIso) continue;
    const dayLabel = iso === todayIso ? "Today" : _dowNames[(date.getDay() + 6) % 7];
    for (const task of tasks) {
      if (_seenDueIds.has(task.id) || task.status === "done") continue;
      if ((task.dateType === "due" && task.dueDate === iso) ||
          (task.dateType === "range" && task.startDate <= iso && iso <= task.endDate)) {
        dueThisWeekTasks.push({ task, dayLabel });
        _seenDueIds.add(task.id);
      }
    }
  }
  const overdueTasks = tasks.filter(t => t.status !== "done" && (
    (t.dateType === "due" && !!t.dueDate && t.dueDate < todayIso) ||
    (t.dateType === "range" && !!t.endDate && t.endDate < todayIso)
  ));
  const projectsEndingThisWeek = activeProjects.filter(p => p.endDate >= weekStartIso && p.endDate <= weekEndIso);
  const overdueProjects = activeProjects.filter(p => isOverdue(p));
  const eventsThisWeek = events.filter(e => e.startDate <= weekEndIso && (e.endDate || e.startDate) >= weekStartIso);

  const showEvents = taskFilter === "all" || taskFilter === "events";

  const calFilteredTasks = tasks.filter(t => {
    if (taskFilter === "events") return false;
    if (taskFilter === "all") return true;
    const isOver = t.status !== "done" && (
      (t.dateType === "due" && !!t.dueDate && t.dueDate < todayIso) ||
      (t.dateType === "range" && !!t.endDate && t.endDate < todayIso)
    );
    if (taskFilter === "overdue") return isOver;
    if (taskFilter === "done") return t.status === "done";
    if (taskFilter === "todo") return t.status === "todo" && !isOver;
    return true;
  });

  const getDateTasks = (day: number) => {
    const iso = `${calYear}-${String(calMonthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return calFilteredTasks.filter(t =>
      (t.dateType === "due" && t.dueDate === iso) ||
      (t.dateType === "range" && t.startDate <= iso && iso <= t.endDate)
    ).map(task => ({ task, project: projects.find(p => p.id === task.projectId) }));
  };

  const getDateEvents = (isoOrDay: string | number) => {
    const iso = typeof isoOrDay === "number"
      ? `${calYear}-${String(calMonthIdx + 1).padStart(2, "0")}-${String(isoOrDay).padStart(2, "0")}`
      : isoOrDay;
    return events.filter(e => e.startDate <= iso && iso <= (e.endDate || e.startDate));
  };


  const viewWeekStart = new Date(weekStart);
  viewWeekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const viewWeekStartIso = viewWeekStart.toISOString().slice(0, 10);
  const viewWeekEnd = new Date(viewWeekStart);
  viewWeekEnd.setDate(viewWeekStart.getDate() + 6);
  const viewWeekEndIso = viewWeekEnd.toISOString().slice(0, 10);

  const viewWeekBaseTasks = tasks
    .filter(t => {
      if (t.dateType === "none") return false;
      const inWeek = (t.dateType === "due" && t.dueDate >= viewWeekStartIso && t.dueDate <= viewWeekEndIso) ||
                     (t.dateType === "range" && t.startDate <= viewWeekEndIso && t.endDate >= viewWeekStartIso);
      const prevOverdue = t.status !== "done" && weekOffset === 0 && (
        (t.dateType === "due" && !!t.dueDate && t.dueDate < viewWeekStartIso) ||
        (t.dateType === "range" && !!t.endDate && t.endDate < viewWeekStartIso)
      );
      return inWeek || prevOverdue;
    })
    .sort((a, b) => {
      const sd = (t: Task) => t.dateType === "due" ? t.dueDate : (t.endDate < viewWeekStartIso ? t.endDate : t.startDate);
      return sd(a).localeCompare(sd(b));
    });

  const viewFilteredTasks = viewWeekBaseTasks.filter(t => {
    if (taskFilter === "events") return false;
    if (taskFilter === "all") return true;
    const isOver = t.status !== "done" && (
      (t.dateType === "due" && !!t.dueDate && t.dueDate < todayIso) ||
      (t.dateType === "range" && !!t.endDate && t.endDate < todayIso)
    );
    if (taskFilter === "overdue") return isOver;
    if (taskFilter === "done") return t.status === "done";
    if (taskFilter === "todo") return t.status === "todo" && !isOver;
    return true;
  });

  const toggleTask = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t));

  const confirmDeleteJSX = confirmDelete ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmDelete(null)}>
      <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-foreground mb-2">Delete {confirmDelete.type}?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          <span className="font-medium text-foreground">"{confirmDelete.label}"</span> will be permanently deleted.
          {confirmDelete.type === "project" && " All tasks in this project will also be deleted."}
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={executeDelete} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  ) : null;

  const projModalJSX = projModal.open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeProjModal}>
      <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">{projModal.mode === "create" ? "New Project" : "Edit Project"}</h2>
          <button onClick={closeProjModal} className="p-1 hover:bg-muted rounded"><X className="size-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Project Name</label>
            <input type="text" value={projForm.name} onChange={e => setProjForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter project name" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea value={projForm.description} onChange={e => setProjForm(f => ({ ...f, description: e.target.value }))} placeholder="Add a description…" rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
              <input type="date" value={projForm.startDate} onChange={e => setProjForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
              <input type="date" value={projForm.endDate} onChange={e => setProjForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Color</label>
            <div className="flex flex-wrap gap-2 items-center">
              {COLOR_OPTIONS.map(color => (
                <button key={color} onClick={() => setProjForm(f => ({ ...f, color }))} className={`size-7 rounded-full transition-transform ${projForm.color === color ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-110"}`} style={{ backgroundColor: color }} />
              ))}
              {!COLOR_OPTIONS.includes(projForm.color) && (
                <div className={`size-7 rounded-full ring-2 ring-offset-2 ring-foreground scale-110`} style={{ backgroundColor: projForm.color }} />
              )}
              <label className="size-7 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground/40 transition-colors relative overflow-hidden">
                <Plus className="size-3.5 text-muted-foreground" />
                <input type="color" value={projForm.color} onChange={e => setProjForm(f => ({ ...f, color: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={closeProjModal} className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={saveProjModal} disabled={!projForm.name.trim()} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-90 transition-all disabled:opacity-40">
            {projModal.mode === "create" ? "Create Project" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const taskModalJSX = taskModal.open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeTaskModal}>
      <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">{taskModal.mode === "create" ? "New Task" : "Edit Task"}</h2>
          <button onClick={closeTaskModal} className="p-1 hover:bg-muted rounded"><X className="size-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Task Name</label>
            <input type="text" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter task name" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {taskModalShowProjectSelect && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Project</label>
              <select value={taskForm.projectId} onChange={e => setTaskForm(f => ({ ...f, projectId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary">
                <option value="" disabled>Select a project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date</label>
            <div className="flex gap-2 mb-3">
              {(["none", "due", "range"] as const).map(dt => (
                <button key={dt} onClick={() => setTaskForm(f => ({ ...f, dateType: dt }))} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${taskForm.dateType === dt ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-muted"}`}>
                  {dt === "none" ? "No date" : dt === "due" ? "Due date" : "Date range"}
                </button>
              ))}
            </div>
            {taskForm.dateType === "due" && (
              <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
            )}
            {taskForm.dateType === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Start</label>
                  <input type="date" value={taskForm.startDate} onChange={e => setTaskForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">End</label>
                  <input type="date" value={taskForm.endDate} onChange={e => setTaskForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={closeTaskModal} className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={saveTaskModal} disabled={!taskForm.title.trim() || (taskModalShowProjectSelect && !taskForm.projectId)} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-90 transition-all disabled:opacity-40">
            {taskModal.mode === "create" ? "Add Task" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const eventModalJSX = eventModal.open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeEventModal}>
      <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">{eventModal.mode === "create" ? "New Event" : "Edit Event"}</h2>
          <button onClick={closeEventModal} className="p-1 hover:bg-muted rounded"><X className="size-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Event Name</label>
            <input type="text" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter event name" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
              <input type="date" value={eventForm.startDate} onChange={e => {
                const s = e.target.value;
                setEventForm(f => ({ ...f, startDate: s, endDate: f.endDate && f.endDate >= s ? f.endDate : s }));
              }} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">End Date</label>
              <input type="date" value={eventForm.endDate} min={eventForm.startDate} onChange={e => setEventForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea value={eventForm.notes} onChange={e => setEventForm(f => ({ ...f, notes: e.target.value }))} placeholder="Add notes…" rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={closeEventModal} className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={saveEventModal} disabled={!eventForm.title.trim() || !eventForm.startDate} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-90 transition-all disabled:opacity-40">
            {eventModal.mode === "create" ? "Create Event" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const confirmImportJSX = confirmImport ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setConfirmImport(null)}>
      <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-foreground mb-2">Replace all data?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This will replace all your current projects, tasks, and events with the imported data. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmImport(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={executeImport} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-90 transition-all">Import</button>
        </div>
      </div>
    </div>
  ) : null;

  const settingsPanelJSX = settingsOpen ? (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} onClick={() => setSettingsOpen(false)}>
      <div className="h-full w-full sm:w-[320px] bg-card flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">Settings</h2>
          <button onClick={() => setSettingsOpen(false)} className="p-1 hover:bg-muted rounded"><X className="size-5 text-muted-foreground" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* Profile */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Profile</p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Your name</label>
              <input
                type="text"
                value={settings.name}
                onChange={e => updateSettings({ name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Data */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Data</p>
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors text-left"
              >
                Export JSON backup
              </button>
              <label className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors text-left cursor-pointer block">
                Import JSON backup
                <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
              </label>
              {importSuccess && (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">Data imported successfully.</p>
              )}
              {importError && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{importError}</p>
              )}
            </div>
          </div>

          {/* Appearance */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Appearance</p>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Density</p>
                <div className="flex bg-background rounded-lg p-1 gap-1">
                  {(["comfortable", "compact"] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateSettings({ density: opt })}
                      className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${settings.density === opt ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Tooltips</p>
                <div className="flex bg-background rounded-lg p-1 gap-1">
                  {([true, false] as const).map(val => (
                    <button
                      key={String(val)}
                      onClick={() => updateSettings({ showTooltips: val })}
                      className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.showTooltips === val ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {val ? "On" : "Off"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Preferences</p>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Week starts on</p>
                <div className="flex bg-background rounded-lg p-1 gap-1">
                  <button
                    onClick={() => updateSettings({ weekStartsMonday: true })}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${settings.weekStartsMonday ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Monday
                  </button>
                  <button
                    onClick={() => updateSettings({ weekStartsMonday: false })}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${!settings.weekStartsMonday ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Sunday
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Date format</p>
                <div className="flex flex-col gap-1 bg-background rounded-lg p-1">
                  {(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => updateSettings({ dateFormat: fmt })}
                      className={`w-full py-1.5 rounded-md text-sm font-medium transition-colors ${settings.dateFormat === fmt ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">About</p>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Rone 1.0.0</p>
              <p className="text-sm text-muted-foreground">
                Built by{" "}
                <a href="https://bough.studio" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                  Bough Studio
                </a>
              </p>
              <p className="text-xs text-muted-foreground">hello@bough.studio</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="size-full flex bg-background overflow-hidden" onClick={() => setOpenMenuId(null)}>
      <main className="flex-1 overflow-auto">

        {/* App bar */}
        <div className="flex items-center justify-between px-4 lg:px-8 py-3 border-b border-border">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 439 100" className="h-5 w-auto">
            <rect style={{fill:"#51d57a"}} x=".36477" y="2.14192" width="23.92904" height="23.92904"/>
            <rect style={{fill:"#51d57a"}} x="36.25833" y="2.14192" width="59.8226" height="23.92904"/>
            <rect style={{fill:"#51d57a"}} x="36.25833" y="38.03548" width="59.8226" height="23.92904"/>
            <rect style={{fill:"#51d57a"}} x="36.25833" y="73.92904" width="59.8226" height="23.92904"/>
            <rect style={{fill:"#51d57a"}} x=".36477" y="38.03548" width="23.92904" height="23.92904"/>
            <rect style={{fill:"#51d57a"}} x=".36477" y="73.92904" width="23.92904" height="23.92904"/>
            <path style={{fill:"#3a3731"}} d="M120.00996,2.14192h47.52562c19.54436,0,36.14563,8.97101,36.14563,28.51537,0,10.97667-5.62459,18.73774-15.66383,23.29409v.39786c7.76651,2.94855,11.77785,8.30063,13.38566,15.80009,2.54524,11.51079.40331,25.29976,3.88053,26.23719v1.47155h-27.57249c-2.68149-1.87486-1.6078-13.65271-3.61892-22.22041-1.73861-7.3632-4.94877-11.11293-13.1186-11.11293h-12.98234v33.33333h-27.98125V2.14192ZM147.99121,44.57707h14.99346c8.02812,0,12.44822-3.47722,12.44822-10.1755,0-6.28951-4.01679-10.3063-12.05036-10.3063h-15.39132v20.4818Z"/>
            <path style={{fill:"#3a3731"}} d="M207.87785,63.85437c0-20.74886,14.7264-36.27643,37.48637-36.27643,22.75452,0,37.21387,15.52758,37.21387,36.27643s-14.45934,36.14563-37.21387,36.14563c-22.75997,0-37.48637-15.39677-37.48637-36.14563ZM256.87501,63.85437c0-11.51079-4.01679-19.27731-11.77785-19.27731-7.76651,0-11.51624,7.76651-11.51624,19.27731,0,11.51624,3.74973,19.27731,11.51624,19.27731,7.76106,0,11.77785-7.76106,11.77785-19.27731Z"/>
            <path style={{fill:"#3a3731"}} d="M313.00647,38.95247h.40331c5.48834-7.494,12.44822-11.51079,21.95335-11.51079,15.80009,0,23.96446,10.57881,23.96446,26.23719v44.1792h-25.29976v-38.02049c0-7.09614-2.94855-11.77785-9.50512-11.77785-6.42577,0-10.31175,5.61914-10.31175,12.98234v36.816h-25.29976V29.58361h24.09527v9.36887Z"/>
            <path style={{fill:"#3a3731"}} d="M365.1266,63.58731c0-20.61805,14.86266-36.27643,36.41269-36.27643,10.70961,0,18.87944,3.47722,25.16896,9.23261,8.30063,7.63026,12.18116,19.81687,11.91411,33.33333h-48.73011c1.477,7.90277,5.76085,12.72073,13.39111,12.72073,4.41465,0,7.63026-1.73861,9.50512-5.09047h24.49858c-1.477,6.15871-6.29496,12.18661-12.98779,16.47046-6.29496,4.01679-13.1186,5.7554-21.82254,5.7554-22.35666,0-37.35012-15.26052-37.35012-36.14563ZM389.89224,56.49117h23.56115c-1.06824-7.63026-5.35208-12.18116-11.37454-12.18116-6.96534,0-10.84587,4.68716-12.18661,12.18116Z"/>
          </svg>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{CURRENT_VERSION}</span>
            <button
              onClick={() => setSettingsOpen(true)}
              className={`p-1.5 rounded-lg transition-colors ${settingsOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <SettingsIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Update banner */}
        {updateAvailable && (
          <div className="flex items-center gap-3 px-4 lg:px-8 py-2.5 bg-amber-50 border-b border-amber-200">
            <span className="text-xs font-medium text-amber-900 whitespace-nowrap flex-shrink-0">
              Rone {updateAvailable} is available
            </span>
            <span className="text-xs text-amber-700 flex-1 text-center whitespace-nowrap">
              Export your data before updating to keep it safe
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={exportData}
                className="text-xs px-3 py-1 rounded-md border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium transition-colors"
              >
                Export data
              </button>
              <button
                onClick={() => window.open('https://github.com/boughstudio/Rone/releases', '_blank')}
                className="text-xs px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
              >
                Download update
              </button>
            </div>
            <button
              onClick={() => setUpdateAvailable(null)}
              className="p-1 rounded hover:bg-amber-100 text-amber-600 hover:text-amber-900 flex-shrink-0 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <div className="p-4 lg:p-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-8 gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-1">{settings.name?.trim() ? `Hello ${settings.name.trim()}` : "Hello"}</h1>
              <p className="text-muted-foreground">Monday, June 8, 2026</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => openCreateTask("")} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap ${btnSecondary}`}>
                <Plus className="size-4" /> New Task
              </button>
              <button onClick={() => openCreateEvent()} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap ${btnTertiary}`}>
                <Plus className="size-4" /> New Event
              </button>
              <button onClick={openCreateProject} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap ${btnPrimary}`}>
                <Plus className="size-4" /> New Project
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-4 lg:mb-6">

            {/* Tasks due this week */}
            <div onClick={() => setStatsPanel("due")} className={statsCardCls}>
              <p className="text-muted-foreground text-sm mb-1">Tasks Due This Week</p>
              <p className="text-3xl font-semibold text-foreground mb-1">{dueThisWeekTasks.length}</p>
              {dueThisWeekTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing due this week</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {dueThisWeekTasks.slice(0, 3).map(({ task, dayLabel }) => {
                    const proj = projects.find(p => p.id === task.projectId);
                    return (
                      <div key={task.id} className="flex items-center gap-1.5">
                        {proj ? (
                          <div className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                        ) : (
                          <div className="size-2 rounded-full flex-shrink-0 border border-border" />
                        )}
                        <span className="text-xs text-muted-foreground truncate flex-1">{task.title}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{dayLabel}</span>
                      </div>
                    );
                  })}
                  {dueThisWeekTasks.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{dueThisWeekTasks.length - 3} more</p>
                  )}
                </div>
              )}
            </div>

            {/* Overdue */}
            <div onClick={() => setStatsPanel("overdue")} className={statsCardCls}>
              <p className="text-muted-foreground text-sm mb-1">Overdue Tasks</p>
              <p className={`text-3xl font-semibold mb-1 ${overdueTasks.length > 0 ? "text-destructive" : "text-foreground"}`}>
                {overdueTasks.length}
              </p>
              {overdueTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">All caught up</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {overdueTasks.slice(0, 3).map(t => {
                    const proj = projects.find(p => p.id === t.projectId);
                    return (
                      <div key={t.id} className="flex items-center gap-1.5">
                        {proj ? (
                          <div className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                        ) : (
                          <div className="size-2 rounded-full flex-shrink-0 border border-border" />
                        )}
                        <span className="text-xs text-muted-foreground truncate">{t.title}</span>
                      </div>
                    );
                  })}
                  {overdueTasks.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{overdueTasks.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

            {/* Projects ending this week */}
            <div onClick={() => setStatsPanel("ending")} className={statsCardCls}>
              <p className="text-muted-foreground text-sm mb-1">Projects Ending This Week</p>
              <p className="text-3xl font-semibold text-foreground mb-1">{projectsEndingThisWeek.length}</p>
              {projectsEndingThisWeek.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deadlines this week</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {projectsEndingThisWeek.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-xs text-muted-foreground truncate">{p.name}</span>
                    </div>
                  ))}
                  {projectsEndingThisWeek.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{projectsEndingThisWeek.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

            {/* Projects overdue */}
            <div onClick={() => setStatsPanel("proj-overdue")} className={statsCardCls}>
              <p className="text-muted-foreground text-sm mb-1">Projects Overdue</p>
              <p className={`text-3xl font-semibold mb-1 ${overdueProjects.length > 0 ? "text-destructive" : "text-foreground"}`}>{overdueProjects.length}</p>
              {overdueProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">All on track</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {overdueProjects.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-xs text-muted-foreground truncate">{p.name}</span>
                    </div>
                  ))}
                  {overdueProjects.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{overdueProjects.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

            {/* Events this week */}
            <div onClick={() => setStatsPanel("events")} className={statsCardCls}>
              <p className="text-muted-foreground text-sm mb-1">Events This Week</p>
              <p className="text-3xl font-semibold text-foreground mb-1">{eventsThisWeek.length}</p>
              {eventsThisWeek.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events this week</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {eventsThisWeek.slice(0, 3).map(e => (
                    <div key={e.id} className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full flex-shrink-0 border border-black" />
                      <span className="text-xs text-muted-foreground truncate">{e.title}</span>
                    </div>
                  ))}
                  {eventsThisWeek.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{eventsThisWeek.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Projects + Calendar */}
          <div
            onClick={() => setOpenMenuId(null)}
            style={isLg ? {
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              alignItems: 'start',
            } : {
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '12px',
              alignItems: 'start',
            }}
          >

            {/* Projects */}
            <div style={isLg ? {
              gridColumn: allProjectsOpen ? 'span 4' : 'span 2',
              display: calFullView ? 'none' : undefined,
              minWidth: 0,
            } : { order: 1, minWidth: 0 }}>
              {(!isLg || allProjectsOpen) ? (
                /* ── Expanded all-projects view ── */
                <div>
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                    <h2 className="text-lg font-semibold text-foreground">Projects</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        placeholder="Search projects…"
                        value={allProjectsSearch}
                        onChange={e => setAllProjectsSearch(e.target.value)}
                        className="min-w-0 flex-1 basis-32 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                      />
                      <div className="flex items-center bg-muted rounded-lg p-1">
                        {(["active", "completed", "archived"] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setAllProjectsTab(tab)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${allProjectsTab === tab ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                      </div>
                      <div className="hidden lg:flex items-center bg-muted rounded-lg p-1">
                        <Tooltip label="Compact view" enabled={settings.showTooltips}>
                          <button onClick={() => setAllProjectsOpen(false)} className="px-2.5 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                            <PanelLeft className="size-4" />
                          </button>
                        </Tooltip>
                        <Tooltip label="Expanded view" enabled={settings.showTooltips}>
                          <button className="px-2.5 py-2 rounded-md transition-colors bg-primary text-primary-foreground shadow-sm">
                            <Maximize className="size-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                    {expandedProjects.length === 0 ? (
                      <div className="lg:col-span-3 py-12 text-center text-muted-foreground text-sm">
                        No {allProjectsTab} projects{allProjectsSearch ? ` matching "${allProjectsSearch}"` : ""}
                      </div>
                    ) : expandedProjects.map(project => {
                      const projTasks = tasks.filter(t => t.projectId === project.id);
                      const doneTasks = projTasks.filter(t => t.status === "done");
                      const todoTasks = projTasks.filter(t => t.status !== "done");
                      const pctDone = projTasks.length ? (doneTasks.length / projTasks.length) * 100 : 0;
                      const isCardOverdue = !project.completed && !project.archived && !!project.endDate && project.endDate < todayIso;
                      const daysBadge = !project.completed && !project.archived ? daysRemaining(project.endDate) : null;
                      return (
                        <div
                          key={project.id}
                          className={`bg-card rounded-xl border border-border overflow-hidden flex flex-col${project.completed ? ' opacity-60' : ''}`}
                          style={isCardOverdue ? { borderLeftWidth: '3px', borderLeftColor: 'var(--destructive)' } : {}}
                        >
                          <div className="p-4 flex flex-col flex-1">
                            {/* Name + color dot + menu */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="size-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                              <span className="font-semibold text-foreground truncate flex-1">{project.name}</span>
                              <div className="relative flex-shrink-0">
                                <button
                                  onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === project.id ? null : project.id); }}
                                  className="p-1 hover:bg-muted rounded"
                                >
                                  <MoreVertical className="size-4 text-muted-foreground" />
                                </button>
                                {openMenuId === project.id && (
                                  <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-40" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => openEditProject(project)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                                      <Pencil className="size-3.5" /> Edit
                                    </button>
                                    {!project.completed && <button onClick={() => completeProject(project.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                                      <CheckCircle className="size-3.5" /> Complete
                                    </button>}
                                    {!project.archived && <button onClick={() => archiveProject(project.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                                      <Archive className="size-3.5" /> Archive
                                    </button>}
                                    {project.completed && <button onClick={() => uncompleteProject(project.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                                      <CheckCircle className="size-3.5" /> Reopen
                                    </button>}
                                    {project.archived && <button onClick={() => unarchiveProject(project.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                                      <Archive className="size-3.5" /> Unarchive
                                    </button>}
                                    <button onClick={() => requestDeleteProject(project.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted">
                                      <Trash2 className="size-3.5" /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Date range + days badge */}
                            {(project.startDate || project.endDate) && (
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-muted-foreground">
                                  {project.startDate && fmt(project.startDate)}
                                  {project.startDate && project.endDate && " – "}
                                  {project.endDate && fmt(project.endDate)}
                                </span>
                                {daysBadge && (
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${daysBadge.warn ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                                    {daysBadge.label}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Progress bar */}
                            <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: `${project.color}33` }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${pctDone}%`, backgroundColor: project.color }} />
                            </div>

                            {/* Task count summary */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-muted-foreground">{doneTasks.length} done · {todoTasks.length} to do</span>
                              <span className="text-xs text-muted-foreground">{Math.round(pctDone)}%</span>
                            </div>

                            {/* Task list */}
                            {projTasks.length > 0 && (
                              <div className="space-y-1 mb-3 border-t border-border pt-3">
                                {[...projTasks].sort((a, b) => {
                                  const ad = a.dateType === "due" ? a.dueDate : a.dateType === "range" ? a.endDate : "";
                                  const bd = b.dateType === "due" ? b.dueDate : b.dateType === "range" ? b.endDate : "";
                                  if (ad && bd) return ad.localeCompare(bd);
                                  if (ad) return -1;
                                  if (bd) return 1;
                                  return 0;
                                }).map(task => {
                                  const taskOverdue = task.status !== "done" && (
                                    (task.dateType === "due" && !!task.dueDate && task.dueDate < todayIso) ||
                                    (task.dateType === "range" && !!task.endDate && task.endDate < todayIso)
                                  );
                                  const forceStrike = !!project.completed;
                                  return (
                                    <div key={task.id} className="flex items-center justify-between group px-1 py-1 rounded-lg hover:bg-muted/50">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <button
                                          onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t))}
                                          className="size-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
                                          style={task.status === "done" ? { backgroundColor: "#E8F5E9", borderColor: "#4CAF50" } : taskOverdue ? { borderColor: "var(--destructive)" } : { borderColor: "var(--border)", backgroundColor: "white" }}
                                        >
                                          {task.status === "done" && <span className="text-[9px] font-bold" style={{ color: "#2E7D32" }}>✓</span>}
                                        </button>
                                        <span className={`text-xs truncate ${forceStrike || task.status === "done" ? "line-through text-muted-foreground" : taskOverdue ? "text-destructive" : "text-foreground"}`}>{task.title}</span>
                                      </div>
                                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                        {!forceStrike && (task.status === "done"
                                          ? <span className="text-xs font-medium" style={{ color: "#4CAF50" }}>Done</span>
                                          : <span className={`text-xs ${taskOverdue ? "text-destructive" : "text-muted-foreground"}`}>{fmtTask(task, taskOverdue)}</span>
                                        )}
                                        <button onClick={() => openEditTask(task)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded">
                                          <Pencil className="size-3 text-muted-foreground" />
                                        </button>
                                        <button onClick={() => requestDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded">
                                          <Trash2 className="size-3 text-destructive" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Notes */}
                            {project.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed mb-3 border-t border-border pt-3">{project.description}</p>
                            )}

                            {/* Add task */}
                            {!project.completed && !project.archived && (
                              <button
                                onClick={() => openCreateTask(project.id)}
                                className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
                              >
                                <Plus className="size-3.5" /> Add task
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ── Normal projects panel ── */
                <>
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <h2 className="text-lg font-semibold text-foreground flex-shrink-0">Projects</h2>
                    <input
                      type="text"
                      placeholder="Search projects…"
                      value={projectSearch}
                      onChange={e => setProjectSearch(e.target.value)}
                      className="min-w-0 flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                    />
                    <div className="hidden lg:flex items-center bg-muted rounded-lg p-1 flex-shrink-0">
                      <Tooltip label="Compact view" enabled={settings.showTooltips}>
                        <button className="px-2.5 py-2 rounded-md transition-colors bg-primary text-primary-foreground shadow-sm">
                          <PanelLeft className="size-4" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Expanded view" enabled={settings.showTooltips}>
                        <button onClick={() => setAllProjectsOpen(true)} className="px-2.5 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                          <Maximize className="size-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {panelProjects.map((project) => {
                      const projectTasks = tasks.filter(t => t.projectId === project.id);
                      const completed = projectTasks.filter(t => t.status === "done").length;
                      const progress = projectTasks.length ? (completed / projectTasks.length) * 100 : 0;
                      return (
                        <div key={project.id} className="bg-card rounded-xl border border-border overflow-hidden">
                          <div className={projectCardInnerCls}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start gap-3">
                                <div className="size-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: project.color }} />
                                <span className="font-medium text-foreground">{project.name}</span>
                                {isOverdue(project) && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/15 text-destructive flex-shrink-0">Overdue</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <button
                                    onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === project.id ? null : project.id); }}
                                    className="p-1 hover:bg-muted rounded"
                                  >
                                    <MoreVertical className="size-4 text-muted-foreground" />
                                  </button>
                                  {openMenuId === project.id && (
                                    <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-40" onClick={e => e.stopPropagation()}>
                                      <button onClick={() => openEditProject(project)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                                        <Pencil className="size-3.5" /> Edit
                                      </button>
                                      <button onClick={() => completeProject(project.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                                        <CheckCircle className="size-3.5" /> Complete
                                      </button>
                                      <button onClick={() => archiveProject(project.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                                        <Archive className="size-3.5" /> Archive
                                      </button>
                                      <button onClick={() => requestDeleteProject(project.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted">
                                        <Trash2 className="size-3.5" /> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            {project.description && (
                              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{project.description}</p>
                            )}

                            {/* Dates + count */}
                            <div className="flex items-center justify-between mb-3">
                              {(project.startDate || project.endDate) ? (
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays className="size-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {project.startDate && fmt(project.startDate)}
                                    {project.startDate && project.endDate && " – "}
                                    {project.endDate && fmt(project.endDate)}
                                  </span>
                                </div>
                              ) : <span />}
                              <span className="text-xs text-muted-foreground">{completed}/{projectTasks.length}</span>
                            </div>

                            <div className="h-2 rounded-full overflow-hidden mb-4" style={{ backgroundColor: `${project.color}33` }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                            </div>

                            {/* Tasks */}
                            {projectTasks.length > 0 && (
                              <div className="space-y-1.5 mb-3">
                                {[...projectTasks].sort((a, b) => {
                                  const ad = a.dateType === "due" ? a.dueDate : a.dateType === "range" ? a.endDate : "";
                                  const bd = b.dateType === "due" ? b.dueDate : b.dateType === "range" ? b.endDate : "";
                                  if (ad && bd) return ad.localeCompare(bd);
                                  if (ad) return -1;
                                  if (bd) return 1;
                                  return 0;
                                }).map(task => {
                                  const taskOverdue = task.status !== "done" && (
                                    (task.dateType === "due" && !!task.dueDate && task.dueDate < todayIso) ||
                                    (task.dateType === "range" && !!task.endDate && task.endDate < todayIso)
                                  );
                                  return (
                                  <div key={task.id} className="flex items-center justify-between group px-1 py-1.5 rounded-lg hover:bg-muted/50">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <button
                                        onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t))}
                                        className="size-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
                                        style={task.status === "done" ? { backgroundColor: "#E8F5E9", borderColor: "#4CAF50" } : taskOverdue ? { borderColor: "var(--destructive)" } : { borderColor: "var(--border)", backgroundColor: "white" }}
                                      >
                                        {task.status === "done" && <span className="text-[9px] font-bold" style={{ color: "#2E7D32" }}>✓</span>}
                                      </button>
                                      <span className={`text-xs truncate ${task.status === "done" ? "line-through text-muted-foreground" : taskOverdue ? "text-destructive" : "text-foreground"}`}>{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                      {task.status === "done"
                                        ? <span className="text-xs font-medium" style={{ color: "#4CAF50" }}>Done</span>
                                        : <span className={`text-xs ${taskOverdue ? "text-destructive" : "text-muted-foreground"}`}>{fmtTask(task, taskOverdue)}</span>
                                      }
                                      <button onClick={() => openEditTask(task)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded">
                                        <Pencil className="size-3 text-muted-foreground" />
                                      </button>
                                      <button onClick={() => requestDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded">
                                        <Trash2 className="size-3 text-destructive" />
                                      </button>
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>
                            )}

                            <button
                              onClick={() => openCreateTask(project.id)}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Plus className="size-3.5" /> Add task
                            </button>
                            {projectTasks.length > 0 && completed === projectTasks.length && (
                              <button
                                onClick={() => completeProject(project.id)}
                                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border border-primary text-black hover:bg-primary/10 transition-colors"
                              >
                                <CheckCircle className="size-3.5" /> All tasks done — Mark as completed
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {activeProjects.length === 0 && (
                      <div className="p-8 bg-card rounded-xl border border-border text-center text-muted-foreground text-sm">
                        No projects yet. Click "New Project" to get started.
                      </div>
                    )}
                    {activeProjects.length > 0 && panelProjects.length === 0 && (
                      <div className="p-8 bg-card rounded-xl border border-border text-center text-muted-foreground text-sm">
                        No projects match "{projectSearch}".
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Calendar */}
            <div style={isLg ? {
              gridColumn: allProjectsOpen ? 'span 1' : calFullView ? 'span 5' : 'span 3',
              minWidth: 0,
            } : { order: 0, minWidth: 0 }}>
            {(isLg && allProjectsOpen) ? (
              /* ── Mini-calendar: inline right column when projects expanded ── */
              <div className="bg-card rounded-xl border border-border p-4 sticky top-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">{calMonthLabel}</span>
                  <div className="flex items-center gap-0.5">
                    <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-md">
                      <ChevronLeft className="size-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-md">
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-1">
                  {calWeekDays.map(d => (
                    <div key={d} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">{d[0]}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-0.5">
                  {Array.from({ length: calFirstOffset }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dayIso = `${calYear}-${String(calMonthIdx + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                    const isToday = dayIso === todayIso;
                    const hasTasks = tasks.some(t =>
                      (t.dateType === "due" && t.dueDate === dayIso) ||
                      (t.dateType === "range" && !!t.startDate && !!t.endDate && t.startDate <= dayIso && t.endDate >= dayIso)
                    );
                    return (
                      <button
                        key={dayNum}
                        onClick={() => { setAllProjectsOpen(false); setSelectedDay(dayNum); }}
                        className={`flex flex-col items-center justify-center h-8 rounded-md text-xs font-medium transition-colors ${isToday ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}
                      >
                        {dayNum}
                        {hasTasks && !isToday && <div className="size-1 rounded-full bg-muted-foreground mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
            <div className="flex flex-col gap-4 lg:gap-6">
            <div className={`bg-card rounded-xl border border-border ${compact ? "p-3 lg:p-4" : "p-4 lg:p-6"}`}>
              <div className={`flex flex-wrap items-center justify-between gap-y-3 ${compact ? "mb-3 lg:mb-4" : "mb-4 lg:mb-6"}`}>
                <h2 className="text-lg font-semibold text-foreground">Calendar <span className="text-sm font-normal text-muted-foreground">· {calendarView === "month" ? "Month" : "Week"}</span></h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-background rounded-lg p-1">
                    <Tooltip label="Month view" enabled={settings.showTooltips}>
                      <button onClick={() => setCalendarView("month")} className={`px-2.5 py-2 rounded-md transition-colors ${calendarView === "month" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        <Grid3x3 className="size-4" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Week view" enabled={settings.showTooltips}>
                      <button onClick={() => setCalendarView("week")} className={`px-2.5 py-2 rounded-md transition-colors ${calendarView === "week" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        <CalendarRange className="size-4" />
                      </button>
                    </Tooltip>
                  </div>
                  <div className="hidden lg:flex items-center bg-background rounded-lg p-1">
                    <Tooltip label="Show projects" enabled={settings.showTooltips}>
                      <button onClick={() => setCalFullView(false)} className={`px-2.5 py-2 rounded-md transition-colors ${!calFullView ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        <PanelLeft className="size-4" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Full calendar" enabled={settings.showTooltips}>
                      <button onClick={() => setCalFullView(true)} className={`px-2.5 py-2 rounded-md transition-colors ${calFullView ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        <Maximize className="size-4" />
                      </button>
                    </Tooltip>
                  </div>
                  {calendarView === "month" && (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center bg-background rounded-lg p-1">
                        {(["all", "todo", "done", "overdue", "events"] as const).map(f => (
                          <button key={f} onClick={() => setTaskFilter(f)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${taskFilter === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            {f === "all" ? "All" : f === "todo" ? "To Do" : f === "done" ? "Done" : f === "overdue" ? "Overdue" : "Events"}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => { const isToday = calYear === new Date().getFullYear() && calMonthIdx === new Date().getMonth(); return (
                          <div className="flex items-center bg-background rounded-lg p-1"><button onClick={() => { const d = new Date(); d.setDate(1); setCalDate(d); }} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isToday ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>This month</button></div>
                        ); })()}
                        <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-lg"><ChevronLeft className="size-4 text-muted-foreground" /></button>
                        <span className="text-sm font-medium text-foreground px-2">{calMonthLabel}</span>
                        <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-lg"><ChevronRight className="size-4 text-muted-foreground" /></button>
                      </div>
                    </div>
                  )}
                  {calendarView === "week" && (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center bg-background rounded-lg p-1">
                        {(["all", "todo", "done", "overdue", "events"] as const).map(f => (
                          <button key={f} onClick={() => setTaskFilter(f)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${taskFilter === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            {f === "all" ? "All" : f === "todo" ? "To Do" : f === "done" ? "Done" : f === "overdue" ? "Overdue" : "Events"}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-background rounded-lg p-1"><button onClick={() => setWeekOffset(0)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${weekOffset === 0 ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>This week</button></div>
                        <button onClick={() => setWeekOffset(o => o - 1)} className="p-1 hover:bg-muted rounded-lg"><ChevronLeft className="size-4 text-muted-foreground" /></button>
                        <span className="text-sm font-medium text-foreground px-2">{fmt(viewWeekStartIso)} – {fmt(viewWeekEndIso)}</span>
                        <button onClick={() => setWeekOffset(o => o + 1)} className="p-1 hover:bg-muted rounded-lg"><ChevronRight className="size-4 text-muted-foreground" /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {calendarView === "week" ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 px-4 w-[28%] min-w-[120px]">TASK</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 px-4 w-[32%] min-w-[140px]">PROJECT</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 px-4 w-[18%] min-w-[90px]">DATE</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 px-4 w-[14%] min-w-[90px]">STATUS</th>
                          <th className="text-right text-xs font-medium text-muted-foreground pb-3 px-4 w-[8%] min-w-[50px]">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const weekEvents = showEvents ? events.filter(e => e.startDate <= viewWeekEndIso && (e.endDate || e.startDate) >= viewWeekStartIso) : [];
                          const hasRows = viewFilteredTasks.length > 0 || weekEvents.length > 0;
                          if (!hasRows) return <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Nothing this week</td></tr>;
                          return (
                            <>
                              {weekEvents.map(event => (
                                <tr key={`ev-${event.id}`} onClick={() => setSelectedEventId(event.id)} className="border-b border-border last:border-0 group cursor-pointer hover:bg-muted/40 transition-colors">
                                  <td className={`${tableRowCellPy} px-4`}>
                                    <span className="text-sm font-medium text-foreground border border-black rounded px-1.5 py-0.5">{event.title}</span>
                                  </td>
                                  <td className={`${tableRowCellPy} px-4 text-sm text-muted-foreground`}>—</td>
                                  <td className={`${tableRowCellPy} px-4 text-sm text-foreground`}>
                                    {event.startDate === event.endDate ? fmt(event.startDate) : `${fmt(event.startDate)} – ${fmt(event.endDate)}`}
                                  </td>
                                  <td className={`${tableRowCellPy} px-4`}>
                                    <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full border border-black text-black bg-transparent">Event</span>
                                  </td>
                                  <td className={`${tableRowCellPy} px-4 text-right`}>
                                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100">
                                      <button onClick={e => { e.stopPropagation(); openEditEvent(event); }} className="p-1 hover:bg-muted rounded"><Pencil className="size-4 text-muted-foreground" /></button>
                                      <button onClick={e => { e.stopPropagation(); requestDeleteEvent(event.id); }} className="p-1 hover:bg-muted rounded"><Trash2 className="size-4 text-destructive" /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {viewFilteredTasks.map(task => {
                                const project = projects.find(p => p.id === task.projectId);
                                const taskOverdue = task.status !== "done" && (
                                  (task.dateType === "due" && !!task.dueDate && task.dueDate < todayIso) ||
                                  (task.dateType === "range" && !!task.endDate && task.endDate < todayIso)
                                );
                                return (
                                  <tr key={task.id} onClick={() => setSelectedProjectId(task.projectId || null)} className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/40 transition-colors">
                                    <td className={`${tableRowCellPy} px-4 text-sm text-foreground font-medium`}>{task.title}</td>
                                    <td className={`${tableRowCellPy} px-4`}>
                                      <div className="flex items-center gap-2">
                                        <div className="size-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project?.color }} />
                                        <span className="text-sm text-muted-foreground">{project?.name ?? "—"}</span>
                                      </div>
                                    </td>
                                    <td className={`${tableRowCellPy} px-4 text-sm ${taskOverdue ? "text-destructive font-medium" : "text-foreground"}`}>{fmtTask(task, taskOverdue)}</td>
                                    <td className={`${tableRowCellPy} px-4`}>
                                      {taskOverdue ? (
                                        <span className="inline-block whitespace-nowrap px-2.5 py-1 text-xs font-medium rounded-full bg-destructive/15 text-destructive">Overdue</span>
                                      ) : task.status === "done" ? (
                                        <span className="inline-block whitespace-nowrap px-2.5 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>Done</span>
                                      ) : (
                                        <span className="inline-block whitespace-nowrap px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">To Do</span>
                                      )}
                                    </td>
                                    <td className={`${tableRowCellPy} px-4 text-right`}>
                                      <div className="relative inline-block">
                                        <button onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === task.id ? null : task.id); }} className="p-1 hover:bg-muted rounded">
                                          <MoreVertical className="size-4 text-muted-foreground" />
                                        </button>
                                        {openMenuId === task.id && (
                                          <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-36" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => { setOpenMenuId(null); openEditTask(task); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                                              <Pencil className="size-3.5" /> Edit
                                            </button>
                                            <button onClick={() => { setOpenMenuId(null); requestDeleteTask(task.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted">
                                              <Trash2 className="size-3.5" /> Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : calendarView === "month" ? (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {calWeekDays.map(d => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: calFirstOffset }).map((_, i) => <div key={`pad-${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const now = new Date();
                      const isToday = now.getFullYear() === calYear && now.getMonth() === calMonthIdx && now.getDate() === day;
                      const isSelected = selectedDay === day;
                      const dateTasks = getDateTasks(day);
                      const dateEvents = showEvents ? getDateEvents(day) : [];
                      const totalItems = dateEvents.length + dateTasks.length;
                      return (
                        <div key={day} onClick={e => { e.stopPropagation(); setSelectedProjectId(null); setSelectedDay(isSelected ? null : day); }} className={`${compact ? "min-h-14 p-1" : "min-h-24 p-1.5"} rounded-lg transition-colors cursor-pointer border ${isSelected ? "ring-2 ring-primary bg-muted/30 border-border" : isToday ? "bg-card border-2 border-black" : "border-border hover:bg-muted/50"}`}>
                          <div className={`${compact ? "text-xs mb-0.5" : "text-sm mb-1"} font-semibold text-foreground`}>{day}</div>
                          <div className="space-y-0.5">
                            {dateEvents.slice(0, compact ? 4 : 3).map((event, idx) => (
                              <div key={`ev-${idx}`} className="flex items-center rounded-[2px] bg-card overflow-hidden" title={event.title}>
                                <div className="w-1 self-stretch flex-shrink-0 rounded-full bg-foreground/40" />
                                <div className={`px-1 ${compact ? "py-0" : "py-0.5"} min-w-0`}>
                                  <div className="text-xs font-medium text-foreground truncate">{event.title}</div>
                                </div>
                              </div>
                            ))}
                            {dateTasks.slice(0, Math.max(0, (compact ? 4 : 3) - dateEvents.length)).map(({ task, project }, idx) => {
                              const taskOverdue = task.status !== "done" && (
                                (task.dateType === "due" && !!task.dueDate && task.dueDate < todayIso) ||
                                (task.dateType === "range" && !!task.endDate && task.endDate < todayIso)
                              );
                              const accentColor = project?.color ?? "var(--muted-foreground)";
                              return (
                                <div key={idx} className="flex items-center rounded-[2px] bg-card overflow-hidden" title={task.title}>
                                  <div className="w-1 self-stretch flex-shrink-0 rounded-full" style={{ backgroundColor: accentColor }} />
                                  <div className={`px-1 ${compact ? "py-0" : "py-0.5"} min-w-0`}>
                                    {taskOverdue && !compact && <div className="text-xs text-destructive truncate">Overdue</div>}
                                    <div className={`${compact ? "text-xs" : "text-sm"} font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : taskOverdue ? "text-destructive" : "text-foreground"}`}>{task.title}</div>
                                    {project && !compact && <div className="text-xs text-muted-foreground truncate">{project.name}</div>}
                                  </div>
                                </div>
                              );
                            })}
                            {totalItems > (compact ? 4 : 3) && (
                              <div className="text-xs text-muted-foreground px-1">+{totalItems - (compact ? 4 : 3)} more</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

            </div>
            )}
            </div>
          </div>
        </div>
      </main>

      {/* Stats panel */}
      {statsPanel !== null && (() => {
        const titles = {
          due: "Tasks Due This Week", overdue: "Overdue Tasks", ending: "Projects Ending This Week",
          "proj-overdue": "Projects Overdue", events: "Events This Week",
        };
        const panelTasks = statsPanel === "due"
          ? dueThisWeekTasks.map(({ task }) => task)
          : statsPanel === "overdue" ? overdueTasks : [];
        const panelProjects = statsPanel === "ending" ? projectsEndingThisWeek : statsPanel === "proj-overdue" ? overdueProjects : [];
        const panelEvents = statsPanel === "events" ? eventsThisWeek : [];
        const isProjectPanel = statsPanel === "ending" || statsPanel === "proj-overdue";
        const isEventPanel = statsPanel === "events";
        const count = isProjectPanel ? panelProjects.length : isEventPanel ? panelEvents.length : panelTasks.length;
        const countLabel = isProjectPanel ? (count === 1 ? "project" : "projects") : isEventPanel ? (count === 1 ? "event" : "events") : (count === 1 ? "task" : "tasks");
        return (
          <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} onClick={() => setStatsPanel(null)}>
            <div className="h-full w-full sm:w-[460px] bg-card flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="px-7 pt-8 pb-6 border-b border-border flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{titles[statsPanel]}</h2>
                    <p className="text-sm text-muted-foreground">{count} {countLabel}</p>
                  </div>
                  <button onClick={() => setStatsPanel(null)} className="p-1.5 hover:bg-muted rounded-lg mt-1"><X className="size-5 text-muted-foreground" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-auto px-7 py-6">
                {isProjectPanel ? (
                  panelProjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">{statsPanel === "ending" ? "No projects ending this week." : "No overdue projects."}</p>
                  ) : (
                    <div className="space-y-3">
                      {panelProjects.map(proj => {
                        const projTasks = tasks.filter(t => t.projectId === proj.id);
                        const done = projTasks.filter(t => t.status === "done").length;
                        const progress = projTasks.length ? Math.round((done / projTasks.length) * 100) : 0;
                        return (
                          <div key={proj.id} onClick={() => { setStatsPanel(null); setSelectedProjectId(proj.id); }} className="bg-background rounded-xl p-4 border border-border cursor-pointer hover:border-foreground/20 transition-colors">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="size-3 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                              <span className="font-medium text-foreground">{proj.name}</span>
                              {isOverdue(proj) && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">Overdue</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mb-3">
                              <CalendarDays className="size-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Ends {fmt(proj.endDate)}</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: `${proj.color}33` }}>
                              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: proj.color }} />
                            </div>
                            <p className="text-xs text-muted-foreground">{done}/{projTasks.length} tasks done</p>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : isEventPanel ? (
                  panelEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">No events this week.</p>
                  ) : (
                    <div className="space-y-3">
                      {panelEvents.map(event => (
                        <div key={event.id} className="bg-card rounded-2xl border border-black group p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-medium text-foreground mb-1">{event.title}</p>
                              {(event.startDate || event.endDate) && (
                                <div className="flex items-center gap-1.5 mb-2.5">
                                  <CalendarDays className="size-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">
                                    {event.startDate === event.endDate ? fmt(event.startDate) : `${fmt(event.startDate)} – ${fmt(event.endDate)}`}
                                  </span>
                                </div>
                              )}
                              <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium border border-black text-black bg-transparent">Event</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                              <button onClick={() => { setStatsPanel(null); openEditEvent(event); }} className="p-1 hover:bg-muted rounded"><Pencil className="size-3.5 text-muted-foreground" /></button>
                              <button onClick={() => requestDeleteEvent(event.id)} className="p-1 hover:bg-muted rounded"><Trash2 className="size-3.5 text-destructive" /></button>
                            </div>
                          </div>
                          {event.notes && (
                            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{event.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : panelTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    {statsPanel === "due" ? "Nothing due this week." : "All caught up."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {panelTasks.map(task => (
                      <TaskCard key={task.id} task={task} project={projects.find(p => p.id === task.projectId)} todayIso={todayIso} dateFormat={settings.dateFormat}
                        onToggle={() => toggleTask(task.id)}
                        onEdit={() => { setStatsPanel(null); openEditTask(task); }}
                        onDelete={() => requestDeleteTask(task.id)}
                        onProjectClick={task.projectId ? () => { setStatsPanel(null); setSelectedProjectId(task.projectId); } : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Day view modal */}
      {selectedDay !== null && (() => {
        const dayLabel = dayNames[new Date(calYear, calMonthIdx, selectedDay).getDay()];
        const dateLabel = `${monthNames[calMonthIdx]} ${selectedDay}, ${calYear}`;
        const dayTasks = getDateTasks(selectedDay);
        const dayEvents = getDateEvents(selectedDayIso);
        const total = dayTasks.length + dayEvents.length;
        return (
          <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} onClick={() => setSelectedDay(null)}>
            <div className="h-full w-full sm:w-[460px] bg-card flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="px-7 pt-8 pb-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{dayLabel}</p>
                    <h2 className="text-3xl font-bold text-foreground mb-1">{dateLabel}</h2>
                    <p className="text-sm text-muted-foreground">{total} {total === 1 ? "item" : "items"}</p>
                  </div>
                  <button onClick={() => setSelectedDay(null)} className="p-1.5 hover:bg-muted rounded-lg mt-1">
                    <X className="size-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto px-7 py-6">
                {total === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Nothing for this day.</p>
                ) : (
                  <div className="space-y-3">
                    {dayEvents.map(event => (
                      <div key={event.id} className="bg-card rounded-2xl border border-black group p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-foreground mb-1">{event.title}</p>
                            {(event.startDate || event.endDate) && (
                              <div className="flex items-center gap-1.5 mb-2.5">
                                <CalendarDays className="size-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">
                                  {event.startDate === event.endDate ? fmt(event.startDate) : `${fmt(event.startDate)} – ${fmt(event.endDate)}`}
                                </span>
                              </div>
                            )}
                            <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium border border-black text-black bg-transparent">Event</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                            <button onClick={() => openEditEvent(event)} className="p-1 hover:bg-muted rounded"><Pencil className="size-3.5 text-muted-foreground" /></button>
                            <button onClick={() => requestDeleteEvent(event.id)} className="p-1 hover:bg-muted rounded"><Trash2 className="size-3.5 text-destructive" /></button>
                          </div>
                        </div>
                        {event.notes && (
                          <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{event.notes}</p>
                        )}
                      </div>
                    ))}
                    {dayTasks.map(({ task, project }) => (
                      <TaskCard key={task.id} task={task} project={project} todayIso={todayIso} dateFormat={settings.dateFormat}
                        onToggle={() => toggleTask(task.id)}
                        onEdit={() => openEditTask(task)}
                        onDelete={() => requestDeleteTask(task.id)}
                        onProjectClick={project ? () => { setSelectedDay(null); setSelectedProjectId(project.id); } : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-7 py-5 border-t border-border flex flex-col gap-2">
                <button
                  onClick={() => openCreateTask("", selectedDayIso)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium ${btnPrimary}`}
                >
                  <Plus className="size-4" /> Add task to this day
                </button>
                <button
                  onClick={() => openCreateEvent(selectedDayIso)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium ${btnTertiary}`}
                >
                  <Plus className="size-4" /> Add event to this day
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Project panel */}
      {selectedProjectId !== null && (() => {
        const proj = projects.find(p => p.id === selectedProjectId);
        if (!proj) return null;
        const projTasks = tasks.filter(t => t.projectId === selectedProjectId);
        const done = projTasks.filter(t => t.status === "done").length;
        const progress = projTasks.length ? Math.round((done / projTasks.length) * 100) : 0;
        return (
          <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} onClick={() => setSelectedProjectId(null)}>
            <div className="h-full w-full sm:w-[460px] bg-card flex flex-col shadow-2xl" onClick={e => { e.stopPropagation(); setOpenMenuId(null); }}>

              {/* Header */}
              <div className="h-2 w-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
              <div className="px-7 pt-7 pb-5 border-b border-border flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">{proj.name}</h2>
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <button onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === proj.id ? null : proj.id); }} className="p-1.5 hover:bg-muted rounded-lg">
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </button>
                      {openMenuId === proj.id && (
                        <div className="absolute right-0 top-8 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-40" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setOpenMenuId(null); setSelectedProjectId(null); openEditProject(proj); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                            <Pencil className="size-3.5" /> Edit
                          </button>
                          <button onClick={() => { completeProject(proj.id); setSelectedProjectId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                            <CheckCircle className="size-3.5" /> Complete
                          </button>
                          <button onClick={() => { archiveProject(proj.id); setSelectedProjectId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
                            <Archive className="size-3.5" /> Archive
                          </button>
                          <button onClick={() => requestDeleteProject(proj.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted">
                            <Trash2 className="size-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => setSelectedProjectId(null)} className="p-1.5 hover:bg-muted rounded-lg">
                      <X className="size-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                {(proj.startDate || proj.endDate) && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {proj.startDate && fmt(proj.startDate)}
                      {proj.startDate && proj.endDate && " – "}
                      {proj.endDate && fmt(proj.endDate)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium text-foreground">{done}/{projTasks.length} done</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${proj.color}33` }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: proj.color }} />
                </div>
              </div>

              {/* Task list */}
              <div className="flex-1 overflow-auto px-7 py-6">
                {projTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No tasks yet.</p>
                ) : (
                  <div className="space-y-3">
                    {[...projTasks].sort((a, b) => {
                      const ad = a.dateType === "due" ? a.dueDate : a.dateType === "range" ? a.endDate : "";
                      const bd = b.dateType === "due" ? b.dueDate : b.dateType === "range" ? b.endDate : "";
                      if (ad && bd) return ad.localeCompare(bd);
                      if (ad) return -1;
                      if (bd) return 1;
                      return 0;
                    }).map(task => (
                      <TaskCard key={task.id} task={task} project={proj} todayIso={todayIso} dateFormat={settings.dateFormat}
                        onToggle={() => toggleTask(task.id)}
                        onEdit={() => openEditTask(task)}
                        onDelete={() => requestDeleteTask(task.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-7 py-5 border-t border-border flex-shrink-0 flex flex-col gap-2">
                <button
                  onClick={() => openCreateTask(proj.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold hover:brightness-90 transition-all"
                  style={{ backgroundColor: proj.color, color: "#3a3f00" }}
                >
                  <Plus className="size-4" /> Add task
                </button>
                {projTasks.length > 0 && done === projTasks.length && (
                  <button
                    onClick={() => { completeProject(proj.id); setSelectedProjectId(null); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border border-primary text-black hover:bg-primary/10 transition-colors"
                  >
                    <CheckCircle className="size-4" /> All tasks done — Mark as completed
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Event panel */}
      {selectedEventId !== null && (() => {
        const event = events.find(e => e.id === selectedEventId);
        if (!event) return null;
        return (
          <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} onClick={() => setSelectedEventId(null)}>
            <div className="h-full w-full sm:w-[460px] bg-card flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="px-7 pt-8 pb-6 border-b border-border flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium border border-black text-black bg-transparent mb-3">Event</span>
                    <h2 className="text-2xl font-bold text-foreground mb-3">{event.title}</h2>
                    {(event.startDate || event.endDate) && (
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {event.startDate === event.endDate ? fmt(event.startDate) : `${fmt(event.startDate)} – ${fmt(event.endDate)}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setSelectedEventId(null)} className="p-1.5 hover:bg-muted rounded-lg flex-shrink-0">
                    <X className="size-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto px-7 py-6">
                {event.notes
                  ? <p className="text-sm text-foreground whitespace-pre-wrap">{event.notes}</p>
                  : <p className="text-sm text-muted-foreground">No notes.</p>
                }
              </div>
              <div className="px-7 py-5 border-t border-border flex gap-3">
                <button onClick={() => { setSelectedEventId(null); openEditEvent(event); }} className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
                  <Pencil className="size-4" /> Edit
                </button>
                <button onClick={() => requestDeleteEvent(event.id)} className="px-4 py-2 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="size-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {projModalJSX}
      {taskModalJSX}
      {eventModalJSX}
      {confirmDeleteJSX}
      {settingsPanelJSX}
      {confirmImportJSX}
    </div>
  );
}
