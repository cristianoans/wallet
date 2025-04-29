export default function Footer() {
    return (
        <footer className="bg-gray-200 py-4 mt-auto">
            <div className="container mx-auto text-center text-gray-700 text-sm">
                Construído por Cristiano Oliveira © {new Date().getFullYear()}
            </div>
        </footer>
    );
}