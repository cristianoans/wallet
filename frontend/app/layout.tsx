import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Wallet',
    description: 'Aplicação para gerenciar transações financeiras',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body>
                <div className="flex flex-col min-h-screen bg-gray-100">
                    <Navbar />
                    <main className="flex-grow container mx-auto p-4">
                        {children}
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
