// The Arabic CV as a printable sheet. Fixed width so the PDF is identical on
// every device, printed in ink on paper regardless of the site's theme.
export default function ArabicCvSheet({ data, sheetRef }) {
  return (
    <div
      ref={sheetRef}
      dir="rtl"
      style={{ fontFamily: 'Cairo, ui-sans-serif, sans-serif', width: 794 }}
      className="bg-white px-14 py-12 text-[#141518]"
    >
      <header className="border-b border-[#141518]/15 pb-5">
        <h1 className="text-[29px] font-bold leading-tight">{data.name}</h1>
        {data.title ? <p className="mt-1 text-[14px] text-[#141518]/70">{data.title}</p> : null}
        {data.contact ? <p className="mt-3 text-[12px] text-[#141518]/60">{data.contact}</p> : null}
      </header>

      <div className="mt-7 space-y-6">
        {data.sections.map((section, index) => (
          <section key={`${section.heading}-${index}`}>
            <h2 className="border-b border-[#141518]/15 pb-1 text-[13px] font-bold">{section.heading}</h2>
            <ul className="mt-2.5 space-y-1.5">
              {section.lines.map((line, lineIndex) => (
                <li key={lineIndex} className="text-[12.5px] leading-[1.8] text-[#141518]/85">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}