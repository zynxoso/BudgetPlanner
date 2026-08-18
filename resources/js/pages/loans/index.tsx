import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { SectionNav } from '@/components/section-nav';
import { 
    HandCoins, 
    Plus, 
    Calendar, 
    CreditCard, 
    Trash2, 
    ArrowRight, 
    LayoutGrid, 
    List, 
    ShoppingBag, 
    Smartphone, 
    Building2, 
    Sparkles, 
    TrendingUp, 
    CheckCircle2, 
    Clock, 
    DollarSign,
    Percent
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Loan Tracking', href: '/loans' },
];

interface Loan {
    id: number;
    name: string;
    amount: string;
    remaining_amount: string;
    interest_rate: string;
    accrued_interest?: number;
    due_date: string;
    date_borrowed: string;
    status: 'active' | 'paid';
}

interface Props {
    loans: Loan[];
}

// Preset Philippine Buy Now Pay Later (BNPL) & Digital Bank Loans
const PRESET_LOANS = [
    { name: 'SPayLater (Shopee)', category: 'bnpl', desc: 'Shopee Installments & PayLater', icon: 'shopee', color: 'orange' },
    { name: 'SLoan (Shopee)', category: 'cash_loan', desc: 'Shopee Cash Personal Loan', icon: 'shopee', color: 'orange' },
    { name: 'MariBank Loan', category: 'digital_bank', desc: 'MariBank Personal Credit / Loan', icon: 'maribank', color: 'orange' },
    { name: 'TikTok PayLater', category: 'bnpl', desc: 'TikTok Shop Installments', icon: 'tiktok', color: 'slate' },
    { name: 'GGives (GCash)', category: 'bnpl', desc: 'GCash Installment PayLater', icon: 'gcash', color: 'indigo' },
    { name: 'GCredit (GCash)', category: 'credit_line', desc: 'GCash Revolving Credit Line', icon: 'gcash', color: 'indigo' },
    { name: 'GLoan (GCash)', category: 'cash_loan', desc: 'GCash Personal Cash Loan', icon: 'gcash', color: 'indigo' },
    { name: 'Maya Personal Loan', category: 'digital_bank', desc: 'Maya Bank Personal Cash Loan', icon: 'maya', color: 'emerald' },
    { name: 'GoTyme Personal Loan', category: 'digital_bank', desc: 'GoTyme Bank Personal Cash Loan', icon: 'gotyme', color: 'cyan' },
    { name: 'Tonik Quick Loan', category: 'digital_bank', desc: 'Tonik Digital Bank Quick Loan', icon: 'tonik', color: 'purple' },
    { name: 'UnionDigital Loan', category: 'digital_bank', desc: 'UnionDigital Quick Credit', icon: 'ud', color: 'amber' },
    { name: 'Lazada LazPayLater', category: 'bnpl', desc: 'Lazada Shopping Installment', icon: 'lazada', color: 'blue' },
    { name: 'Home Credit', category: 'installment', desc: 'Product Installment & Cash Loan', icon: 'homecredit', color: 'rose' },
    { name: 'BDO Personal Loan', category: 'bank_loan', desc: 'BDO Unibank Personal Credit', icon: 'bdo', color: 'blue' },
    { name: 'BPI Personal Loan', category: 'bank_loan', desc: 'BPI Personal & Salary Loan', icon: 'bpi', color: 'rose' },
];

function LoanBrandBadge({ name, className = 'h-7 w-7' }: { name: string; className?: string }) {
    const n = name.toLowerCase();

    if (n.includes('spaylater')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-orange-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/LOAN-PAYLATERS-LOGO/spaylater.jpg" alt="SPayLater" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('sloan')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-orange-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/LOAN-PAYLATERS-LOGO/sloan.jpg" alt="SLoan" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('shopee')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-orange-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/LOAN-PAYLATERS-LOGO/spaylater.jpg" alt="Shopee" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('tiktok')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-black p-0.5 shadow-2xs border border-pink-500/50 overflow-hidden shrink-0 ${className}`}>
                <img src="/LOAN-PAYLATERS-LOGO/tiktok.webp" alt="TikTok PayLater" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('ggives')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-blue-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/LOAN-PAYLATERS-LOGO/ggives.png" alt="GGives" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('gcredit')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-blue-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/LOAN-PAYLATERS-LOGO/gcredit.jpg" alt="GCredit" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('gloan')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-blue-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/LOAN-PAYLATERS-LOGO/gloan.jpg" alt="GLoan" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('maribank') || n.includes('mari')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-orange-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/LOAN-PAYLATERS-LOGO/maribank.jpg" alt="MariBank Loan" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('gotyme')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-cyan-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/banks-logo/gotyme.png" alt="GoTyme Bank" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('maya')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-emerald-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/banks-logo/maya.jpg" alt="Maya Bank" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('gcash') || n.includes('ggives') || n.includes('gcredit') || n.includes('gloan')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-blue-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/banks-logo/gcash.png" alt="GCash" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('tonik')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-purple-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/banks-logo/tonik.png" alt="Tonik Bank" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('uniondigital') || n.includes('ud')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-amber-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/banks-logo/uniondigital.png" alt="UnionDigital" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('unionbank') || n.includes('union bank')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-orange-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/banks-logo/unionbank.webp" alt="UnionBank" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('bdo')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-blue-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/banks-logo/bdo.jpg" alt="BDO" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('bpi')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-red-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/banks-logo/bpi.png" alt="BPI" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('metrobank') || n.includes('metro')) {
        return (
            <div className={`relative flex items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs border border-blue-200/60 overflow-hidden shrink-0 ${className}`}>
                <img src="/banks-logo/metrobank.jpg" alt="Metrobank" className="h-full w-full object-contain rounded-md" />
            </div>
        );
    }
    if (n.includes('lazada') || n.includes('lazpaylater')) {
        return (
            <div className={`flex items-center justify-center rounded-lg bg-blue-700 text-pink-400 font-extrabold text-xs shadow ${className}`}>
                L
            </div>
        );
    }
    if (n.includes('home credit')) {
        return (
            <div className={`flex items-center justify-center rounded-lg bg-red-600 text-white font-extrabold text-xs shadow ${className}`}>
                HC
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs ${className}`}>
            <HandCoins className="h-4 w-4" />
        </div>
    );
}

const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function LoansPage({ loans }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [loanToDelete, setLoanToDelete] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    const addLoanForm = useForm({
        name: '',
        amount: '',
        interest_rate: '0',
        due_date: '',
        date_borrowed: getLocalDateString(),
    });

    const paymentForm = useForm({
        amount: '',
    });

    const openAddModal = () => {
        addLoanForm.reset();
        addLoanForm.clearErrors();
        addLoanForm.setData({
            name: '',
            amount: '',
            interest_rate: '0',
            due_date: '',
            date_borrowed: getLocalDateString(),
        });
        setIsAddModalOpen(true);
    };

    const openPaymentModal = (loan: Loan) => {
        setSelectedLoan(loan);
        paymentForm.reset();
        paymentForm.clearErrors();
    };

    const totalActiveLoanAmount = useMemo(
        () => loans.filter((l) => l.status === 'active').reduce((sum, l) => sum + Number(l.remaining_amount), 0),
        [loans]
    );

    const totalOriginalLoanAmount = useMemo(
        () => loans.reduce((sum, l) => sum + Number(l.amount), 0),
        [loans]
    );

    const totalPaidAmount = totalOriginalLoanAmount - totalActiveLoanAmount;
    const overallProgress = totalOriginalLoanAmount > 0 ? (totalPaidAmount / totalOriginalLoanAmount) * 100 : 0;

    const loanCards = useMemo(
        () =>
            loans.map((loan) => {
                const amount = Number(loan.amount);
                const remaining = Number(loan.remaining_amount);
                const paid = amount - remaining;
                const progress = amount > 0 ? (paid / amount) * 100 : 0;

                return {
                    ...loan,
                    amountLabel: amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }),
                    remainingLabel: remaining.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }),
                    progress,
                    clampedProgress: Math.min(progress, 100),
                    borrowedLabel: loan.date_borrowed ? loan.date_borrowed.substring(0, 10) : '—',
                    dueLabel: loan.due_date ? loan.due_date.substring(0, 10) : '—',
                };
            }),
        [loans]
    );

    const filteredLoanCards = useMemo(() => {
        if (filterCategory === 'all') return loanCards;
        if (filterCategory === 'active') return loanCards.filter((l) => l.status === 'active');
        if (filterCategory === 'paid') return loanCards.filter((l) => l.status === 'paid');
        if (filterCategory === 'bnpl') return loanCards.filter((l) => 
            l.name.toLowerCase().includes('spaylater') || 
            l.name.toLowerCase().includes('tiktok') || 
            l.name.toLowerCase().includes('ggives') ||
            l.name.toLowerCase().includes('lazpaylater')
        );
        return loanCards;
    }, [loanCards, filterCategory]);

    const submitAddLoan = (e: React.FormEvent) => {
        e.preventDefault();
        addLoanForm.post(route('loans.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addLoanForm.reset();
            },
        });
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan) return;

        paymentForm.patch(route('loans.payment', { loan: selectedLoan.id }), {
            onSuccess: () => {
                setSelectedLoan(null);
                paymentForm.reset();
            },
        });
    };

    const handleDeleteClick = (id: number) => {
        setLoanToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (loanToDelete) {
            router.delete(route('loans.destroy', { loan: loanToDelete }), {
                onSuccess: () => setIsDeleteDialogOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan & PayLater Tracking" />

            <div className="p-4 md:p-8 space-y-8">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Loans & PayLater</h2>
                        <p className="text-muted-foreground">Manage your debts and repayments</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg border bg-card p-1">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'table' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                        <button 
                            onClick={() => {
                                addLoanForm.reset();
                                setIsAddModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Loan
                        </button>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <SectionNav group="planning" />

                {/* Summary Banner Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="animate-fade-in-up stagger-1 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-rose-500/10 via-rose-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <CreditCard className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Total Active Debt</span>
                                <div className="h-10 w-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight mt-4">
                                ₱{totalActiveLoanAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Remaining balance to settle</p>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-2 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <CheckCircle2 className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Total Repaid So Far</span>
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-4">
                                ₱{totalPaidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                                {overallProgress.toFixed(0)}% overall repayment rate
                            </p>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-3 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 via-amber-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Clock className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Active Loan Accounts</span>
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-4">
                                {loans.filter((l) => l.status === 'active').length}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Ongoing PayLater & personal loans</p>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-4 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 via-indigo-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Sparkles className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Fully Settled</span>
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-4">
                                {loans.filter((l) => l.status === 'paid').length}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Completed loan obligations</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto border-b pb-4 w-full min-w-0 max-w-full scrollbar-none">
                    {[
                        { id: 'all', label: `All Loans (${loans.length})` },
                        { id: 'active', label: `Active (${loans.filter((l) => l.status === 'active').length})` },
                        { id: 'bnpl', label: 'PayLater (SPayLater, TikTok, GGives)' },
                        { id: 'paid', label: `Paid (${loans.filter((l) => l.status === 'paid').length})` },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterCategory(tab.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                filterCategory === tab.id
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Grid View */}
                {viewMode === 'grid' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredLoanCards.map((loan) => (
                            <div 
                                key={loan.id} 
                                className={`animate-fade-in-up card-interactive rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
                                    loan.status === 'paid' ? 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30' : 'hover:border-amber-500/40 dark:hover:border-amber-500/30'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <LoanBrandBadge name={loan.name} className="h-9 w-9" />
                                            <div>
                                                <h4 className="font-bold text-lg text-foreground leading-snug">{loan.name}</h4>
                                                <span className="text-xs text-muted-foreground">Borrowed: {loan.borrowedLabel}</span>
                                            </div>
                                        </div>
                                        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            loan.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {loan.status === 'paid' ? 'SETTLED' : 'ACTIVE'}
                                        </div>
                                    </div>

                                    {/* Financial numbers */}
                                    <div className="space-y-3 my-4">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs text-muted-foreground font-medium">Remaining Balance:</span>
                                            <span className="text-xl font-extrabold text-foreground">{loan.remainingLabel}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                                            <span>Original Amount: <strong className="text-foreground">{loan.amountLabel}</strong></span>
                                            <span>Interest: <strong className="text-foreground">{loan.interest_rate}%</strong></span>
                                        </div>
                                        {Boolean(loan.accrued_interest && loan.accrued_interest > 0) && (
                                            <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                <span>Accrued Interest:</span>
                                                <span>₱{Number(loan.accrued_interest).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div 
                                                className={`h-full transition-all duration-500 rounded-full ${loan.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                                style={{ width: `${loan.clampedProgress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-medium">
                                            <span className="text-muted-foreground">Repaid {loan.progress.toFixed(0)}%</span>
                                            <span className="text-muted-foreground">Due: {loan.dueLabel}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex items-center justify-end gap-2 border-t pt-4">
                                    {loan.status === 'active' && (
                                        <button 
                                            onClick={() => openPaymentModal(loan)}
                                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                                        >
                                            Record Payment
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDeleteClick(loan.id)}
                                        className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                        title="Delete Loan Record"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 transition-colors">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Lender / Loan Name</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Original Amount</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Remaining Balance</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Progress</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Due Date</th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredLoanCards.map((loan) => (
                                        <tr key={loan.id} className="transition-colors hover:bg-muted/30">
                                            <td className="p-4 align-middle font-bold text-foreground">
                                                <div className="flex items-center gap-2.5">
                                                    <LoanBrandBadge name={loan.name} className="h-7 w-7 text-[10px]" />
                                                    <span>{loan.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-right font-medium">{loan.amountLabel}</td>
                                            <td className="p-4 align-middle text-right font-bold text-foreground">{loan.remainingLabel}</td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                        <div 
                                                            className={`h-full ${loan.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${loan.clampedProgress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] w-6">{loan.progress.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground whitespace-nowrap">
                                                {loan.dueLabel}
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                                    loan.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                }`}>
                                                    {loan.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {loan.status === 'active' && (
                                                        <button 
                                                            onClick={() => openPaymentModal(loan)}
                                                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-semibold text-white transition-colors"
                                                        >
                                                            Pay
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteClick(loan.id)}
                                                        className="rounded-lg border border-rose-500/20 text-rose-500 p-1.5 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLoanCards.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground">No loan accounts found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Loan Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl bg-card border border-border overflow-hidden p-6 text-card-foreground">
                        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <HandCoins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Add Loan or PayLater
                            </h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm font-medium"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitAddLoan} className="space-y-4">
                            {/* Preset Philippine Loan Quick Chips */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    Quick Select Philippine Lender / PayLater
                                </label>
                                <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto p-2 border border-border rounded-xl bg-muted/40">
                                    {PRESET_LOANS.map((item) => (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => {
                                                addLoanForm.setData('name', item.name);
                                            }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                                addLoanForm.data.name === item.name
                                                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                                                    : 'bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <LoanBrandBadge name={item.name} className="h-4 w-4 text-[9px]" />
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Lender / Loan Name</label>
                                <input 
                                    type="text" 
                                    className={`w-full rounded-xl border ${addLoanForm.errors.name ? 'border-rose-500' : 'border-input'} bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`} 
                                    placeholder="e.g. SPayLater, MariBank Loan, TikTok PayLater"
                                    value={addLoanForm.data.name}
                                    onChange={e => addLoanForm.setData('name', e.target.value)}
                                    required
                                />
                                {addLoanForm.errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{addLoanForm.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Total Loan Amount (₱)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className={`w-full rounded-xl border ${addLoanForm.errors.amount ? 'border-rose-500' : 'border-input'} bg-background px-3.5 py-2.5 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`} 
                                        placeholder="0.00"
                                        value={addLoanForm.data.amount}
                                        onChange={e => addLoanForm.setData('amount', e.target.value)}
                                        required
                                    />
                                    {addLoanForm.errors.amount && <p className="text-xs text-rose-500 mt-1 font-medium">{addLoanForm.errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Interest Rate (% p.a.)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className={`w-full rounded-xl border ${addLoanForm.errors.interest_rate ? 'border-rose-500' : 'border-input'} bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`} 
                                        placeholder="0"
                                        value={addLoanForm.data.interest_rate}
                                        onChange={e => addLoanForm.setData('interest_rate', e.target.value)}
                                    />
                                    {addLoanForm.errors.interest_rate && <p className="text-xs text-rose-500 mt-1 font-medium">{addLoanForm.errors.interest_rate}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Date Borrowed</label>
                                    <input 
                                        type="date" 
                                        className={`w-full rounded-xl border ${addLoanForm.errors.date_borrowed ? 'border-rose-500' : 'border-input'} bg-background px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                                        value={addLoanForm.data.date_borrowed}
                                        onChange={e => addLoanForm.setData('date_borrowed', e.target.value)}
                                        required
                                    />
                                    {addLoanForm.errors.date_borrowed && <p className="text-xs text-rose-500 mt-1 font-medium">{addLoanForm.errors.date_borrowed}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Due Date (Optional)</label>
                                    <input 
                                        type="date" 
                                        className={`w-full rounded-xl border ${addLoanForm.errors.due_date ? 'border-rose-500' : 'border-input'} bg-background px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                                        value={addLoanForm.data.due_date}
                                        onChange={e => addLoanForm.setData('due_date', e.target.value)}
                                    />
                                    {addLoanForm.errors.due_date && <p className="text-xs text-rose-500 mt-1 font-medium">{addLoanForm.errors.due_date}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddModalOpen(false)} 
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={addLoanForm.processing} 
                                    className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {addLoanForm.processing ? 'Saving...' : 'Save Loan Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl bg-background border overflow-hidden p-6 text-foreground">
                        <div className="flex items-center gap-2.5 mb-2">
                            <LoanBrandBadge name={selectedLoan.name} className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Repay {selectedLoan.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                            Record a repayment to deduct from remaining balance.
                        </p>

                        <form onSubmit={submitPayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Repayment Amount (₱)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className={`w-full rounded-lg border ${paymentForm.errors.amount ? 'border-rose-500' : 'border-emerald-500'} bg-background p-3 text-xl font-bold text-foreground focus:ring-2 focus:ring-emerald-500/20`} 
                                    placeholder="0.00"
                                    value={paymentForm.data.amount}
                                    onChange={e => paymentForm.setData('amount', e.target.value)}
                                    required
                                    autoFocus
                                />
                                {paymentForm.errors.amount && <p className="text-xs text-rose-500 mt-1 font-medium">{paymentForm.errors.amount}</p>}
                            </div>

                            <div className="bg-muted/40 p-3 rounded-xl border text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Original Total:</span>
                                    <span className="font-semibold">{parseFloat(selectedLoan.amount).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current Remaining:</span>
                                    <span className="font-bold text-rose-600 dark:text-rose-400">{parseFloat(selectedLoan.remaining_amount).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedLoan(null)} 
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={paymentForm.processing} 
                                    className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {paymentForm.processing ? 'Recording...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationDialog 
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Loan Record"
                description="Are you sure you want to delete this loan or PayLater record? This will permanently remove the record and all payment history."
            />
        </AppLayout>
    );
}

declare function route(name: string, params?: any): string;
