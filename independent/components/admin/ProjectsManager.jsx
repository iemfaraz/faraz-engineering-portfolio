import { useState } from "react";
import { toast } from "sonner";
import { portfolioApi as base44 } from "@/lib/portfolio-api";
import { useProjects } from "@/components/portfolio/ProjectsProvider";
import ProjectForm from "@/components/admin/ProjectForm";
import { PROJECT_FIELDS } from "@/lib/project-list";

export default function ProjectsManager() {
  const { extra, items, refreshProjects } = useProjects();
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const builtIn = items.length - extra.length;

  async function save(values) {
    const clash = extra.find((row) => row.slug === values.slug && row.id !== editing?.id);
    if (clash) {
      toast.error("That link name is already used by another project.");
      return;
    }
    setBusy(true);
    try {
      const payload = Object.fromEntries(PROJECT_FIELDS.map((key) => [key, values[key] ?? ""]));
      payload.order = Number(values.order) || 0;
      if (editing?.id) {
        await base44.entities.Project.update(editing.id, payload);
      } else {
        await base44.entities.Project.create(payload);
      }
      await refreshProjects();
      setEditing(null);
      toast.success("Project saved");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(project) {
    if (!window.confirm(`Delete “${project.title_en}”? Its page will stop working.`)) return;
    try {
      await base44.entities.Project.delete(project.id);
      await refreshProjects();
      toast.success("Project deleted");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="display text-[clamp(1.9rem,4vw,2.8rem)]">Projects</h1>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground">
        Add a project and it gets its own page, card and filters on the site — in both languages. Every project can be edited or removed below.
      </p>

      {editing ? (
        <div className="mt-8">
          <ProjectForm
            initial={editing === "new" ? null : editing}
            busy={busy}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        <button type="button" onClick={() => setEditing("new")} className="btn-solid mt-8 !py-2.5">
          Add a project
        </button>
      )}

      <div className="mt-8 border border-border bg-card">
        {extra.length === 0 ? (
          <p className="p-5 text-[14px] text-muted-foreground">No added projects yet.</p>
        ) : (
          extra.map((project) => (
            <div
              key={project.id}
              className="flex flex-wrap items-center gap-3 border-b border-border p-4 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px]">{project.title_en}</div>
                <div className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  /projects/{project.slug} — {project.cat}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditing(project)}
                className="border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(project)}
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}