'use client';

import ErrorScreen from '@/components/ErrorScreen';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
    return (
        <ErrorScreen
            title="Sistema indisponível"
            description={error.message || 'Estamos passando por instabilidades. Por favor, tente novamente mais tarde.'}
            reset={reset}
        />
    );
}