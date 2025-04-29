export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: string;
}

export interface Wallet {
    id: string;
    balance: number;
    created_at: string;
    updated_at: string;
    user: User;
}

export interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    sender_wallet?: Wallet | null;
    receiver_wallet?: Wallet | null;
    reversed_transaction?: Transaction | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedTransactionsResult {
    data: Transaction[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
}