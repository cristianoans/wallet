'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PaginatedTransactionsResult } from '@/types/transactions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getAuthToken(): Promise<string> {
    const cookieStore = await cookies();
    const tokenCookie = await cookieStore.get('jwt');
    const token = tokenCookie?.value;

    if (!token) {
        throw new Error('Você precisa estar logado para realizar esta ação.');
    }

    return token;
}

export async function deposit(formData: FormData): Promise<void> {
    const token = await getAuthToken();
    const amount = formData.get('amount') as string;

    const response = await fetch(`${API_URL}/transactions/deposit`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao realizar depósito.');
    }

    redirect('/transactions');
}

export async function transfer(formData: FormData): Promise<void> {
    const token = await getAuthToken();
    const amount = formData.get('amount') as string;
    const recipientEmail = formData.get('recipientEmail') as string;

    const response = await fetch(`${API_URL}/transactions/transfer`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount), recipientEmail }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao realizar transferência.');
    }

    redirect('/transactions');
}

export async function reverseTransaction(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const token = await getAuthToken();
    const transactionId = formData.get('transactionId') as string;

    const response = await fetch(`${API_URL}/transactions/reverse`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Erro ao reverter transação.' };
    }

    return { success: true };
}

export async function getTransactions(page = 1, limit = 10): Promise<PaginatedTransactionsResult> {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/transactions?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar transações.');
    }

    return response.json();
}