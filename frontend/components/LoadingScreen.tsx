'use client';

interface LoadingScreenProps {
    message: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-xl font-bold text-gray-700 animate-pulse">
                {message}
            </h1>
        </div>
    );
}