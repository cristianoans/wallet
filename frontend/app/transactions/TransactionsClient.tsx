'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ModalReverseTransaction from '@/components/ModalReverseTransaction';
import { Transaction } from '@/types/transactions';
import { RotateCcw, CheckCircle } from 'lucide-react';

interface TransactionsClientProps {
    transactions: Transaction[];
    balance: number;
    currentPage: number;
    totalPages: number;
}

export default function TransactionsClient({ transactions, balance, currentPage, totalPages }: TransactionsClientProps) {
    const router = useRouter();
    const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

    function translateType(type: string) {
        if (type === 'TRANSFER') return 'Transferência';
        if (type === 'DEPOSIT') return 'Depósito';
        return type;
    }

    function handlePagination(newPage: number) {
        router.push(`/transactions?page=${newPage}`);
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Minhas Transações</h1>

            <div className="text-lg mb-8">
                <span className="text-gray-600">Saldo atual: </span>
                <span className={`font-bold ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    R$ {balance.toFixed(2)} BRL
                </span>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/deposit">
                    <button className="bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-2 px-6 rounded-lg shadow-md">
                        Realizar Depósito
                    </button>
                </Link>
                <Link href="/transfer">
                    <button className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-2 px-6 rounded-lg shadow-md">
                        Realizar Transferência
                    </button>
                </Link>
            </div>

            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white text-xs">
                    <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                        <tr>
                            <th className="py-3 px-4 text-center">ID</th>
                            <th className="py-3 px-4 text-center">Tipo</th>
                            <th className="py-3 px-4 text-center">Valor</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center">Remetente</th>
                            <th className="py-3 px-4 text-center">Destinatário</th>
                            <th className="py-3 px-4 text-center">Data</th>
                            <th className="py-3 px-4 text-center">Origem</th>
                            <th className="py-3 px-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        { transactions.length === 0 ? 
                        (
                            <tr>
                                <td colSpan={9} className="py-10 text-center text-gray-500">
                                    Nenhuma transação encontrada.
                                </td>
                            </tr>
                        ) 
                        : 
                        (transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors border-b">
                                <td className="py-2 px-4 text-center">
                                    <span title={tx.id}>{tx.id.slice(0, 8)}...</span>
                                </td>

                                <td className="py-2 px-4 text-center">
                                    {translateType(tx.type)}
                                </td>

                                <td className="py-2 px-4 text-center">
                                    R$ {tx.amount.toFixed(2)}
                                </td>

                                <td className="py-2 px-4 text-center">
                                    {tx.status === 'REVERSED' ? (
                                        <div className="flex items-center justify-center gap-1 text-red-500 font-semibold">
                                            <RotateCcw size={14} />
                                            Revertida
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                                            <CheckCircle size={14} />
                                            Concluída
                                        </div>
                                    )}
                                </td>

                                <td className="py-2 px-4 text-center">
                                    {tx.sender_wallet ? tx.sender_wallet.user.email : '-'}
                                </td>

                                <td className="py-2 px-4 text-center">
                                    {tx.receiver_wallet ? tx.receiver_wallet.user.email : '-'}
                                </td>

                                <td className="py-2 px-4 text-center">
                                    {new Date(tx.created_at).toLocaleString()}
                                </td>

                                <td className="py-2 px-4 text-center">
                                    {tx.reversed_transaction ? (
                                        <span title={tx.reversed_transaction.id}>
                                            {tx.reversed_transaction.id.slice(0, 8)}...
                                        </span>
                                    ) : (
                                        '-'
                                    )}
                                </td>

                                <td className="py-2 px-4 text-center">
                                    {tx.status !== 'REVERSED' && !tx.reversed_transaction && (
                                        <button
                                            onClick={() => setSelectedTransactionId(tx.id)}
                                            className="bg-yellow-500 hover:bg-yellow-600 transition-colors text-white font-bold py-1 px-3 rounded shadow-sm"
                                        >
                                            Reverter
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-4">
                    <button
                        onClick={() => handlePagination(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 transition-colors text-white font-semibold py-2 px-4 rounded"
                    >
                        Anterior
                    </button>

                    <span className="text-gray-600 text-sm">
                        Página {currentPage} de {totalPages}
                    </span>

                    <button
                        onClick={() => handlePagination(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 transition-colors text-white font-semibold py-2 px-4 rounded"
                    >
                        Próxima
                    </button>
                </div>
            )}

            {/* Modal de reversão */}
            {selectedTransactionId && (
                <ModalReverseTransaction
                    transactionId={selectedTransactionId}
                    onClose={() => setSelectedTransactionId(null)}
                />
            )}
        </div>
    );
}