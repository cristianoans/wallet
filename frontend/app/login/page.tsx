'use client';

import { useActionState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/actions/auth';

interface LoginFormState {
    success: boolean;
    error?: string;
}

const initialState: LoginFormState = { success: false };

export default function LoginPage() {
    const router = useRouter();
    const [state, formAction] = useActionState(login, initialState);

    useEffect(() => {
        if (state.success) {
            router.refresh();
            router.push('/');
        }
    }, [state.success, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Login</h1>

                <form action={formAction} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-gray-600 mb-1">
                            E-mail
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            placeholder="Digite seu e-mail"
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-600 mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            placeholder="Digite sua senha"
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {state.error && (
                        <p className="text-red-500 text-sm mt-2">{state.error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}