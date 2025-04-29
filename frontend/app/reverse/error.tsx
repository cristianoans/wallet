'use client';

import { useEffect } from 'react';
import ErrorScreen from '@/components/ErrorScreen';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ReverseError({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <ErrorScreen
            title="Erro ao reverter transação"
            description={error.message}
            reset={reset}
        />
    );
}