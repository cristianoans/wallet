'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { reverseTransaction } from '@/lib/actions/transactions';

interface ModalReverseTransactionProps {
    transactionId: string;
    onClose: () => void;
}

export default function ModalReverseTransaction({ transactionId, onClose }: ModalReverseTransactionProps) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleReverse = () => {
        setError(null);

        startTransition(async () => {
            const formData = new FormData();
            formData.append('transactionId', transactionId);

            const result = await reverseTransaction(formData);

            if (result.success) {
                onClose();
                router.refresh();
            } else {
                setError(result.error || 'Erro ao reverter transação. Tente novamente.');
            }
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Confirmar Reversão</h2>

                <p className="mb-4">
                    Deseja reverter a transação <strong>{transactionId}</strong>?
                </p>

                {error && (
                    <div className="text-red-500 mb-4">{error}</div>
                )}

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                        disabled={isPending}
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleReverse}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                        disabled={isPending}
                    >
                        {isPending ? 'Revertendo...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}