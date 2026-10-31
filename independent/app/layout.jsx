import './globals.css';
export const metadata = {
 title: 'Faraz Nawaz — Electrical & BIM Engineer, Riyadh',
 description: 'Electrical and BIM engineering portfolio. Saudi Building Code, IEC, design, site execution and QA/QC.',
 openGraph: {title: 'Faraz Nawaz — Electrical & BIM Engineer', images: ['/assets/og-image.jpg']},
};
export default function RootLayout({children}) {
 return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/></head><body>{children}</body></html>;
}
