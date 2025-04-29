'use server';

export async function checkBackendHealth(): Promise<boolean> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
        const response = await fetch(`${API_URL}/health`, { method: 'GET' });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}