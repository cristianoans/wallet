'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function login(_: unknown, formData: FormData): Promise<{ success: boolean; error?: string }> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData.message || 'Erro ao fazer login.' };
        }

        const { access_token } = await response.json();
        const cookieStore = await cookies();
        cookieStore.set('jwt', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
        });

        return { success: true };
    } catch (e) {
        console.error('Erro no login:', e);
        return { success: false, error: 'Erro inesperado. Tente novamente mais tarde.' };
    }
}

export async function register(formData: FormData): Promise<void> {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao registrar.');
    }

    redirect('/login');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('jwt');
    redirect('/');
}