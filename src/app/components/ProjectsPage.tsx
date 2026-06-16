import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, CalendarDays, CheckSquare, Archive, ArchiveRestore, CheckCircle, RotateCcw } from "lucide-react";

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

type Task = {
  id: string;
  title: string;
  projectId: string;
  status: "todo" | "done";
  dateType: "none" | "due" | "range";
  dueDate: string;
  startDate: string;
  endDate: string;
};

type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

type Props = {
  projects: Project[];
  tasks: Task[];
  dateFormat: DateFormat;
  onBack: () => void;
  onNewProject: () => void;
  onEditProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  onArchiveProject: (id: string) => void;
  onUnarchiveProject: (id: string) => void;
  onCompleteProject: (id: string) => void;
  onUncompleteProject: (id: string) => void;
  onAddTask: (projectId: string) => void;
  onEditTask: (t: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
};

function fmtDate(iso: string, format: DateFormat = "DD/MM/YYYY") {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mon = months[Number(m) - 1];
  const day = Number(d);
  if (format === "YYYY-MM-DD") return `${y}-${m}-${d}`;
  if (format === "MM/DD/YYYY") return `${mon} ${day}`;
  return `${day} ${mon}`;
}

function taskDateLabel(task: Task, overdue = false, format: DateFormat = "DD/MM/YYYY") {
  if (task.dateType === "due" && task.dueDate) return overdue ? `Was due on ${fmtDate(task.dueDate, format)}` : `Due ${fmtDate(task.dueDate, format)}`;
  if (task.dateType === "range" && task.startDate && task.endDate)
    return `${fmtDate(task.startDate, format)} – ${fmtDate(task.endDate, format)}`;
  return "No date";
}

function daysRemaining(endDate: string) {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  if (diff < 0) return { label: "Overdue", warn: true };
  if (diff === 0) return { label: "Due today", warn: true };
  return { label: `${diff}d left`, warn: diff <= 7 };
}

export function ProjectsPage({
  projects, tasks, dateFormat,
  onBack, onNewProject, onEditProject, onDeleteProject,
  onArchiveProject, onUnarchiveProject,
  onCompleteProject, onUncompleteProject,
  onAddTask, onEditTask, onDeleteTask, onToggleTask,
}: Props) {
  const [tab, setTab] = useState<"active" | "completed" | "archived">("active");

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const isOverdue = (p: Project) => !!p.endDate && new Date(p.endDate) < now;
  const sortProjects = (list: Project[]) => [...list].sort((a, b) => {
    const aOver = isOverdue(a), bOver = isOverdue(b);
    if (aOver !== bOver) return aOver ? -1 : 1;
    if (a.endDate && b.endDate) return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    if (a.endDate) return -1;
    if (b.endDate) return 1;
    return 0;
  });

  const activeProjects = sortProjects(projects.filter(p => !p.archived && !p.completed));
  const completedProjects = sortProjects(projects.filter(p => !!p.completed));
  const archivedProjects = sortProjects(projects.filter(p => !!p.archived));
  const displayProjects = tab === "active" ? activeProjects : tab === "completed" ? completedProjects : archivedProjects;

  return (
    <div className="size-full overflow-auto bg-background">
      <div className="p-4 lg:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-8 gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <div className="h-5 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-semibold text-foreground">All Projects</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {activeProjects.length} active · {completedProjects.length} completed · {archivedProjects.length} archived
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-background rounded-lg p-1">
              <button
                onClick={() => setTab("active")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "active" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Active
              </button>
              <button
                onClick={() => setTab("completed")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "completed" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Completed
              </button>
              <button
                onClick={() => setTab("archived")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "archived" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Archived
              </button>
            </div>
            <button
              onClick={onNewProject}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 hover:brightness-90 transition-all whitespace-nowrap"
            >
              <Plus className="size-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Grid */}
        {displayProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              {tab === "archived" ? <Archive className="size-8 text-muted-foreground" /> : tab === "completed" ? <CheckCircle className="size-8 text-muted-foreground" /> : <CheckSquare className="size-8 text-muted-foreground" />}
            </div>
            <p className="text-foreground font-medium mb-1">
              {tab === "archived" ? "No archived projects" : tab === "completed" ? "No completed projects" : "No projects yet"}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              {tab === "archived" ? "Archived projects will appear here." : tab === "completed" ? "Mark a project as completed to move it here." : "Create your first project to get started."}
            </p>
            <button onClick={onNewProject} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 hover:brightness-90 transition-all">
              <Plus className="size-4" /> New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayProjects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const done = projectTasks.filter(t => t.status === "done").length;
              const progress = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
              const remaining = daysRemaining(project.endDate);
              const isInactive = project.archived || project.completed;

              return (
                <div key={project.id} className={`bg-card rounded-2xl border border-border overflow-hidden flex flex-col ${isInactive ? "opacity-60" : ""}`}>
                  {/* Color band */}
                  <div className="h-4 w-full flex items-center px-3 gap-1.5" style={{ backgroundColor: project.color }}>
                    {project.completed && <CheckCircle className="size-3 text-white/80" />}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Title row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-3 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: project.color }} />
                        <h3 className="font-semibold text-foreground">{project.name}</h3>
                        {project.completed && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">Completed</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {project.archived ? (
                          <>
                            <button onClick={() => onUnarchiveProject(project.id)} className="p-1 hover:bg-muted rounded transition-colors" title="Unarchive">
                              <ArchiveRestore className="size-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => onDeleteProject(project.id)} className="p-1 hover:bg-muted rounded transition-colors" title="Delete">
                              <Trash2 className="size-3.5 text-destructive" />
                            </button>
                          </>
                        ) : project.completed ? (
                          <>
                            <button onClick={() => onUncompleteProject(project.id)} className="p-1 hover:bg-muted rounded transition-colors" title="Reopen">
                              <RotateCcw className="size-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => onArchiveProject(project.id)} className="p-1 hover:bg-muted rounded transition-colors" title="Archive">
                              <Archive className="size-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => onDeleteProject(project.id)} className="p-1 hover:bg-muted rounded transition-colors">
                              <Trash2 className="size-3.5 text-destructive" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => onEditProject(project)} className="p-1 hover:bg-muted rounded transition-colors">
                              <Pencil className="size-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => onCompleteProject(project.id)} className="p-1 hover:bg-muted rounded transition-colors" title="Mark as completed">
                              <CheckCircle className="size-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => onArchiveProject(project.id)} className="p-1 hover:bg-muted rounded transition-colors" title="Archive">
                              <Archive className="size-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => onDeleteProject(project.id)} className="p-1 hover:bg-muted rounded transition-colors">
                              <Trash2 className="size-3.5 text-destructive" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{project.description}</p>
                    )}

                    {/* Dates + remaining */}
                    <div className="flex items-center justify-between mb-4">
                      {(project.startDate || project.endDate) ? (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project.startDate && fmtDate(project.startDate, dateFormat)}
                            {project.startDate && project.endDate && " – "}
                            {project.endDate && fmtDate(project.endDate, dateFormat)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No dates set</span>
                      )}
                      {remaining && !isInactive && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${remaining.warn ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                          {remaining.label}
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mb-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium text-foreground">{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${project.color}33` }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                      </div>
                    </div>

                    {/* Task stats */}
                    <div className="flex items-center gap-3 mb-5 mt-2">
                      <span className="text-xs text-muted-foreground">{done} done</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{projectTasks.length - done} to do</span>
                    </div>

                    {/* Task list */}
                    <div className="flex-1 space-y-1 mb-4">
                      {projectTasks.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2">No tasks yet.</p>
                      )}
                      {[...projectTasks].sort((a, b) => {
                        const ad = a.dateType === "due" ? a.dueDate : a.dateType === "range" ? a.endDate : "";
                        const bd = b.dateType === "due" ? b.dueDate : b.dateType === "range" ? b.endDate : "";
                        if (ad && bd) return ad.localeCompare(bd);
                        if (ad) return -1;
                        if (bd) return 1;
                        return 0;
                      }).map(task => {
                        const d = new Date(); const todayIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                        const taskOverdue = task.status !== "done" && (
                          (task.dateType === "due" && !!task.dueDate && task.dueDate < todayIso) ||
                          (task.dateType === "range" && !!task.endDate && task.endDate < todayIso)
                        );
                        return (
                        <div key={task.id} className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <button
                              onClick={() => onToggleTask(task.id)}
                              className="size-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
                              style={task.status === "done" ? { backgroundColor: "#E8F5E9", borderColor: "#4CAF50" } : taskOverdue ? { borderColor: "var(--destructive)", backgroundColor: "white" } : { borderColor: "var(--border)", backgroundColor: "white" }}
                            >
                              {task.status === "done" && <span className="text-[9px] font-bold" style={{ color: "#2E7D32" }}>✓</span>}
                            </button>
                            <span className={`text-xs truncate ${task.status === "done" ? "line-through text-muted-foreground" : taskOverdue ? "text-destructive" : "text-foreground"}`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {task.status === "done"
                              ? <span className="text-xs font-medium group-hover:hidden" style={{ color: "#4CAF50" }}>Done</span>
                              : <span className={`text-xs group-hover:hidden ${taskOverdue ? "text-destructive" : "text-muted-foreground"}`}>{taskDateLabel(task, taskOverdue, dateFormat)}</span>
                            }
                            <button onClick={() => onEditTask(task)} className="hidden group-hover:flex p-0.5 hover:bg-muted rounded">
                              <Pencil className="size-3 text-muted-foreground" />
                            </button>
                            <button onClick={() => onDeleteTask(task.id)} className="hidden group-hover:flex p-0.5 hover:bg-muted rounded">
                              <Trash2 className="size-3 text-destructive" />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>

                    {!isInactive && (
                      <button
                        onClick={() => onAddTask(project.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-auto"
                      >
                        <Plus className="size-3.5" /> Add task
                      </button>
                    )}
                    {!isInactive && projectTasks.length > 0 && done === projectTasks.length && (
                      <button
                        onClick={() => onCompleteProject(project.id)}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border border-primary text-black hover:bg-primary/10 transition-colors"
                      >
                        <CheckCircle className="size-3.5" /> All tasks done — Mark as completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
