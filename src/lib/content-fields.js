import en from "@/content/en";
import ar from "@/content/ar";

export const DICTIONARIES = { en, ar };

// Sections of the portfolio, in page order, as they appear in the dashboard editor.
export const SECTIONS = [
  { key: "hero", label: "Hero" },
  { key: "brand", label: "Name and role" },
  { key: "stats", label: "Stats strip" },
  { key: "profile", label: "Profile" },
  { key: "intent", label: "Design intent" },
  { key: "expertise", label: "Expertise" },
  { key: "projects", label: "Projects" },
  { key: "sheets", label: "Drawing sheets" },
  { key: "experience", label: "Experience" },
  { key: "films", label: "Film" },
  { key: "recommendations", label: "Recommendations" },
  { key: "toolkit", label: "Toolkit and credentials" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "contact", label: "Contact" },
  { key: "detail", label: "Project detail page" },
  { key: "footer", label: "Footer" },
  { key: "nav", label: "Navigation labels" },
  { key: "ui", label: "Buttons and interface" },
];

export const getAtPath = (source, path) =>
  String(path)
    .split(".")
    .reduce((node, key) => (node == null ? node : node[key]), source);

// Collects every editable string under a value, as { path, value }.
export function flattenStrings(value, prefix = "", out = []) {
  if (typeof value === "string") {
    out.push({ path: prefix, value });
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => flattenStrings(item, `${prefix}.${index}`, out));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => flattenStrings(item, prefix ? `${prefix}.${key}` : key, out));
  }
  return out;
}

export function fieldsFor(section, dictionary) {
  return flattenStrings(dictionary[section], section);
}

function setAtPath(target, path, value) {
  const parts = String(path).split(".");
  let node = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!node || typeof node !== "object") return target;
    node = node[key];
  }
  const last = parts[parts.length - 1];
  if (node && typeof node === "object" && last in node) node[last] = value;
  return target;
}

// Applies saved overrides on top of a default dictionary, ignoring paths that no
// longer exist so an old override can never break the page.
export function mergeOverrides(base, overrides) {
  const clone = JSON.parse(JSON.stringify(base));
  (overrides ?? []).forEach((row) => {
    if (row?.path && typeof row.value === "string") setAtPath(clone, row.path, row.value);
  });
  return clone;
}