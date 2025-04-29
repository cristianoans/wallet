'use client';

import { useEffect } from 'react';
import ErrorScreen from '@/components/ErrorScreen';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function TransferError({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <ErrorScreen
            title="Erro ao realizar transferência"
            description={error.message}
            reset={reset}
        />
    );
}