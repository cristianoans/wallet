'use client';

import { deposit } from '@/lib/actions/transactions';

export default function DepositPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Realizar Depósito</h1>
                <form action={deposit} className="space-y-6">
                    <div>
                        <label htmlFor="amount" className="block text-gray-600 mb-1">
                            Valor
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="amount"
                            id="amount"
                            required
                            placeholder="Digite o valor do depósito"
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
                    >
                        Depositar
                    </button>
                </form>
            </div>
        </div>
    );
}
