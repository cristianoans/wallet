import { cookies } from 'next/headers';
import { getBalance } from '@/lib/actions/wallet';
import { getTransactions } from '@/lib/actions/transactions';
import { redirect } from 'next/navigation';
import TransactionsClient from './TransactionsClient';

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    if (!token) {
        redirect('/login');
    }

    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;

    const [result, balance] = await Promise.all([
        getTransactions(page, limit),
        getBalance(),
    ]);

    if ('success' in result && !result.success) {
        redirect('/login');
    }

    return (
        <TransactionsClient
            transactions={result.data}
            balance={balance}
            currentPage={result.currentPage}
            totalPages={result.totalPages}
        />
    );
}