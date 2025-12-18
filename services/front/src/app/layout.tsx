import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
    title: 'Transcendance - Gateway Demo',
    description: 'Test rapide WS gateway + service de jeux.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            {/* On applique les variables CSS sur le body */}
            <body>
                {children}
            </body>
        </html>
    );
}