const FILES = [
  {
    href: "/downloads/faraz-portfolio-source.zip",
    label: "Full project",
    size: "10.8 MB",
    note: "The complete portfolio — code, pages, images, CV and the intro film.",
  },
  {
    href: "/downloads/faraz-portfolio-code.zip",
    label: "Code only",
    size: "0.7 MB",
    note: "The same project without the video file, for quick backups or sending to a developer.",
  },
];

export default function FilesManager() {
  return (
    <div className="max-w-3xl">
      <h1 className="display text-[clamp(1.9rem,4vw,2.8rem)]">Project files</h1>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground">
        Download the whole portfolio as a ZIP — every page, image and setting — to keep a backup or hand the
        project to a developer.
      </p>

      <div className="mt-8 divide-y divide-border border border-border bg-card">
        {FILES.map((file) => (
          <div key={file.href} className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
            <div>
              <p className="font-display text-[15px] font-medium">{file.label}</p>
              <p className="mt-1 max-w-[46ch] text-[13px] leading-relaxed text-muted-foreground">{file.note}</p>
            </div>
            <a href={file.href} download className="btn-line whitespace-nowrap">
              Download · {file.size}
            </a>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">
        The ZIP unpacks into a folder called faraz-portfolio. Unzip it, then run npm install and npm run dev inside
        that folder.
      </p>
    </div>
  );
}