import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { PROJECT_FIELDS } from "@/lib/project-list";

const EMPTY = {
  title_en: "",
  title_ar: "",
  slug: "",
  cat: "gov",
  summary_en: "",
  summary_ar: "",
  tags: "",
  engagement: "",
  office: "",
  period: "",
  disciplines: "",
  standards: "",
  scope_en: "",
  scope_ar: "",
  order: 0,
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function TextField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <Label className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      <Input type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder} className="mt-2" />
    </label>
  );
}

export default function ProjectForm({ initial, onSave, onCancel, busy }) {
  const { c } = useLang();
  const [translating, setTranslating] = useState(false);
  const [form, setForm] = useState(() => {
    const base = { ...EMPTY };
    PROJECT_FIELDS.forEach((key) => {
      if (initial?.[key] !== undefined && initial?.[key] !== null) base[key] = initial[key];
    });
    return base;
  });

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    let values = { ...form };
    onSave({ ...values, slug: (values.slug || slugify(values.title_en)).trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-5 md:p-6">
      <p className="mb-5 border-b border-border pb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Enter your English and Arabic project details. Empty Arabic fields use English as a fallback.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Name — English" value={form.title_en} onChange={set("title_en")} />
        <TextField label="Name — Arabic" value={form.title_ar} onChange={set("title_ar")} />
        <TextField
          label="Link name"
          value={form.slug}
          onChange={set("slug")}
          placeholder={slugify(form.title_en) || "project-link"}
        />
        <label className="block">
          <Label className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Category</Label>
          <select
            value={form.cat}
            onChange={set("cat")}
            className="mt-2 flex h-10 w-full border border-input bg-transparent px-3 text-sm"
          >
            {c.projects.filters
              .filter((option) => option.id !== "all")
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <Label className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Summary — English
          </Label>
          <Textarea value={form.summary_en} onChange={set("summary_en")} rows={3} className="mt-2" />
        </label>
        <label className="block md:col-span-2">
          <Label className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Summary — Arabic
          </Label>
          <Textarea value={form.summary_ar} onChange={set("summary_ar")} rows={3} className="mt-2" dir="rtl" />
        </label>
        <TextField label="Tags (comma separated)" value={form.tags} onChange={set("tags")} placeholder="Power, Lighting, ELV" />
        <TextField label="Standards (comma separated)" value={form.standards} onChange={set("standards")} placeholder="SBC, IEC" />
        <TextField label="Engagement" value={form.engagement} onChange={set("engagement")} />
        <TextField label="Mode of work" value={form.office} onChange={set("office")} placeholder="Design office" />
        <TextField label="Period" value={form.period} onChange={set("period")} placeholder="2025 — 2026" />
        <TextField
          label="Disciplines (comma separated)"
          value={form.disciplines}
          onChange={set("disciplines")}
          placeholder="LV power distribution, Lighting design"
        />
        <label className="block md:col-span-2">
          <Label className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Scope delivered — English (one item per line)
          </Label>
          <Textarea value={form.scope_en} onChange={set("scope_en")} rows={4} className="mt-2" />
        </label>
        <label className="block md:col-span-2">
          <Label className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Scope delivered — Arabic (one item per line)
          </Label>
          <Textarea value={form.scope_ar} onChange={set("scope_ar")} rows={4} className="mt-2" dir="rtl" />
        </label>
        <TextField label="Order" type="number" value={form.order} onChange={set("order")} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || translating || !form.title_en.trim()}
          className="btn-solid !py-2.5 disabled:opacity-50"
        >
          {translating ? "Translating…" : busy ? "Saving…" : "Save project"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}