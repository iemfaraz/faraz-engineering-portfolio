// Reads an English CV PDF and writes the Arabic version of it, as JSON text.
// Server only: used by buildArabicCv and by the admin rebuild button.

const CV_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    title: { type: "string" },
    contact: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          lines: { type: "array", items: { type: "string" } },
        },
        required: ["heading", "lines"],
      },
    },
  },
  required: ["name", "title", "contact", "sections"],
};

const PROMPT = (cvText) => `You are writing the Arabic version of an electrical engineer's CV. Translate the CV text below from English into professional Gulf/Saudi Arabic.

Every piece of visible text must end up in Arabic, including section headings, job titles, departments, qualifications and description lines.

Keep in Latin letters only:
- the person's name;
- employer, consultancy and client names (e.g. REGA, PEC);
- software and standard names (SBC, IEC, NEC, LV, MV, ELV, MDB, SMDB, UPS, CCTV, BMS, HVAC, AutoCAD, Revit, DiaLux, ETAP, MATLAB, WIR, RFI);
- emails, phone numbers and registration numbers;
- digits, years and units.

Translate everything else, including a line that mixes Arabic with a Latin company name — for example "Electrical Engineer - Design | Oct 2025 - Sep 2026" becomes "مهندس كهرباء - تصميم | أكتوبر 2025 - سبتمبر 2026". Month names become Arabic, years stay digits.

Do not leave any English sentence or heading untranslated. Do not add, remove, summarise or reorder anything: keep the same sections in the same order, and one Arabic line for each English line. No bullet characters at the start of a line.

"name" is the person's name. "title" is the job title line under it. "contact" is the single line with location, phone and email joined by " · ", with numbers and email unchanged.

CV text:
"""${cvText}"""`;

const clean = (value) => String(value ?? "").trim().replace(/^[-•*·]\s*/, "");

export async function writeArabicCv(base44, { file_url, source_title = "" }) {
  const extraction = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
    file_url,
    json_schema: {
      type: "object",
      properties: {
        cv_text: {
          type: "string",
          description:
            "The complete text of this CV in reading order, one line of the document per line, keeping every section heading. Do not summarise, translate or leave anything out.",
        },
      },
      required: ["cv_text"],
    },
  });

  if (extraction?.status !== "success" || !extraction.output) {
    throw Object.assign(new Error("That PDF could not be read — a text-based PDF works best."), { status: 422 });
  }

  const raw = Array.isArray(extraction.output) ? extraction.output[0] : extraction.output;
  const cvText = String(raw?.cv_text ?? "").trim().slice(0, 14000);

  if (cvText.length < 40) {
    throw Object.assign(new Error("That PDF had no readable text in it."), { status: 422 });
  }

  const arabic = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: PROMPT(cvText),
    response_json_schema: CV_SCHEMA,
  });

  const content = JSON.stringify({
    name: clean(arabic?.name),
    title: clean(arabic?.title),
    contact: clean(arabic?.contact),
    sections: (Array.isArray(arabic?.sections) ? arabic.sections : []).map((section) => ({
      heading: clean(section?.heading),
      lines: (Array.isArray(section?.lines) ? section.lines : []).map(clean).filter(Boolean),
    })),
  });

  await base44.asServiceRole.entities.CvVersion.deleteMany({ lang: "ar" });
  await base44.asServiceRole.entities.CvVersion.create({
    lang: "ar",
    source_url: file_url,
    source_title,
    content,
    translated_at: new Date().toISOString(),
  });

  return JSON.parse(content);
}