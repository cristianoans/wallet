'use client';

import { useEffect } from 'react';
import ErrorScreen from '@/components/ErrorScreen';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function RegisterError({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <ErrorScreen
            title="Erro ao cadastrar"
            description={error.message}
            reset={reset}
        />
    );
}