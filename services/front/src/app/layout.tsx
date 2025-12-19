import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// Import du Provider qu'on a créé à l'étape précédente
import { SocketProvider } from './context/socketProvider';

// Configuration des polices Google
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <SocketProvider>
                    {children}
                </SocketProvider>
            </body>
        </html>
    );
}