'use client';

import { useSearchParams } from 'next/navigation';
import { reverseTransaction } from '@/lib/actions/transactions';

export default function ReversePage() {
    const searchParams = useSearchParams();
    const transactionId = searchParams.get('id') || '';

    async function handleReverseTransaction(formData: FormData) {
        await reverseTransaction(formData);
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reverter Transação</h1>

            {transactionId ? (
                <form action={handleReverseTransaction} className="space-y-4">
                    <div>
                        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
                            ID da Transação
                        </label>
                        <input
                            type="text"
                            name="transactionId"
                            id="transactionId"
                            placeholder="ID da transação a reverter"
                            required
                            className="border p-2 w-full"
                            value={transactionId}
                            readOnly
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Reverter
                    </button>
                </form>
            ) : (
                <p className="text-red-500">Nenhuma transação selecionada.</p>
            )}
        </div>
    );
}