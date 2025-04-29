'use client';

interface ErrorScreenProps {
    title: string;
    description?: string;
    reset: () => void;
}

export default function ErrorScreen({ title, description, reset }: ErrorScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
            <h1 className="text-3xl font-bold mb-4 text-red-500">{title}</h1>
            <p className="mb-6 text-gray-700">
                {description || 'Ocorreu um erro inesperado. Tente novamente.'}
            </p>
            <button
                onClick={() => reset()}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
                Tentar novamente
            </button>
        </div>
    );
}