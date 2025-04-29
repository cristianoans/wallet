import Link from 'next/link';
import { logout } from '@/lib/actions/auth';
import { cookies } from 'next/headers';

export default async function Navbar() {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('jwt')?.value;

    return (
        <nav className="bg-gray-800 p-4 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex space-x-6">
                    <Link href="/" className="text-white font-semibold text-xl">
                        Wallet
                    </Link>
                    {isAuthenticated && (
                        <Link href="/transactions" className="text-gray-300 hover:text-white transition">
                            Transações
                        </Link>
                    )}
                </div>
                <div className="flex">
                    {isAuthenticated && (
                        <form action={logout}>
                            <button
                                type="submit"
                                className="text-gray-300 hover:text-white transition"
                            >
                                Logout
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </nav>
    );
}