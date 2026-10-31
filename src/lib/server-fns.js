import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { writeArabicCv } from "@/lib/cv-arabic.server";

export const getServerInfo = createServerFn({ method: "GET" }).handler(async () => ({
  renderedAt: new Date().toISOString(),
}));

// Only the fields safe to show publicly are ever returned.
const publicFields = (record) => ({
  id: record.id,
  name: record.name ?? "",
  job_title: record.job_title ?? "",
  company: record.company ?? "",
  relation: record.relation ?? "",
  message: record.message ?? "",
});

export const getApprovedRecommendations = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const page = await context
    .getBase44()
    .asServiceRole.entities.Recommendation.filter({ status: "approved" }, { sort: "-created_date", limit: 12 });
  const items = Array.isArray(page) ? page : (page?.items ?? []);
  return items.map(publicFields);
});

const recommendationInput = z.object({
  name: z.string().trim().min(1).max(80),
  job_title: z.string().trim().max(80).optional().default(""),
  company: z.string().trim().max(80).optional().default(""),
  relation: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(10).max(700),
  website: z.string().max(200).optional().default(""),
});

// Public endpoint: anyone can submit an endorsement, it is stored as pending
// review and nothing submitted here is published until approved.
export const submitRecommendation = createServerFn({ method: "POST" })
  .validator(recommendationInput)
  .handler(async ({ data, context }) => {
    if (data.website) return { ok: true };

    await context.getBase44().asServiceRole.entities.Recommendation.create({
      name: data.name,
      job_title: data.job_title,
      company: data.company,
      relation: data.relation,
      message: data.message,
      status: "pending",
    });

    return { ok: true };
  });

const translationInput = z.object({
  title_en: z.string().trim().max(200).optional().default(""),
  summary_en: z.string().trim().max(1500).optional().default(""),
  scope_en: z.string().trim().max(3000).optional().default(""),
});

// Admin only: writes the Arabic side of a project from the English side, so a
// project can be entered once.
export const translateProjectFields = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(translationInput)
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }

    const result = await context.getBase44().asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Translate this portfolio project text from English into professional Gulf-standard Arabic (Saudi construction and electrical engineering wording).

Rules:
- Keep engineering abbreviations and standard names in Latin letters: SBC, IEC, NEC, LV, MV, ELV, DB, MDB, SMDB, UPS, CCTV, BMS, HVAC, kV, mm2.
- Keep numbers, years and units unchanged.
- "scope" is one deliverable per line: return exactly the same number of lines, each one translated, separated by newlines. No bullets or numbering.
- If a field is empty, return it empty.
- Do not add anything that is not in the English text.

title: ${JSON.stringify(data.title_en)}
summary: ${JSON.stringify(data.summary_en)}
scope: ${JSON.stringify(data.scope_en)}`,
      response_json_schema: {
        type: "object",
        properties: {
          title_ar: { type: "string" },
          summary_ar: { type: "string" },
          scope_ar: { type: "string" },
        },
        required: ["title_ar", "summary_ar", "scope_ar"],
      },
    });

    return {
      title_ar: String(result?.title_ar ?? "").trim(),
      summary_ar: String(result?.summary_ar ?? "").trim(),
      scope_ar: String(result?.scope_ar ?? "").trim(),
    };
  });

// ---------- Arabic CV ----------

const parseArabicCv = (record) => {
  if (!record?.content) return null;
  try {
    const parsed = JSON.parse(record.content);
    return {
      name: String(parsed?.name ?? ""),
      title: String(parsed?.title ?? ""),
      contact: String(parsed?.contact ?? ""),
      sections: Array.isArray(parsed?.sections)
        ? parsed.sections.map((section) => ({
            heading: String(section?.heading ?? ""),
            lines: Array.isArray(section?.lines) ? section.lines.map((line) => String(line)) : [],
          }))
        : [],
      source_title: record.source_title ?? "",
      translated_at: record.translated_at ?? null,
    };
  } catch {
    return null;
  }
};

// Public: the Arabic CV shown on /cv/ar.
export const getArabicCv = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const page = await context.getBase44().asServiceRole.entities.CvVersion.list("-created_date", 1);
  const record = (Array.isArray(page) ? page : (page?.items ?? []))[0];
  return parseArabicCv(record);
});

const cvSourceInput = z.object({
  file_url: z.string().trim().min(5).max(600),
  source_title: z.string().trim().max(200).optional().default(""),
});

// Admin only: reads an uploaded English CV PDF and writes the Arabic version
// from it, so the CV only has to be uploaded once.
export const buildArabicCv = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(cvSourceInput)
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }

    const written = await writeArabicCv(context.getBase44(), {
      file_url: data.file_url,
      source_title: data.source_title,
    });

    return { ok: true, name: written.name, sections: written.sections.length };
  });