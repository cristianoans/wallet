import { cookies } from 'next/headers';
import { decodeJWT } from '@/lib/utils/jwt';
import { getBalance } from '@/lib/actions/wallet';
import Link from 'next/link';

export default async function HomePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    let email = null;
    let balance: number | null = null;

    if (token) {
        const decoded = decodeJWT(token);
        email = decoded?.email || null;

        if (email) {
            try {
                balance = await getBalance();
            } catch (error) {
                console.error('Erro ao buscar saldo:', error);
                balance = null;
            }
        }
    }

    if (!email) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
                <h1 className="text-5xl font-extrabold mb-6 text-gray-700">Wallet</h1>
                <p className="mb-10 text-lg text-center max-w-md text-gray-600">
                    Gerencie suas transações de forma fácil e segura
                </p>
                <div className="flex gap-4">
                    <Link href="/login">
                        <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition">
                            Fazer Login
                        </button>
                    </Link>
                    <Link href="/register">
                        <button className="bg-gray-500 hover:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition">
                            Criar Conta
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
            <h1 className="text-4xl font-bold mb-4 text-gray-700">
                Bem-vindo, {email}!
            </h1>
            {balance !== null ? (
                <p className="text-lg mb-6 text-gray-600">
                    Seu saldo atual:{' '}
                    <span className={`font-bold ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        R$ {balance.toFixed(2)} BRL
                    </span>
                </p>
            ) : (
                <p className="text-lg mb-6 text-gray-500 italic">
                    Saldo indisponível no momento
                </p>
            )}
            <Link href="/transactions">
                <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition">
                    Ver Transações
                </button>
            </Link>
        </div>
    );
}