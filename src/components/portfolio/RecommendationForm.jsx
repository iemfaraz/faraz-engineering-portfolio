import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useLang } from "@/components/portfolio/LanguageProvider";

const FIELD =
  "w-full border border-foreground/20 bg-background px-3.5 py-3 text-[15px] outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";

export default function RecommendationForm({ onSubmit }) {
  const { c } = useLang();
  const f = c.recommendations.form;
  const [values, setValues] = useState({
    name: "",
    job_title: "",
    company: "",
    relation: f.relations[0],
    message: "",
    website: "",
  });
  const [status, setStatus] = useState("idle");

  const update = (key) => (event) => setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "sending") return;
    if (!values.name.trim() || values.message.trim().length < 10) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      await onSubmit?.(values);
      setStatus("done");
      setValues({ name: "", job_title: "", company: "", relation: f.relations[0], message: "", website: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-6 md:p-8">
      <h3 className="font-display text-lg font-semibold leading-snug">{f.title}</h3>
      <p className="mt-2 max-w-[42ch] text-[14.5px] leading-relaxed text-muted-foreground">{f.body}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="micro">{f.name}</span>
          <input className={`mt-2 ${FIELD}`} value={values.name} onChange={update("name")} maxLength={80} />
        </label>
        <label className="block">
          <span className="micro">{f.jobTitle}</span>
          <input className={`mt-2 ${FIELD}`} value={values.job_title} onChange={update("job_title")} maxLength={80} />
        </label>
        <label className="block">
          <span className="micro">{f.company}</span>
          <input className={`mt-2 ${FIELD}`} value={values.company} onChange={update("company")} maxLength={80} />
        </label>
        <label className="block">
          <span className="micro">{f.relation}</span>
          <select className={`mt-2 ${FIELD}`} value={values.relation} onChange={update("relation")}>
            {f.relations.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 block">
        <span className="micro">{f.message}</span>
        <textarea
          className={`mt-2 min-h-[110px] ${FIELD}`}
          value={values.message}
          onChange={update("message")}
          maxLength={700}
        />
      </label>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={values.website}
        onChange={update("website")}
        className="hidden"
        aria-hidden="true"
      />

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={status === "sending"} className="btn-solid disabled:opacity-60">
          {status === "sending" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {f.sending}
            </>
          ) : (
            f.submit
          )}
        </button>
        {status === "done" ? (
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
            <Check className="h-3.5 w-3.5" />
            {f.success}
          </span>
        ) : null}
        {status === "error" ? <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-destructive">{f.error}</span> : null}
        {status === "invalid" ? <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-destructive">{f.required}</span> : null}
      </div>
    </form>
  );
}