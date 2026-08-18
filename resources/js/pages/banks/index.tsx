import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { SectionNav } from '@/components/section-nav';
import {
    Building2,
    Plus,
    ArrowRightLeft,
    Wallet,
    TrendingUp,
    CreditCard,
    ShieldCheck,
    MoreVertical,
    Pencil,
    Trash2,
    Check,
    Sparkles,
    Search,
    Landmark,
    DollarSign,
    Zap,
    Gift,
    Smartphone,
    LayoutGrid,
    List
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { ClientPagination } from '@/components/pagination-controls';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bank Accounts', href: '/banks' },
];

export interface BankAccountItem {
    id: number;
    bank_name: string;
    account_name: string;
    account_number_last4: string | null;
    account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'e_wallet';
    currency: string;
    balance: number;
    credit_limit: number | null;
    color: string;
    card_type?: string | null;
    card_network?: string | null;
    status: string;
    notes: string | null;
    created_at: string;
}

interface Props {
    bankAccounts: BankAccountItem[];
    stats: {
        totalBalance: number;
        totalSavings: number;
        totalChecking: number;
        totalCreditDebt: number;
        accountCount: number;
    };
}

const PRESET_BANKS = [
    { name: 'MariBank', color: 'maribank', type: 'savings', card_type: 'debit', card_network: 'mastercard' },
    { name: 'GoTyme Bank', color: 'gotyme', type: 'savings', card_type: 'debit', card_network: 'visa' },
    { name: 'Maya Bank', color: 'maya', type: 'savings', card_type: 'debit', card_network: 'visa' },
    { name: 'Tonik Bank', color: 'tonik', type: 'savings', card_type: 'debit', card_network: 'mastercard' },
    { name: 'BDO Unibank', color: 'bdo', type: 'credit_card', card_type: 'credit', card_network: 'mastercard' },
    { name: 'BPI', color: 'bpi', type: 'credit_card', card_type: 'credit', card_network: 'visa' },
    { name: 'GCash', color: 'gcash', type: 'e_wallet', card_type: 'debit', card_network: 'visa' },
    { name: 'UnionDigital', color: 'amber', type: 'savings', card_type: 'debit', card_network: 'visa' },
    { name: 'Metrobank', color: 'metrobank', type: 'checking', card_type: 'debit', card_network: 'mastercard' },
    { name: 'UnionBank', color: 'orange', type: 'savings', card_type: 'debit', card_network: 'visa' },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    maribank: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        gradient: 'from-[#00875A] via-[#00695C] to-[#004D40]', // Official MariBank Teal Debit Card
    },
    'maribank-orange': {
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-500/30',
        gradient: 'from-[#EA5F00] via-[#F4511E] to-[#BF360C]', // MariBank Brand Orange
    },
    gotyme: {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-500/30',
        gradient: 'from-[#00A8A8] via-[#007B8C] to-[#013A42]', // GoTyme Official Teal/Cyan Card
    },
    maya: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        gradient: 'from-[#111827] via-[#064E3B] to-[#022C22]', // Maya Obsidian & Emerald
    },
    tonik: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/30',
        gradient: 'from-[#6B21A8] via-[#86198F] to-[#3B0764]', // Tonik Electric Purple
    },
    bdo: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/30',
        gradient: 'from-[#003882] via-[#002868] to-[#0A192F]', // BDO Navy Blue & Gold
    },
    bpi: {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/30',
        gradient: 'from-[#991B1B] via-[#7F1D1D] to-[#450A0A]', // BPI Crimson Red
    },
    gcash: {
        bg: 'bg-sky-500/10 dark:bg-sky-500/20',
        text: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-500/30',
        gradient: 'from-[#005CEE] via-[#0043B3] to-[#0A1E5C]', // GCash Royal Blue
    },
    metrobank: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/30',
        gradient: 'from-[#003B73] via-[#002952] to-[#0A192F]', // Metrobank Prestige Blue
    },
    orange: {
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-500/30',
        gradient: 'from-[#EA580C] via-[#C2410C] to-[#7C2D12]', // UnionBank Sunset Orange
    },
    cyan: {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-500/30',
        gradient: 'from-[#00A8A8] via-[#007B8C] to-[#013A42]',
    },
    amber: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
        gradient: 'from-[#D97706] via-[#B45309] to-[#78350F]', // UnionDigital Amber Gold
    },
    purple: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/30',
        gradient: 'from-[#6B21A8] via-[#86198F] to-[#3B0764]',
    },
    emerald: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-500 via-teal-600 to-green-800',
    },
    blue: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/30',
        gradient: 'from-[#003882] via-[#002868] to-[#0A192F]',
    },
    indigo: {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-500/30',
        gradient: 'from-indigo-600 via-blue-700 to-slate-900',
    },
    rose: {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/30',
        gradient: 'from-[#991B1B] via-[#7F1D1D] to-[#450A0A]',
    },
};

// Custom Brand SVG / Image Icons Component
function BankBrandLogo({ name, className = 'h-7 w-7' }: { name: string; className?: string }) {
    const n = name.toLowerCase();

    if (n.includes('mari')) {
        // MariBank Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-orange-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/maribank.jpeg"
                    alt="MariBank"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }
    if (n.includes('gotyme')) {
        // GoTyme Bank Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-cyan-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/gotyme.png"
                    alt="GoTyme Bank"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }
    if (n.includes('maya')) {
        // Maya Bank Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-emerald-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/maya.jpg"
                    alt="Maya Bank"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }
    if (n.includes('tonik')) {
        // Tonik Bank Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-purple-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/tonik.png"
                    alt="Tonik Bank"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }
    if (n.includes('bdo')) {
        // BDO Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-blue-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/bdo.jpg"
                    alt="BDO"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }
    if (n.includes('bpi')) {
        // BPI Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-red-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/bpi.png"
                    alt="BPI"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }
    if (n.includes('gcash')) {
        // GCash Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-blue-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/gcash.png"
                    alt="GCash"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }
    if (n.includes('uniondigital') || n.includes('ud')) {
        // UnionDigital Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-amber-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/uniondigital.png"
                    alt="UnionDigital"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }
    if (n.includes('unionbank') || n.includes('union bank') || n.includes('ubp')) {
        // UnionBank Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-orange-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/unionbank.webp"
                    alt="UnionBank"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }
    if (n.includes('metrobank') || n.includes('metro')) {
        // Metrobank Official Logo
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-blue-200/60 overflow-hidden shrink-0 ${className}`}>
                <img
                    src="/banks-logo/metrobank.jpg"
                    alt="Metrobank"
                    className="h-full w-full object-contain rounded-md"
                />
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white font-bold text-xs ${className}`}>
            <Building2 className="h-4 w-4" />
        </div>
    );
}

// Card Network Logos (Visa / Mastercard)
function CardNetworkLogo({ network }: { network?: string | null }) {
    if (network === 'visa') {
        return (
            <span className="font-extrabold italic text-sm tracking-wider text-white/90 drop-shadow">
                VISA
            </span>
        );
    }
    if (network === 'mastercard') {
        return (
            <div className="flex items-center -space-x-2">
                <div className="h-5 w-5 rounded-full bg-red-500 opacity-90" />
                <div className="h-5 w-5 rounded-full bg-amber-400 opacity-90" />
            </div>
        );
    }
    return (
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/30 rounded px-1 py-0.5">
            CARD
        </span>
    );
}

export default function BanksIndex({ bankAccounts, stats }: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccountItem | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    // Form for Add/Edit
    const accountForm = useForm({
        bank_name: '',
        account_name: '',
        account_number_last4: '',
        account_type: 'savings' as BankAccountItem['account_type'],
        currency: 'PHP',
        balance: '',
        credit_limit: '',
        color: 'orange',
        card_type: 'debit',
        card_network: 'mastercard',
        notes: '',
    });

    // Form for Transfer
    const transferForm = useForm({
        from_account_id: bankAccounts.length > 0 ? bankAccounts[0].id.toString() : '',
        to_account_id: bankAccounts.length > 1 ? bankAccounts[1].id.toString() : '',
        amount: '',
        notes: '',
    });

    const filteredAccounts = useMemo(() => {
        return bankAccounts.filter((acc) => {
            const matchesType = selectedType === 'all' || acc.account_type === selectedType;
            const matchesSearch =
                acc.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (acc.account_number_last4 && acc.account_number_last4.includes(searchQuery));
            return matchesType && matchesSearch;
        });
    }, [bankAccounts, selectedType, searchQuery]);

    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 9;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedType, searchQuery]);

    const totalPages = Math.ceil(filteredAccounts.length / PAGE_SIZE) || 1;
    const paginatedAccounts = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredAccounts.slice(start, start + PAGE_SIZE);
    }, [filteredAccounts, currentPage]);

    const openAddModal = () => {
        setEditingAccount(null);
        accountForm.reset();
        accountForm.clearErrors();
        setIsAddModalOpen(true);
    };

    const openEditModal = (acc: BankAccountItem) => {
        setEditingAccount(acc);
        accountForm.setData({
            bank_name: acc.bank_name,
            account_name: acc.account_name,
            account_number_last4: acc.account_number_last4 || '',
            account_type: acc.account_type,
            currency: acc.currency,
            balance: acc.balance.toString(),
            credit_limit: acc.credit_limit ? acc.credit_limit.toString() : '',
            color: acc.color,
            card_type: acc.card_type || 'debit',
            card_network: acc.card_network || 'mastercard',
            notes: acc.notes || '',
        });
        accountForm.clearErrors();
        setIsAddModalOpen(true);
    };

    const openTransferModal = () => {
        transferForm.reset();
        transferForm.clearErrors();
        setIsTransferModalOpen(true);
    };

    const handleSaveAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAccount) {
            accountForm.put(route('banks.update', editingAccount.id), {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    accountForm.reset();
                },
            });
        } else {
            accountForm.post(route('banks.store'), {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    accountForm.reset();
                },
            });
        }
    };

    const handleDeleteAccount = (id: number) => {
        if (confirm('Are you sure you want to delete this bank account?')) {
            router.delete(route('banks.destroy', id));
        }
    };

    const handleTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        transferForm.post(route('banks.transfer'), {
            onSuccess: () => {
                setIsTransferModalOpen(false);
                transferForm.reset();
            },
        });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(val);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Accounts & Cards" />

            <div className="w-full max-w-full min-w-0 p-4 md:p-8 space-y-6 sm:space-y-8">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Banks</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage your bank accounts</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center rounded-lg border bg-card p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Grid View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'table' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="List / Table View"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                        <button
                            onClick={openTransferModal}
                            className="inline-flex items-center justify-center rounded-md border bg-card px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors hover:bg-muted"
                        >
                            <ArrowRightLeft className="mr-1.5 sm:mr-2 h-4 w-4 shrink-0" /> Transfer Funds
                        </button>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm"
                        >
                            <Plus className="mr-1.5 sm:mr-2 h-4 w-4 shrink-0" /> Add Account
                        </button>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <SectionNav group="money" />

                {/* Stats Overview Grid */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
                    {/* Total Balance Card */}
                    <div className="animate-fade-in-up stagger-1 card-interactive group relative rounded-2xl border bg-card p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300 min-w-0">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Wallet className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Liquid Assets</span>
                                <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Wallet className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-4 min-w-0">
                                <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                                    {formatCurrency(stats.totalBalance)}
                                </h3>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium truncate">
                                    <TrendingUp className="h-3.5 w-3.5 shrink-0" /> Across {stats.accountCount} active accounts & cards
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Checking & Cash */}
                    <div className="animate-fade-in-up stagger-2 card-interactive group relative rounded-2xl border bg-card p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300 min-w-0">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 via-blue-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Building2 className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Checking & E-Wallets</span>
                                <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Building2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-4 min-w-0">
                                <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                                    {formatCurrency(stats.totalChecking)}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 truncate">Available for daily transactions</p>
                            </div>
                        </div>
                    </div>

                    {/* Digital Bank Savings */}
                    <div className="animate-fade-in-up stagger-3 card-interactive group relative rounded-2xl border bg-card p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all duration-300 min-w-0">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 via-indigo-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <ShieldCheck className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Digital Bank Savings</span>
                                <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <ShieldCheck className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-4 min-w-0">
                                <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                                    {formatCurrency(stats.totalSavings)}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 truncate">High-yield MariBank, GoTyme, Tonik & Maya</p>
                            </div>
                        </div>
                    </div>

                    {/* Credit Cards / Debt */}
                    <div className="animate-fade-in-up stagger-4 card-interactive group relative rounded-2xl border bg-card p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all duration-300 min-w-0">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-rose-500/10 via-rose-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <CreditCard className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Credit Card Debt</span>
                                <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <CreditCard className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-4 min-w-0">
                                <h3 className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight truncate">
                                    {formatCurrency(stats.totalCreditDebt)}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 truncate">Total statement dues across credit cards</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b pb-4 min-w-0 w-full">
                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none min-w-0 w-full sm:w-auto max-w-full">
                        {[
                            { id: 'all', label: 'All Accounts & Cards' },
                            { id: 'savings', label: 'Digital Savings' },
                            { id: 'credit_card', label: 'Credit Cards' },
                            { id: 'checking', label: 'Debit & Checking' },
                            { id: 'e_wallet', label: 'E-Wallets' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedType(tab.id)}
                                className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${selectedType === tab.id
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search bank, MariBank, GoTyme..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                </div>

                {/* Visual Digital Bank & Credit/Debit Cards Grid or List View */}
                {viewMode === 'grid' ? (
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0 w-full">
                        {paginatedAccounts.map((acc) => {
                            const n = acc.bank_name.toLowerCase();
                            const isMari = n.includes('mari');
                            const isGoTyme = n.includes('gotyme');
                            const isMaya = n.includes('maya');
                            const isTonik = n.includes('tonik');
                            const isBdo = n.includes('bdo');
                            const isBpi = n.includes('bpi');
                            const isGcash = n.includes('gcash');
                            const isMetro = n.includes('metro');

                            const styleConfig =
                                COLOR_MAP[acc.color] ||
                                (isMari ? COLOR_MAP.maribank :
                                isGoTyme ? COLOR_MAP.gotyme :
                                isMaya ? COLOR_MAP.maya :
                                isTonik ? COLOR_MAP.tonik :
                                isBdo ? COLOR_MAP.bdo :
                                isBpi ? COLOR_MAP.bpi :
                                isGcash ? COLOR_MAP.gcash :
                                isMetro ? COLOR_MAP.metrobank :
                                COLOR_MAP.emerald);

                            const isCredit = acc.account_type === 'credit_card' || acc.card_type === 'credit';

                            return (
                                <div
                                    key={acc.id}
                                    className="animate-fade-in-up card-interactive group relative overflow-hidden rounded-2xl border bg-card shadow-sm flex flex-col justify-between min-w-0 w-full"
                                >
                                    {/* Realistic Credit/Debit Digital Bank Card Header */}
                                    <div className={`h-36 p-4 sm:p-5 bg-gradient-to-br ${styleConfig.gradient} text-white flex flex-col justify-between relative overflow-hidden shadow-inner`}>
                                        {/* Abstract background shine pattern */}
                                        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

                                        <div className="flex items-start justify-between relative z-10 gap-2 min-w-0">
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <BankBrandLogo name={acc.bank_name} className="h-8 w-8 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-sm sm:text-base font-extrabold truncate leading-tight tracking-wide">{acc.bank_name}</h4>
                                                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest opacity-80 bg-white/15 px-1.5 py-0.5 rounded truncate max-w-full">
                                                        {acc.card_type ? `${acc.card_type} card` : acc.account_type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* EMV Metallic Chip */}
                                            <div className="h-7 w-9 shrink-0 rounded border border-amber-300/50 bg-gradient-to-tr from-amber-400/80 to-yellow-200/90 shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
                                                <div className="h-4 w-6 rounded-sm border border-amber-500/40 bg-amber-300/40" />
                                            </div>
                                        </div>

                                        {/* Card Number & Brand Network Logo */}
                                        <div className="flex items-end justify-between relative z-10 mt-2 gap-2 min-w-0">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[11px] font-medium opacity-90 truncate max-w-full mb-0.5">{acc.account_name}</div>
                                                {acc.account_number_last4 ? (
                                                    <span className="font-mono text-xs sm:text-sm tracking-wider sm:tracking-widest drop-shadow-sm font-semibold truncate block">
                                                        •••• •••• •••• {acc.account_number_last4}
                                                    </span>
                                                ) : (
                                                    <span className="font-mono text-[11px] sm:text-xs tracking-wider opacity-75 truncate block">VIRTUAL ACCOUNT</span>
                                                )}
                                            </div>
                                            <div className="shrink-0 flex items-center">
                                                <CardNetworkLogo network={acc.card_network} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body Details */}
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0">
                                        <div className="min-w-0">
                                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-0.5 gap-2">
                                                <span className="truncate">{isCredit ? 'Outstanding Balance' : 'Current Balance'}</span>
                                                <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-muted shrink-0">
                                                    {acc.currency}
                                                </span>
                                            </div>
                                            <div className={`text-xl sm:text-2xl font-bold truncate ${isCredit && acc.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                                                {formatCurrency(acc.balance)}
                                            </div>

                                            {acc.credit_limit && (
                                                <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between border-t pt-2 gap-2 min-w-0">
                                                    <span className="shrink-0">Credit Limit:</span>
                                                    <span className="font-semibold text-foreground truncate">{formatCurrency(acc.credit_limit)}</span>
                                                </div>
                                            )}

                                            {acc.notes && (
                                                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 italic bg-muted/30 p-2 rounded-lg border break-words">
                                                    "{acc.notes}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                            <button
                                                onClick={() => openEditModal(acc)}
                                                className="p-1.5 rounded-lg border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                title="Edit Account / Card"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAccount(acc.id)}
                                                className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                                title="Delete Account"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Table / List View */
                    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden min-w-0 w-full animate-fade-in-up">
                        <div className="overflow-x-auto min-w-0 w-full scrollbar-none">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 transition-colors">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Bank / Institution</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Account Name & Number</th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Type</th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Network</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Balance</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Credit Limit</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {paginatedAccounts.map((acc) => {
                                        const isCredit = acc.account_type === 'credit_card' || acc.card_type === 'credit';
                                        return (
                                            <tr key={acc.id} className="transition-colors hover:bg-muted/30">
                                                <td className="p-4 align-middle font-bold text-foreground">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <BankBrandLogo name={acc.bank_name} className="h-7 w-7 text-[10px] shrink-0" />
                                                        <div className="min-w-0">
                                                            <span className="truncate block font-semibold text-foreground text-sm">{acc.bank_name}</span>
                                                            {acc.notes && (
                                                                <span className="text-[11px] text-muted-foreground truncate block max-w-[180px] font-normal">{acc.notes}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle min-w-0">
                                                    <div className="font-medium text-foreground text-xs truncate max-w-[180px]">{acc.account_name}</div>
                                                    <div className="font-mono text-[11px] text-muted-foreground tracking-wide">
                                                        {acc.account_number_last4 ? `•••• •••• •••• ${acc.account_number_last4}` : 'Virtual / No Card'}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-center whitespace-nowrap">
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground">
                                                        {acc.card_type ? `${acc.card_type} card` : acc.account_type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-center whitespace-nowrap">
                                                    <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border">
                                                        {acc.card_network && acc.card_network !== 'none' ? acc.card_network : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-right whitespace-nowrap">
                                                    <div className={`font-bold text-sm ${isCredit && acc.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                                                        {formatCurrency(acc.balance)}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">{acc.currency}</div>
                                                </td>
                                                <td className="p-4 align-middle text-right text-xs text-muted-foreground whitespace-nowrap">
                                                    {acc.credit_limit ? (
                                                        <span className="font-medium text-foreground">{formatCurrency(acc.credit_limit)}</span>
                                                    ) : (
                                                        <span>—</span>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => openEditModal(acc)}
                                                            className="p-1.5 rounded-lg border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                            title="Edit Account / Card"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAccount(acc.id)}
                                                            className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                                            title="Delete Account"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <ClientPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredAccounts.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                    className="pt-2"
                />

                {filteredAccounts.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 sm:p-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                            <Landmark className="h-6 w-6" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">No accounts or cards found</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                            Start by adding your MariBank, GoTyme, Maya, UnionDigital, Tonik, or Credit/Debit card!
                        </p>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-xs sm:text-sm hover:bg-emerald-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" /> Add First Account
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for Add / Edit Account */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <div className="w-full max-w-lg rounded-2xl bg-background border shadow-2xl overflow-hidden p-4 sm:p-6 text-foreground max-h-[90vh] flex flex-col my-auto">
                        <div className="flex items-center justify-between border-b pb-3 sm:pb-4 mb-3 sm:mb-4 shrink-0">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
                                <Building2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                <span className="truncate">{editingAccount ? 'Edit Account / Card' : 'Add Bank Account or Card'}</span>
                            </h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveAccount} className="space-y-4 overflow-y-auto pr-1 flex-1">
                            {/* Preset Digital Bank Buttons */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    Quick Select Bank / Digital Institution
                                </label>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {PRESET_BANKS.map((item) => (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => {
                                                accountForm.setData({
                                                    ...accountForm.data,
                                                    bank_name: item.name,
                                                    color: item.color,
                                                    account_type: item.type as any,
                                                    card_type: item.card_type,
                                                    card_network: item.card_network,
                                                });
                                            }}
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${accountForm.data.bank_name === item.name
                                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                                                : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            <BankBrandLogo name={item.name} className="h-4 w-4 text-[9px] shrink-0" />
                                            <span className="truncate">{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Bank Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. MariBank, GoTyme"
                                        value={accountForm.data.bank_name}
                                        onChange={(e) => accountForm.setData('bank_name', e.target.value)}
                                        className={`w-full rounded-lg border ${accountForm.errors.bank_name ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                                    />
                                    {accountForm.errors.bank_name && <p className="text-xs text-rose-500 mt-1 font-medium">{accountForm.errors.bank_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Account / Card Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Mari Savings, Travel Credit"
                                        value={accountForm.data.account_name}
                                        onChange={(e) => accountForm.setData('account_name', e.target.value)}
                                        className={`w-full rounded-lg border ${accountForm.errors.account_name ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                                    />
                                    {accountForm.errors.account_name && <p className="text-xs text-rose-500 mt-1 font-medium">{accountForm.errors.account_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Account Category</label>
                                    <select
                                        value={accountForm.data.account_type}
                                        onChange={(e) => accountForm.setData('account_type', e.target.value as any)}
                                        className={`w-full rounded-lg border ${accountForm.errors.account_type ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                                    >
                                        <option value="savings">Digital Savings</option>
                                        <option value="checking">Checking / Everyday</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="e_wallet">E-Wallet</option>
                                        <option value="investment">Investment</option>
                                    </select>
                                    {accountForm.errors.account_type && <p className="text-xs text-rose-500 mt-1 font-medium">{accountForm.errors.account_type}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Last 4 Digits (Optional)</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="e.g. 8821"
                                        value={accountForm.data.account_number_last4}
                                        onChange={(e) => accountForm.setData('account_number_last4', e.target.value)}
                                        className={`w-full rounded-lg border ${accountForm.errors.account_number_last4 ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                                    />
                                    {accountForm.errors.account_number_last4 && <p className="text-xs text-rose-500 mt-1 font-medium">{accountForm.errors.account_number_last4}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Card Type</label>
                                    <select
                                        value={accountForm.data.card_type}
                                        onChange={(e) => accountForm.setData('card_type', e.target.value)}
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="debit">Debit Card</option>
                                        <option value="credit">Credit Card</option>
                                        <option value="virtual">Virtual Card</option>
                                        <option value="none">No Physical Card</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Card Network</label>
                                    <select
                                        value={accountForm.data.card_network}
                                        onChange={(e) => accountForm.setData('card_network', e.target.value)}
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="visa">Visa</option>
                                        <option value="mastercard">Mastercard</option>
                                        <option value="jcb">JCB</option>
                                        <option value="none">N/A</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Current Balance (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        value={accountForm.data.balance}
                                        onChange={(e) => accountForm.setData('balance', e.target.value)}
                                        className={`w-full rounded-lg border ${accountForm.errors.balance ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                                    />
                                    {accountForm.errors.balance && <p className="text-xs text-rose-500 mt-1 font-medium">{accountForm.errors.balance}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">
                                        {accountForm.data.account_type === 'credit_card' ? 'Credit Limit (₱)' : 'Color Theme'}
                                    </label>
                                    {accountForm.data.account_type === 'credit_card' ? (
                                        <>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="150000.00"
                                                value={accountForm.data.credit_limit}
                                                onChange={(e) => accountForm.setData('credit_limit', e.target.value)}
                                                className={`w-full rounded-lg border ${accountForm.errors.credit_limit ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm`}
                                            />
                                            {accountForm.errors.credit_limit && <p className="text-xs text-rose-500 mt-1 font-medium">{accountForm.errors.credit_limit}</p>}
                                        </>
                                    ) : (
                                        <select
                                            value={accountForm.data.color}
                                            onChange={(e) => accountForm.setData('color', e.target.value)}
                                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm capitalize"
                                        >
                                            <option value="maribank">MariBank (Teal Debit Card)</option>
                                            <option value="maribank-orange">MariBank (Orange Brand)</option>
                                            <option value="gotyme">GoTyme Bank (Teal / Cyan)</option>
                                            <option value="maya">Maya Bank (Obsidian Emerald)</option>
                                            <option value="tonik">Tonik Bank (Neon Purple)</option>
                                            <option value="bdo">BDO Unibank (Navy Blue & Gold)</option>
                                            <option value="bpi">BPI (Crimson Red)</option>
                                            <option value="gcash">GCash (Royal Blue)</option>
                                            <option value="metrobank">Metrobank (Prestige Blue)</option>
                                            <option value="orange">UnionBank (Sunset Orange)</option>
                                            <option value="amber">UnionDigital (Amber Gold)</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Notes (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Account details, rewards, or interest rates..."
                                    value={accountForm.data.notes}
                                    onChange={(e) => accountForm.setData('notes', e.target.value)}
                                    className={`w-full rounded-lg border ${accountForm.errors.notes ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                                />
                                {accountForm.errors.notes && <p className="text-xs text-rose-500 mt-1 font-medium">{accountForm.errors.notes}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={accountForm.processing}
                                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                                >
                                    {accountForm.processing ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Transfer Funds */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <div className="w-full max-w-md rounded-2xl bg-background border overflow-hidden p-4 sm:p-6 text-foreground max-h-[90vh] flex flex-col my-auto">
                        <div className="flex items-center justify-between border-b pb-3 sm:pb-4 mb-3 sm:mb-4 shrink-0">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
                                <ArrowRightLeft className="h-5 w-5 text-emerald-600 shrink-0" />
                                <span className="truncate">Transfer Funds Between Accounts</span>
                            </h3>
                            <button
                                onClick={() => setIsTransferModalOpen(false)}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleTransfer} className="space-y-4 overflow-y-auto pr-1 flex-1">
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">From Account (Source)</label>
                                <select
                                    required
                                    value={transferForm.data.from_account_id}
                                    onChange={(e) => transferForm.setData('from_account_id', e.target.value)}
                                    className={`w-full rounded-lg border ${transferForm.errors.from_account_id ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm truncate`}
                                >
                                    {bankAccounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.bank_name} - {acc.account_name} ({formatCurrency(acc.balance)})
                                        </option>
                                    ))}
                                </select>
                                {transferForm.errors.from_account_id && <p className="text-xs text-rose-500 mt-1 font-medium">{transferForm.errors.from_account_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">To Account (Destination)</label>
                                <select
                                    required
                                    value={transferForm.data.to_account_id}
                                    onChange={(e) => transferForm.setData('to_account_id', e.target.value)}
                                    className={`w-full rounded-lg border ${transferForm.errors.to_account_id ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm truncate`}
                                >
                                    {bankAccounts
                                        .filter((acc) => acc.id.toString() !== transferForm.data.from_account_id)
                                        .map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.bank_name} - {acc.account_name} ({formatCurrency(acc.balance)})
                                            </option>
                                        ))}
                                </select>
                                {transferForm.errors.to_account_id && <p className="text-xs text-rose-500 mt-1 font-medium">{transferForm.errors.to_account_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Transfer Amount (₱)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    placeholder="0.00"
                                    value={transferForm.data.amount}
                                    onChange={(e) => transferForm.setData('amount', e.target.value)}
                                    className={`w-full rounded-lg border ${transferForm.errors.amount ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm font-bold text-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                                />
                                {transferForm.errors.amount && <p className="text-xs text-rose-500 mt-1 font-medium">{transferForm.errors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Note (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. MariBank savings transfer, GoTyme load"
                                    value={transferForm.data.notes}
                                    onChange={(e) => transferForm.setData('notes', e.target.value)}
                                    className={`w-full rounded-lg border ${transferForm.errors.notes ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm`}
                                />
                                {transferForm.errors.notes && <p className="text-xs text-rose-500 mt-1 font-medium">{transferForm.errors.notes}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsTransferModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={transferForm.processing}
                                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {transferForm.processing ? 'Transferring...' : 'Execute Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

declare function route(name: string, params?: any): string;
