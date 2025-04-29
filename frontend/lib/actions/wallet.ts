'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getAuthToken(): Promise<string> {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('jwt');
    const token = tokenCookie?.value;

    if (!token) {
        throw new Error('Você precisa estar logado para realizar esta ação.');
    }

    return token;
}

export async function getBalance(): Promise<number> {
    const token = await getAuthToken();

    try {
        const response = await fetch(`${API_URL}/wallet/balance`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar saldo.');
        }

        const balance = await response.json();
        return Number(balance);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error('Falha ao buscar saldo: ' + errorMessage);
    }
}