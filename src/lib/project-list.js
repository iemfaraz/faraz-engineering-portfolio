// Turns project records saved from the dashboard into the same shape the
// built-in content uses, so both render through one list.
export const PROJECT_FIELDS = [
  "slug",
  "order",
  "cat",
  "title_en",
  "title_ar",
  "summary_en",
  "summary_ar",
  "tags",
  "engagement",
  "office",
  "period",
  "disciplines",
  "standards",
  "scope_en",
  "scope_ar",
];

const splitList = (value) =>
  String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const splitLines = (value) =>
  String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function projectFromRecord(record, lang, position, filters) {
  const ar = lang === "ar";
  const scopeAr = splitLines(record.scope_ar);
  const scopeEn = splitLines(record.scope_en);

  return {
    slug: record.slug,
    no: String(position).padStart(2, "0"),
    cat: record.cat,
    catLabel: filters.find((option) => option.id === record.cat)?.label ?? record.cat,
    title: (ar && record.title_ar) || record.title_en || record.slug,
    summary: (ar && record.summary_ar) || record.summary_en || "",
    tags: splitList(record.tags),
    engagement: record.engagement ?? "",
    office: record.office ?? "",
    period: record.period ?? "",
    disciplines: splitList(record.disciplines),
    standards: splitList(record.standards),
    scope: scopeAr.length ? scopeAr : scopeEn,
  };
}

export function mergeProjects(baseItems, records, lang, filters) {
  const sorted = [...(records ?? [])]
    .filter((record) => record?.slug)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return [
    ...baseItems,
    ...sorted.map((record, index) => projectFromRecord(record, lang, baseItems.length + index + 1, filters)),
  ];
}