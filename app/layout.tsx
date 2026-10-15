import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Tipster Audit — Trust the data.', description: 'Performance intelligence for sports tipsters. Transparent demo workspace.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="it"><body>{children}</body></html> }
