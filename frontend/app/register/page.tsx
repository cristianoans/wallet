'use client';

import { register } from '@/lib/actions/auth';

export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Cadastrar</h1>
                <form action={register} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-gray-600 mb-1">
                            Nome
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            placeholder="Digite seu nome"
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>
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
                            placeholder="Crie uma senha segura"
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
                    >
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}