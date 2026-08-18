import { Head, Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { 
    Printer, 
    Download, 
    ArrowLeft, 
    CheckCircle2,
    SlidersHorizontal,
    FileText,
    Layers,
    BookOpen
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

interface BankAccountItem {
    id: number;
    bank_name: string;
    account_name: string;
    account_number_last4: string;
    account_type: string;
    balance: number;
    currency: string;
    status: string;
}

interface LoanItem {
    id: number;
    name: string;
    amount: string | number;
    remaining_amount: string | number;
    interest_rate?: string | number;
    due_date?: string;
    date_borrowed?: string;
    status?: string;
}

interface SavingsGoalItem {
    id: number;
    name: string;
    target_amount: string | number;
    current_amount: string | number;
    deadline?: string;
}

interface LedgerItem {
    id: number;
    refNo: string;
    date: string;
    displayDate: string;
    valueDate: string;
    description: string;
    notes?: string;
    type: 'income' | 'expense';
    debit: number;
    credit: number;
    runningBalance: number;
}

interface CategorySummaryItem {
    name: string;
    value: number;
}

interface Props {
    user: {
        name: string;
        email: string;
        customerSince?: string;
    };
    statementMeta: {
        statementNo: string;
        accountNumber: string;
        issueDate: string;
        periodStart: string;
        periodEnd: string;
        statementPeriod: string;
        month: string;
        currency: string;
    };
    balanceSummary: {
        openingBalance: number;
        totalDeposits: number;
        totalWithdrawals: number;
        closingBalance: number;
        netChange: number;
        totalSavingsBalance: number;
        totalCheckingBalance: number;
        totalCreditDebt: number;
    };
    bankAccounts: BankAccountItem[];
    categorySummary: CategorySummaryItem[];
    totalCategorySpent: number;
    loans: LoanItem[];
    loanSummary: {
        total_original: number;
        total_remaining: number;
        total_paid: number;
    };
    savings: SavingsGoalItem[];
    savingsSummary: {
        total_target: number;
        total_current: number;
        total_needed: number;
    };
    ledger: LedgerItem[];
}

type PaperSize = 'a4' | 'letter' | 'legal13' | 'legal14';
type Density = 'compact' | 'standard' | 'spacious';
type MarginSize = 'minimal' | 'normal' | 'wide';
type PageSplitMode = 'auto' | '1page' | '2pages';

interface PaperConfig {
    name: string;
    shortName: string;
    widthMm: number;
    heightMm: number;
    widthPx: number;
    heightPx: number;
    sizeCss: string;
}

const PAPER_CONFIGS: Record<PaperSize, PaperConfig> = {
    a4: {
        name: 'A4 Standard (210 × 297 mm)',
        shortName: 'A4',
        widthMm: 210,
        heightMm: 297,
        widthPx: 794,
        heightPx: 1123,
        sizeCss: '210mm 297mm',
    },
    letter: {
        name: 'Short / Letter (8.5 × 11 in)',
        shortName: 'Short (Letter)',
        widthMm: 215.9,
        heightMm: 279.4,
        widthPx: 816,
        heightPx: 1056,
        sizeCss: '8.5in 11in',
    },
    legal13: {
        name: 'Long / Folio (8.5 × 13 in)',
        shortName: 'Long (8.5×13")',
        widthMm: 215.9,
        heightMm: 330.2,
        widthPx: 816,
        heightPx: 1248,
        sizeCss: '8.5in 13in',
    },
    legal14: {
        name: 'US Legal (8.5 × 14 in)',
        shortName: 'US Legal (8.5×14")',
        widthMm: 215.9,
        heightMm: 355.6,
        widthPx: 816,
        heightPx: 1344,
        sizeCss: '8.5in 14in',
    },
};

const MARGIN_CONFIGS: Record<MarginSize, { name: string; css: string }> = {
    minimal: { name: 'Compact (8mm)', css: '8mm' },
    normal: { name: 'Normal (12mm)', css: '12mm' },
    wide: { name: 'Spacious (18mm)', css: '18mm' },
};

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
});

function getBankLogoSrc(name: string): string | null {
    const n = name.toLowerCase();
    if (n.includes('mari')) return '/banks-logo/maribank.jpeg';
    if (n.includes('gotyme')) return '/banks-logo/gotyme.png';
    if (n.includes('maya')) return '/banks-logo/maya.jpg';
    if (n.includes('tonik')) return '/banks-logo/tonik.png';
    if (n.includes('bdo')) return '/banks-logo/bdo.jpg';
    if (n.includes('bpi')) return '/banks-logo/bpi.png';
    if (n.includes('gcash')) return '/banks-logo/gcash.png';
    if (n.includes('uniondigital') || n.includes('ud')) return '/banks-logo/uniondigital.png';
    if (n.includes('unionbank') || n.includes('union bank') || n.includes('ubp')) return '/banks-logo/unionbank.webp';
    if (n.includes('metrobank') || n.includes('metro')) return '/banks-logo/metrobank.jpg';
    return null;
}

function getLoanLogoSrc(name: string): string | null {
    const n = name.toLowerCase();
    if (n.includes('spaylater')) return '/LOAN-PAYLATERS-LOGO/spaylater.jpg';
    if (n.includes('sloan')) return '/LOAN-PAYLATERS-LOGO/sloan.jpg';
    if (n.includes('tiktok')) return '/LOAN-PAYLATERS-LOGO/tiktok.webp';
    if (n.includes('ggives')) return '/LOAN-PAYLATERS-LOGO/ggives.png';
    if (n.includes('gcredit')) return '/LOAN-PAYLATERS-LOGO/gcredit.jpg';
    if (n.includes('gloan')) return '/LOAN-PAYLATERS-LOGO/gloan.jpg';
    if (n.includes('maribank') || n.includes('mari')) return '/LOAN-PAYLATERS-LOGO/maribank.jpg';
    if (n.includes('maya')) return '/banks-logo/maya.jpg';
    if (n.includes('gotyme')) return '/banks-logo/gotyme.png';
    if (n.includes('tonik')) return '/banks-logo/tonik.png';
    if (n.includes('uniondigital') || n.includes('ud')) return '/banks-logo/uniondigital.png';
    if (n.includes('unionbank') || n.includes('union bank')) return '/banks-logo/unionbank.webp';
    if (n.includes('bdo')) return '/banks-logo/bdo.jpg';
    if (n.includes('bpi')) return '/banks-logo/bpi.png';
    if (n.includes('metrobank') || n.includes('metro')) return '/banks-logo/metrobank.jpg';
    return null;
}

export default function BankStatementPage({
    user,
    statementMeta,
    balanceSummary,
    bankAccounts = [],
    categorySummary = [],
    totalCategorySpent = 0,
    loans = [],
    loanSummary,
    savings = [],
    savingsSummary,
    ledger = [],
}: Props) {
    const [paperSize, setPaperSize] = useState<PaperSize>('a4');
    const [density, setDensity] = useState<Density>('standard');
    const [marginSize, setMarginSize] = useState<MarginSize>('normal');
    const [pageSplitMode, setPageSplitMode] = useState<PageSplitMode>('auto');
    const [showOptions, setShowOptions] = useState<boolean>(false);

    const formatCurrency = (amount: number) => currencyFormatter.format(amount || 0);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('print=true')) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, []);

    // Density styling tokens
    const densityClasses = useMemo(() => {
        switch (density) {
            case 'compact':
                return {
                    containerPadding: 'p-5 sm:p-7',
                    spacing: 'space-y-3.5',
                    headerPadding: 'pb-2.5',
                    textBase: 'text-[9.5px]',
                    tableText: 'text-[9px]',
                    cellPadding: 'p-1.5 pl-2',
                    cellHeaderPadding: 'p-1.5 pl-2',
                    sectionHeading: 'text-[9.5px]',
                    logoSize: 'h-7 w-7',
                    titleText: 'text-base sm:text-lg',
                };
            case 'spacious':
                return {
                    containerPadding: 'p-7 sm:p-10',
                    spacing: 'space-y-5',
                    headerPadding: 'pb-5',
                    textBase: 'text-[11.5px]',
                    tableText: 'text-[11px]',
                    cellPadding: 'p-2.5 pl-3',
                    cellHeaderPadding: 'p-2.5 pl-3',
                    sectionHeading: 'text-[11px]',
                    logoSize: 'h-10 w-10',
                    titleText: 'text-xl sm:text-2xl',
                };
            case 'standard':
            default:
                return {
                    containerPadding: 'p-6 sm:p-8',
                    spacing: 'space-y-4',
                    headerPadding: 'pb-3.5',
                    textBase: 'text-[10.5px]',
                    tableText: 'text-[10px]',
                    cellPadding: 'p-2 pl-2.5',
                    cellHeaderPadding: 'p-2 pl-2.5',
                    sectionHeading: 'text-[10px]',
                    logoSize: 'h-8 w-8',
                    titleText: 'text-lg sm:text-xl',
                };
        }
    }, [density]);

    const activeConfig = PAPER_CONFIGS[paperSize];

    // Compute sheet pixel dimensions
    const sheetMaxWidth = `${activeConfig.widthPx}px`;
    const sheetMinHeight = `${activeConfig.heightPx}px`;

    // Smart Pagination & Division Logic
    const { isMultiPage, page1Ledger, page2Ledger, totalPages } = useMemo(() => {
        if (pageSplitMode === '1page') {
            return {
                isMultiPage: false,
                page1Ledger: ledger,
                page2Ledger: [],
                totalPages: 1,
            };
        }

        if (pageSplitMode === '2pages') {
            const half = Math.ceil(ledger.length / 2) || 1;
            return {
                isMultiPage: true,
                page1Ledger: ledger.slice(0, half),
                page2Ledger: ledger.slice(half),
                totalPages: 2,
            };
        }

        // Auto mode:
        if (ledger.length <= 6 && (bankAccounts.length + loans.length) <= 6) {
            return {
                isMultiPage: false,
                page1Ledger: ledger,
                page2Ledger: [],
                totalPages: 1,
            };
        }

        const p1Limit = density === 'compact' ? 8 : density === 'spacious' ? 4 : 6;
        return {
            isMultiPage: true,
            page1Ledger: ledger.slice(0, p1Limit),
            page2Ledger: ledger.slice(p1Limit),
            totalPages: 2,
        };
    }, [ledger, bankAccounts.length, loans.length, density, pageSplitMode]);

    return (
        <div className="min-h-screen bg-zinc-300/80 text-zinc-900 print:bg-white print:text-black antialiased font-sans py-0 md:py-8 transition-colors overflow-x-auto">
            <Head title={`Bank Statement (${activeConfig.shortName}) - ${statementMeta.month} - ${user.name}`} />

            {/* Dynamic Print Engine Style Injection */}
            <style>{`
                @page {
                    size: ${activeConfig.sizeCss};
                    margin: ${MARGIN_CONFIGS[marginSize].css};
                }
                @media print {
                    html, body {
                        background: white !important;
                        color: black !important;
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        font-size: ${density === 'compact' ? '9pt' : density === 'spacious' ? '11pt' : '10pt'} !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .statement-page-sheet {
                        width: 100% !important;
                        max-width: none !important;
                        min-height: 98vh !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                        page-break-after: always !important;
                        break-after: page !important;
                    }
                    .statement-page-sheet:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }
                }
            `}</style>

            {/* Top Interactive Customization Toolbar (Hidden when printing) */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-300 shadow-sm px-4 sm:px-8 py-2.5 print:hidden">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Left: Navigation & Quick Status */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/reports"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Return to Analytics
                        </Link>

                        <div className="hidden sm:flex items-center gap-2 border-l border-zinc-200 pl-4 text-xs text-zinc-500">
                            <span className="inline-flex items-center gap-1 font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                                <FileText className="h-3.5 w-3.5 text-blue-900" /> {activeConfig.shortName}
                            </span>
                            <span className="font-semibold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
                            </span>
                        </div>
                    </div>

                    {/* Middle: Paper & Page Mode Customizers */}
                    <div className="flex flex-wrap items-center gap-2">
                        
                        {/* Paper Size Selector */}
                        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-300 text-xs">
                            <span className="px-1.5 text-[10px] font-bold uppercase text-zinc-500 hidden md:inline">Paper:</span>
                            <button
                                type="button"
                                onClick={() => setPaperSize('a4')}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                    paperSize === 'a4' 
                                        ? 'bg-blue-950 text-white shadow-xs' 
                                        : 'text-zinc-700 hover:bg-zinc-200'
                                }`}
                                title="A4 Standard (210 x 297 mm)"
                            >
                                A4
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaperSize('letter')}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                    paperSize === 'letter' 
                                        ? 'bg-blue-950 text-white shadow-xs' 
                                        : 'text-zinc-700 hover:bg-zinc-200'
                                }`}
                                title="Short / US Letter (8.5 x 11 in)"
                            >
                                Short
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaperSize('legal13')}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                    paperSize === 'legal13' 
                                        ? 'bg-blue-950 text-white shadow-xs' 
                                        : 'text-zinc-700 hover:bg-zinc-200'
                                }`}
                                title="Long / Philippine Folio (8.5 x 13 in)"
                            >
                                Long (13")
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaperSize('legal14')}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                    paperSize === 'legal14' 
                                        ? 'bg-blue-950 text-white shadow-xs' 
                                        : 'text-zinc-700 hover:bg-zinc-200'
                                }`}
                                title="US Legal (8.5 x 14 in)"
                            >
                                Legal (14")
                            </button>
                        </div>

                        {/* Page Division Selector */}
                        <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-300 text-xs">
                            <span className="px-1.5 text-[10px] font-bold uppercase text-zinc-500 hidden md:inline">Pages:</span>
                            <button
                                type="button"
                                onClick={() => setPageSplitMode('auto')}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                                    pageSplitMode === 'auto' 
                                        ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200 font-bold' 
                                        : 'text-zinc-600 hover:bg-zinc-200'
                                }`}
                                title="Auto-calculate best page division"
                            >
                                Auto
                            </button>
                            <button
                                type="button"
                                onClick={() => setPageSplitMode('1page')}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                                    pageSplitMode === '1page' 
                                        ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200 font-bold' 
                                        : 'text-zinc-600 hover:bg-zinc-200'
                                }`}
                                title="Force all content onto 1 compact page"
                            >
                                1 Page
                            </button>
                            <button
                                type="button"
                                onClick={() => setPageSplitMode('2pages')}
                                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                                    pageSplitMode === '2pages' 
                                        ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200 font-bold' 
                                        : 'text-zinc-600 hover:bg-zinc-200'
                                }`}
                                title="Divide content across 2 pages"
                            >
                                2 Pages
                            </button>
                        </div>

                        {/* Advanced Layout Options Dropdown Button */}
                        <button
                            type="button"
                            onClick={() => setShowOptions(!showOptions)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                showOptions 
                                    ? 'bg-zinc-900 text-white border-zinc-900' 
                                    : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                            }`}
                            title="Adjust Density & Margins"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" /> Options
                        </button>
                    </div>

                    {/* Right: Print & Export Actions */}
                    <div className="flex items-center gap-2">
                        <a
                            href="/reports/export"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 border border-zinc-300 rounded-md hover:bg-zinc-200 transition-all"
                        >
                            <Download className="h-3.5 w-3.5" /> CSV
                        </a>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-md hover:bg-blue-800 transition-all shadow-sm"
                        >
                            <Printer className="h-3.5 w-3.5" /> Print Statement ({totalPages} {totalPages === 1 ? 'Page' : 'Pages'})
                        </button>
                    </div>
                </div>

                {/* Expanded Customizer Panel */}
                {showOptions && (
                    <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-fadeIn">
                        
                        {/* Density Control */}
                        <div>
                            <span className="font-bold text-zinc-600 block mb-1">Content Density / Font Scale:</span>
                            <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-300">
                                <button
                                    type="button"
                                    onClick={() => setDensity('compact')}
                                    className={`py-1 rounded text-center font-medium ${
                                        density === 'compact' ? 'bg-white font-bold text-zinc-900 shadow-2xs' : 'text-zinc-600'
                                    }`}
                                >
                                    Compact
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDensity('standard')}
                                    className={`py-1 rounded text-center font-medium ${
                                        density === 'standard' ? 'bg-white font-bold text-zinc-900 shadow-2xs' : 'text-zinc-600'
                                    }`}
                                >
                                    Standard
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDensity('spacious')}
                                    className={`py-1 rounded text-center font-medium ${
                                        density === 'spacious' ? 'bg-white font-bold text-zinc-900 shadow-2xs' : 'text-zinc-600'
                                    }`}
                                >
                                    Spacious
                                </button>
                            </div>
                        </div>

                        {/* Margin Control */}
                        <div>
                            <span className="font-bold text-zinc-600 block mb-1">Print Margins:</span>
                            <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-300">
                                <button
                                    type="button"
                                    onClick={() => setMarginSize('minimal')}
                                    className={`py-1 rounded text-center font-medium ${
                                        marginSize === 'minimal' ? 'bg-white font-bold text-zinc-900 shadow-2xs' : 'text-zinc-600'
                                    }`}
                                >
                                    8mm (Tight)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMarginSize('normal')}
                                    className={`py-1 rounded text-center font-medium ${
                                        marginSize === 'normal' ? 'bg-white font-bold text-zinc-900 shadow-2xs' : 'text-zinc-600'
                                    }`}
                                >
                                    12mm (Normal)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMarginSize('wide')}
                                    className={`py-1 rounded text-center font-medium ${
                                        marginSize === 'wide' ? 'bg-white font-bold text-zinc-900 shadow-2xs' : 'text-zinc-600'
                                    }`}
                                >
                                    18mm (Wide)
                                </button>
                            </div>
                        </div>

                        {/* Paper Details Summary */}
                        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2 flex flex-col justify-center">
                            <span className="text-zinc-500 font-bold uppercase text-[10px]">Target Sheet Specification</span>
                            <span className="font-semibold text-zinc-900 text-xs mt-0.5">{activeConfig.name}</span>
                            <span className="text-[11px] text-zinc-500">{density.toUpperCase()} DENSITY • {totalPages} {totalPages === 1 ? 'PAGE' : 'PAGES'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Canvas Wrapper */}
            <div className="w-full flex justify-center px-2 sm:px-4 py-4 print:p-0">
                
                {/* Main Multi-Sheet Paginated Paper Sheets Container */}
                <div 
                    className="w-full space-y-8 print:space-y-0 transition-all duration-300 flex flex-col items-center"
                    style={{ maxWidth: sheetMaxWidth }}
                >
                    
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* PAGE / SHEET 1: Master Header, Summary & Primary Activity */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <div 
                        className={`statement-page-sheet bg-white border border-zinc-300 print:border-none shadow-2xl print:shadow-none text-zinc-800 flex flex-col justify-between transition-all duration-300 ${densityClasses.containerPadding}`}
                        style={{
                            width: '100%',
                            maxWidth: sheetMaxWidth,
                            minHeight: sheetMinHeight,
                        }}
                    >
                        
                        <div className={densityClasses.spacing}>
                            {/* Bank Letterhead & Document Title */}
                            <div className={`border-b-2 border-zinc-900 flex flex-col sm:flex-row justify-between items-start gap-4 ${densityClasses.headerPadding}`}>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`${densityClasses.logoSize} bg-blue-950 text-white rounded-lg flex items-center justify-center p-2 shadow-xs shrink-0`}>
                                            <AppLogoIcon className="h-full w-full fill-none" />
                                        </div>
                                        <div>
                                            <h1 className={`font-extrabold tracking-tight text-blue-950 uppercase font-sans ${densityClasses.titleText}`}>
                                                Budget Planner Digital Bank
                                            </h1>
                                            <p className="text-[10px] tracking-widest uppercase font-semibold text-zinc-500">
                                                Consolidated Account Statement • Electronic Record
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 pt-0.5">
                                        Digital Banking Operations • 24/7 Financial Services • Manila, Philippines
                                    </p>
                                </div>

                                <div className="text-right w-full sm:w-auto self-end sm:self-auto space-y-1">
                                    <span className="inline-block px-2.5 py-0.5 bg-zinc-100 border border-zinc-300 font-mono text-[11px] font-bold text-zinc-800 uppercase tracking-wide">
                                        {statementMeta.statementNo}
                                    </span>
                                    <p className="text-[10px] text-zinc-500 font-medium">
                                        Sheet 1 of {totalPages} • {activeConfig.shortName}
                                    </p>
                                </div>
                            </div>

                            {/* Customer Info & Account Metadata Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 border border-zinc-300 bg-zinc-50/50 p-3.5 rounded-sm">
                                {/* Customer Information (Left) */}
                                <div className="space-y-0.5 border-b md:border-b-0 md:border-r border-zinc-200 pb-3 md:pb-0 md:pr-4">
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">
                                        Account Holder Information
                                    </span>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-sm text-zinc-900 uppercase">{user.name}</p>
                                        <p className="text-zinc-600"><strong className="text-zinc-700">Email:</strong> {user.email}</p>
                                        <p className="text-zinc-600"><strong className="text-zinc-700">Client CIF ID:</strong> CIF-{user.name.replace(/\s+/g, '').substring(0, 3).toUpperCase()}-{user.email.length * 137}</p>
                                        <p className="text-zinc-600"><strong className="text-zinc-700">Member Since:</strong> {user.customerSince || '2026'}</p>
                                    </div>
                                </div>

                                {/* Statement Information (Right) */}
                                <div className="space-y-0.5 md:pl-2">
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">
                                        Statement Summary Details
                                    </span>
                                    <div className="grid grid-cols-2 gap-y-0.5 gap-x-2">
                                        <span className="text-zinc-500">Statement Period:</span>
                                        <span className="font-semibold text-zinc-900">{statementMeta.statementPeriod}</span>

                                        <span className="text-zinc-500">Date of Issue:</span>
                                        <span className="font-semibold text-zinc-900">{statementMeta.issueDate}</span>

                                        <span className="text-zinc-500">Master Account No:</span>
                                        <span className="font-mono font-bold text-zinc-900">{statementMeta.accountNumber}</span>

                                        <span className="text-zinc-500">Account Currency:</span>
                                        <span className="font-semibold text-zinc-900">{statementMeta.currency}</span>

                                        <span className="text-zinc-500">Account Status:</span>
                                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE / VERIFIED
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Account Balance Summary Table */}
                            <div className="space-y-1.5">
                                <h2 className={`font-bold uppercase tracking-wider text-blue-950 border-b border-zinc-300 pb-1 ${densityClasses.sectionHeading}`}>
                                    Account Balance Summary ({statementMeta.month})
                                </h2>

                                <div className="border border-zinc-300 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className={`bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-300 uppercase text-[9.5px] ${densityClasses.tableText}`}>
                                            <tr>
                                                <th className={`${densityClasses.cellHeaderPadding} border-r border-zinc-200`}>Opening Balance</th>
                                                <th className={`${densityClasses.cellHeaderPadding} border-r border-zinc-200 text-right`}>Total Deposits (+)</th>
                                                <th className={`${densityClasses.cellHeaderPadding} border-r border-zinc-200 text-right`}>Total Withdrawals (-)</th>
                                                <th className={`${densityClasses.cellHeaderPadding} border-r border-zinc-200 text-right`}>Net Change</th>
                                                <th className={`${densityClasses.cellHeaderPadding} text-right bg-blue-950 text-white`}>Closing Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`font-mono divide-y divide-zinc-200 ${densityClasses.tableText}`}>
                                            <tr>
                                                <td className={`${densityClasses.cellPadding} font-semibold text-zinc-800 border-r border-zinc-200`}>
                                                    {formatCurrency(balanceSummary.openingBalance)}
                                                </td>
                                                <td className={`${densityClasses.cellPadding} text-right text-emerald-700 font-semibold border-r border-zinc-200`}>
                                                    +{formatCurrency(balanceSummary.totalDeposits)}
                                                </td>
                                                <td className={`${densityClasses.cellPadding} text-right text-rose-700 font-semibold border-r border-zinc-200`}>
                                                    -{formatCurrency(balanceSummary.totalWithdrawals)}
                                                </td>
                                                <td className={`${densityClasses.cellPadding} text-right font-bold border-r border-zinc-200 ${balanceSummary.netChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {balanceSummary.netChange >= 0 ? '+' : ''}{formatCurrency(balanceSummary.netChange)}
                                                </td>
                                                <td className={`${densityClasses.cellPadding} text-right font-black text-blue-950 bg-blue-50/50`}>
                                                    {formatCurrency(balanceSummary.closingBalance)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Linked Bank Accounts Portfolio */}
                            {bankAccounts.length > 0 && (
                                <div className="space-y-1.5">
                                    <h2 className={`font-bold uppercase tracking-wider text-blue-950 border-b border-zinc-300 pb-1 ${densityClasses.sectionHeading}`}>
                                        Linked Bank Accounts & Deposit Portfolio
                                    </h2>

                                    <div className="border border-zinc-300 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className={`bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-300 uppercase text-[9.5px] ${densityClasses.tableText}`}>
                                                <tr>
                                                    <th className={densityClasses.cellHeaderPadding}>Bank / Institution</th>
                                                    <th className={densityClasses.cellHeaderPadding}>Account Name</th>
                                                    <th className={densityClasses.cellHeaderPadding}>Account Type</th>
                                                    <th className={densityClasses.cellHeaderPadding}>Account Number</th>
                                                    <th className={densityClasses.cellHeaderPadding}>Status</th>
                                                    <th className={`${densityClasses.cellHeaderPadding} text-right`}>Available Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y divide-zinc-200 font-mono ${densityClasses.tableText}`}>
                                                {bankAccounts.map((acc) => {
                                                    const logoSrc = getBankLogoSrc(acc.bank_name);
                                                    return (
                                                        <tr key={acc.id} className="hover:bg-zinc-50">
                                                            <td className={`${densityClasses.cellPadding} font-sans font-semibold text-zinc-900`}>
                                                                <div className="flex items-center gap-1.5">
                                                                    {logoSrc && (
                                                                        <img src={logoSrc} alt={acc.bank_name} className="h-3.5 w-3.5 rounded-sm object-contain shrink-0 border border-zinc-200" />
                                                                    )}
                                                                    <span>{acc.bank_name}</span>
                                                                </div>
                                                            </td>
                                                        <td className={`${densityClasses.cellPadding} font-sans text-zinc-700`}>{acc.account_name}</td>
                                                        <td className={`${densityClasses.cellPadding} font-sans capitalize text-zinc-600`}>{acc.account_type.replace('_', ' ')}</td>
                                                        <td className={`${densityClasses.cellPadding} text-zinc-600 font-bold`}>•••• {acc.account_number_last4 || '0000'}</td>
                                                        <td className={densityClasses.cellPadding}>
                                                            <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                                                {acc.status || 'Active'}
                                                            </span>
                                                        </td>
                                                        <td className={`${densityClasses.cellPadding} text-right font-bold text-zinc-900`}>
                                                            {formatCurrency(acc.balance)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Itemized Transaction Activity (Page 1 Batch) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between border-b border-zinc-300 pb-1">
                                    <h2 className={`font-bold uppercase tracking-wider text-blue-950 ${densityClasses.sectionHeading}`}>
                                        Itemized Transaction Activity Ledger {isMultiPage && '(Part 1)'}
                                    </h2>
                                    <span className="text-[9.5px] text-zinc-500 font-mono">
                                        {isMultiPage ? `Showing 1–${page1Ledger.length} of ${ledger.length} entries` : `Total Entries: ${ledger.length}`}
                                    </span>
                                </div>

                                <div className="border border-zinc-300 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className={`bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-300 uppercase text-[9.5px] ${densityClasses.tableText}`}>
                                            <tr>
                                                <th className={`${densityClasses.cellHeaderPadding} w-24`}>Post Date</th>
                                                <th className={`${densityClasses.cellHeaderPadding} w-28`}>Ref / Txn No.</th>
                                                <th className={densityClasses.cellHeaderPadding}>Transaction Description / Category</th>
                                                <th className={`${densityClasses.cellHeaderPadding} text-right w-24 text-rose-800`}>Withdrawals (-)</th>
                                                <th className={`${densityClasses.cellHeaderPadding} text-right w-24 text-emerald-800`}>Deposits (+)</th>
                                                <th className={`${densityClasses.cellHeaderPadding} text-right w-28`}>Running Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y divide-zinc-200 font-mono ${densityClasses.tableText}`}>
                                            {page1Ledger.map((item) => (
                                                <tr key={item.id} className="hover:bg-zinc-50">
                                                    <td className={`${densityClasses.cellPadding} font-sans text-zinc-600`}>{item.displayDate}</td>
                                                    <td className={`${densityClasses.cellPadding} text-zinc-500 text-[9px]`}>{item.refNo}</td>
                                                    <td className={`${densityClasses.cellPadding} font-sans font-medium text-zinc-900`}>
                                                        <span>{item.description}</span>
                                                        {item.notes && (
                                                            <span className="block text-[9px] text-zinc-500 font-normal italic">
                                                                Note: {item.notes}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={`${densityClasses.cellPadding} text-right text-rose-700 font-medium`}>
                                                        {item.debit > 0 ? `-${formatCurrency(item.debit)}` : '—'}
                                                    </td>
                                                    <td className={`${densityClasses.cellPadding} text-right text-emerald-700 font-medium`}>
                                                        {item.credit > 0 ? `+${formatCurrency(item.credit)}` : '—'}
                                                    </td>
                                                    <td className={`${densityClasses.cellPadding} text-right font-bold text-zinc-900`}>
                                                        {formatCurrency(item.runningBalance)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {page1Ledger.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-zinc-500 font-sans">
                                                        No transactions posted during this statement cycle.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* If single page, show loans and disclosures on Sheet 1 */}
                            {!isMultiPage && (
                                <div className="space-y-3 pt-1">
                                    {loans.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between border-b border-zinc-300 pb-1">
                                                <h2 className={`font-bold uppercase tracking-wider text-blue-950 ${densityClasses.sectionHeading}`}>
                                                    Loans & Credit Commitments Schedule
                                                </h2>
                                                <span className="text-[9.5px] font-bold text-amber-800 font-mono">
                                                    Total Outstanding: {formatCurrency(loanSummary.total_remaining)}
                                                </span>
                                            </div>

                                            <div className="border border-zinc-300 overflow-hidden">
                                                <table className="w-full text-left">
                                                    <thead className={`bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-300 uppercase text-[9.5px] ${densityClasses.tableText}`}>
                                                        <tr>
                                                            <th className={densityClasses.cellHeaderPadding}>Facility / Creditor</th>
                                                            <th className={`${densityClasses.cellHeaderPadding} text-right`}>Credit / Loan Amount</th>
                                                            <th className={`${densityClasses.cellHeaderPadding} text-right`}>Repaid to Date</th>
                                                            <th className={`${densityClasses.cellHeaderPadding} text-right`}>Remaining Principal</th>
                                                            <th className={`${densityClasses.cellHeaderPadding} text-right`}>Interest</th>
                                                            <th className={`${densityClasses.cellHeaderPadding} text-right`}>Maturity / Due Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className={`divide-y divide-zinc-200 font-mono ${densityClasses.tableText}`}>
                                                        {loans.map((loan) => {
                                                            const loanLogo = getLoanLogoSrc(loan.name);
                                                            return (
                                                                <tr key={loan.id} className="hover:bg-zinc-50">
                                                                    <td className={`${densityClasses.cellPadding} font-sans font-semibold text-zinc-900`}>
                                                                        <div className="flex items-center gap-1.5">
                                                                            {loanLogo && (
                                                                                <img src={loanLogo} alt={loan.name} className="h-3.5 w-3.5 rounded-sm object-contain shrink-0 border border-zinc-200" />
                                                                            )}
                                                                            <span>{loan.name}</span>
                                                                        </div>
                                                                    </td>
                                                                <td className={`${densityClasses.cellPadding} text-right text-zinc-600`}>{formatCurrency(Number(loan.amount))}</td>
                                                                <td className={`${densityClasses.cellPadding} text-right text-emerald-700 font-medium`}>{formatCurrency(Number(loan.amount) - Number(loan.remaining_amount))}</td>
                                                                <td className={`${densityClasses.cellPadding} text-right text-amber-800 font-bold`}>{formatCurrency(Number(loan.remaining_amount))}</td>
                                                                <td className={`${densityClasses.cellPadding} text-right text-zinc-500`}>{Number(loan.interest_rate || 0).toFixed(1)}%</td>
                                                                <td className={`${densityClasses.cellPadding} text-right font-sans text-zinc-700`}>{loan.due_date ? loan.due_date.substring(0, 10) : 'N/A'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {categorySummary.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between border-b border-zinc-300 pb-1">
                                                <h2 className={`font-bold uppercase tracking-wider text-blue-950 ${densityClasses.sectionHeading}`}>
                                                    Expenditure Distribution by Category
                                                </h2>
                                                <span className="text-[9.5px] font-bold text-zinc-800 font-mono">
                                                    Total Month Debits: {formatCurrency(totalCategorySpent)}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {categorySummary.map((cat, i) => {
                                                    const share = totalCategorySpent > 0 ? (cat.value / totalCategorySpent) * 100 : 0;
                                                    return (
                                                        <div key={i} className="border border-zinc-200 p-2 rounded-sm bg-zinc-50/50">
                                                            <div className="flex justify-between items-center text-[9.5px] text-zinc-500 font-medium">
                                                                <span className="truncate pr-1">{cat.name}</span>
                                                                <span>{share.toFixed(1)}%</span>
                                                            </div>
                                                            <p className="font-mono font-bold text-xs text-zinc-900 mt-0.5">
                                                                {formatCurrency(cat.value)}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Official Bank Disclosures & Electronic Verification Stamp */}
                                    <div className="border-t-2 border-zinc-900 pt-4 mt-5 space-y-2 text-[9.5px] text-zinc-500">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-zinc-800 uppercase tracking-wider text-[9.5px]">
                                                    Important Statement Notice
                                                </p>
                                                <p className="leading-relaxed">
                                                    Please examine this statement immediately. If no discrepancy is reported within thirty (30) days from statement date, the account balance and all entries will be considered correct and conclusively confirmed.
                                                </p>
                                            </div>

                                            <div className="space-y-0.5">
                                                <p className="font-bold text-zinc-800 uppercase tracking-wider text-[9.5px]">
                                                    Customer Care & Inquiries
                                                </p>
                                                <p className="leading-relaxed">
                                                    For inquiries or dispute resolutions, please contact Budget Planner Digital Banking support via your online portal dashboard or official secure communications.
                                                </p>
                                            </div>

                                            <div className="text-left sm:text-right space-y-1 flex flex-col justify-end">
                                                <div className="inline-block self-start sm:self-end border border-zinc-300 bg-zinc-50 p-2 rounded text-center">
                                                    <div className="text-[9.5px] font-black text-blue-950 tracking-widest uppercase">
                                                        ELECTRONICALLY VERIFIED
                                                    </div>
                                                    <div className="text-[8.5px] font-mono text-zinc-500">
                                                        SEC-AUTH-HASH-{statementMeta.statementNo.substring(8)}
                                                    </div>
                                                </div>
                                                <p className="text-[8.5px] text-zinc-400">
                                                    Automated Digital Banking System • No signature required
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Page 1 Bottom Footer & Continuation Notice */}
                        <div className="border-t border-zinc-300 pt-3 mt-6 flex justify-between items-center text-[9.5px] text-zinc-500">
                            <div>
                                <span className="font-semibold text-zinc-700">Budget Planner Digital Banking</span> • Ref: {statementMeta.statementNo}
                            </div>
                            <div className="font-bold text-zinc-700">
                                {isMultiPage ? `Continued on Sheet 2 → (Page 1 of ${totalPages})` : `Page 1 of 1 • End of Statement`}
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* PAGE / SHEET 2: Transaction Continuation, Liabilities & Stamp */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {isMultiPage && (
                        <div 
                            className={`statement-page-sheet bg-white border border-zinc-300 print:border-none shadow-2xl print:shadow-none text-zinc-800 flex flex-col justify-between transition-all duration-300 ${densityClasses.containerPadding}`}
                            style={{
                                width: '100%',
                                maxWidth: sheetMaxWidth,
                                minHeight: sheetMinHeight,
                            }}
                        >
                            
                            <div className={densityClasses.spacing}>
                                {/* Page 2 Running Continuation Sub-Header */}
                                <div className="border-b-2 border-zinc-900 pb-3 flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-6 w-6 bg-blue-950 text-white rounded flex items-center justify-center p-1">
                                            <AppLogoIcon className="h-full w-full fill-none" />
                                        </div>
                                        <div>
                                            <span className="font-extrabold text-blue-950 uppercase tracking-tight">Budget Planner Digital Bank</span>
                                            <span className="text-zinc-400 mx-2">|</span>
                                            <span className="text-zinc-600 font-medium">Account Statement Continuation</span>
                                        </div>
                                    </div>
                                    <div className="text-right text-[10px] text-zinc-500 font-mono">
                                        <span className="font-bold text-zinc-800">{statementMeta.statementNo}</span> • Page 2 of {totalPages}
                                    </div>
                                </div>

                                {/* Page 2: Remaining Transactions Activity */}
                                {page2Ledger.length > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between border-b border-zinc-300 pb-1">
                                            <h2 className={`font-bold uppercase tracking-wider text-blue-950 ${densityClasses.sectionHeading}`}>
                                                Itemized Transaction Activity Ledger (Part 2 - Continuation)
                                            </h2>
                                            <span className="text-[9.5px] text-zinc-500 font-mono">
                                                Entries {page1Ledger.length + 1} to {ledger.length}
                                            </span>
                                        </div>

                                        <div className="border border-zinc-300 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className={`bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-300 uppercase text-[9.5px] ${densityClasses.tableText}`}>
                                                    <tr>
                                                        <th className={`${densityClasses.cellHeaderPadding} w-24`}>Post Date</th>
                                                        <th className={`${densityClasses.cellHeaderPadding} w-28`}>Ref / Txn No.</th>
                                                        <th className={densityClasses.cellHeaderPadding}>Transaction Description / Category</th>
                                                        <th className={`${densityClasses.cellHeaderPadding} text-right w-24 text-rose-800`}>Withdrawals (-)</th>
                                                        <th className={`${densityClasses.cellHeaderPadding} text-right w-24 text-emerald-800`}>Deposits (+)</th>
                                                        <th className={`${densityClasses.cellHeaderPadding} text-right w-28`}>Running Balance</th>
                                                    </tr>
                                                </thead>
                                                <tbody className={`divide-y divide-zinc-200 font-mono ${densityClasses.tableText}`}>
                                                    {page2Ledger.map((item) => (
                                                        <tr key={item.id} className="hover:bg-zinc-50">
                                                            <td className={`${densityClasses.cellPadding} font-sans text-zinc-600`}>{item.displayDate}</td>
                                                            <td className={`${densityClasses.cellPadding} text-zinc-500 text-[9px]`}>{item.refNo}</td>
                                                            <td className={`${densityClasses.cellPadding} font-sans font-medium text-zinc-900`}>
                                                                <span>{item.description}</span>
                                                                {item.notes && (
                                                                    <span className="block text-[9px] text-zinc-500 font-normal italic">
                                                                        Note: {item.notes}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className={`${densityClasses.cellPadding} text-right text-rose-700 font-medium`}>
                                                                {item.debit > 0 ? `-${formatCurrency(item.debit)}` : '—'}
                                                            </td>
                                                            <td className={`${densityClasses.cellPadding} text-right text-emerald-700 font-medium`}>
                                                                {item.credit > 0 ? `+${formatCurrency(item.credit)}` : '—'}
                                                            </td>
                                                            <td className={`${densityClasses.cellPadding} text-right font-bold text-zinc-900`}>
                                                                {formatCurrency(item.runningBalance)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Loans & Liabilities Schedule */}
                                {loans.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between border-b border-zinc-300 pb-1">
                                            <h2 className={`font-bold uppercase tracking-wider text-blue-950 ${densityClasses.sectionHeading}`}>
                                                Loans & Credit Commitments Schedule
                                            </h2>
                                            <span className="text-[9.5px] font-bold text-amber-800 font-mono">
                                                Total Outstanding: {formatCurrency(loanSummary.total_remaining)}
                                            </span>
                                        </div>

                                        <div className="border border-zinc-300 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className={`bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-300 uppercase text-[9.5px] ${densityClasses.tableText}`}>
                                                    <tr>
                                                        <th className={densityClasses.cellHeaderPadding}>Facility / Creditor</th>
                                                        <th className={`${densityClasses.cellHeaderPadding} text-right`}>Credit / Loan Amount</th>
                                                        <th className={`${densityClasses.cellHeaderPadding} text-right`}>Repaid to Date</th>
                                                        <th className={`${densityClasses.cellHeaderPadding} text-right`}>Remaining Principal</th>
                                                        <th className={`${densityClasses.cellHeaderPadding} text-right`}>Interest</th>
                                                        <th className={`${densityClasses.cellHeaderPadding} text-right`}>Maturity / Due Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className={`divide-y divide-zinc-200 font-mono ${densityClasses.tableText}`}>
                                                    {loans.map((loan) => {
                                                        const loanLogo = getLoanLogoSrc(loan.name);
                                                        return (
                                                            <tr key={loan.id} className="hover:bg-zinc-50">
                                                                <td className={`${densityClasses.cellPadding} font-sans font-semibold text-zinc-900`}>
                                                                    <div className="flex items-center gap-1.5">
                                                                        {loanLogo && (
                                                                            <img src={loanLogo} alt={loan.name} className="h-3.5 w-3.5 rounded-sm object-contain shrink-0 border border-zinc-200" />
                                                                        )}
                                                                        <span>{loan.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className={`${densityClasses.cellPadding} text-right text-zinc-600`}>{formatCurrency(Number(loan.amount))}</td>
                                                                <td className={`${densityClasses.cellPadding} text-right text-emerald-700 font-medium`}>{formatCurrency(Number(loan.amount) - Number(loan.remaining_amount))}</td>
                                                                <td className={`${densityClasses.cellPadding} text-right text-amber-800 font-bold`}>{formatCurrency(Number(loan.remaining_amount))}</td>
                                                                <td className={`${densityClasses.cellPadding} text-right text-zinc-500`}>{Number(loan.interest_rate || 0).toFixed(1)}%</td>
                                                                <td className={`${densityClasses.cellPadding} text-right font-sans text-zinc-700`}>{loan.due_date ? loan.due_date.substring(0, 10) : 'N/A'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Category Expenditure Summary Breakdown */}
                                {categorySummary.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between border-b border-zinc-300 pb-1">
                                            <h2 className={`font-bold uppercase tracking-wider text-blue-950 ${densityClasses.sectionHeading}`}>
                                                Expenditure Distribution by Category
                                            </h2>
                                            <span className="text-[9.5px] font-bold text-zinc-800 font-mono">
                                                Total Month Debits: {formatCurrency(totalCategorySpent)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {categorySummary.map((cat, i) => {
                                                const share = totalCategorySpent > 0 ? (cat.value / totalCategorySpent) * 100 : 0;
                                                return (
                                                    <div key={i} className="border border-zinc-200 p-2 rounded-sm bg-zinc-50/50">
                                                        <div className="flex justify-between items-center text-[9.5px] text-zinc-500 font-medium">
                                                            <span className="truncate pr-1">{cat.name}</span>
                                                            <span>{share.toFixed(1)}%</span>
                                                        </div>
                                                        <p className="font-mono font-bold text-xs text-zinc-900 mt-0.5">
                                                            {formatCurrency(cat.value)}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Official Bank Disclosures & Electronic Verification Stamp */}
                                <div className="border-t-2 border-zinc-900 pt-4 mt-5 space-y-2 text-[9.5px] text-zinc-500">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-zinc-800 uppercase tracking-wider text-[9.5px]">
                                                Important Statement Notice
                                            </p>
                                            <p className="leading-relaxed">
                                                Please examine this statement immediately. If no discrepancy is reported within thirty (30) days from statement date, the account balance and all entries will be considered correct and conclusively confirmed.
                                            </p>
                                        </div>

                                        <div className="space-y-0.5">
                                            <p className="font-bold text-zinc-800 uppercase tracking-wider text-[9.5px]">
                                                Customer Care & Inquiries
                                            </p>
                                            <p className="leading-relaxed">
                                                For inquiries or dispute resolutions, please contact Budget Planner Digital Banking support via your online portal dashboard or official secure communications.
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right space-y-1 flex flex-col justify-end">
                                            <div className="inline-block self-start sm:self-end border border-zinc-300 bg-zinc-50 p-2 rounded text-center">
                                                <div className="text-[9.5px] font-black text-blue-950 tracking-widest uppercase">
                                                    ELECTRONICALLY VERIFIED
                                                </div>
                                                <div className="text-[8.5px] font-mono text-zinc-500">
                                                    SEC-AUTH-HASH-{statementMeta.statementNo.substring(8)}
                                                </div>
                                            </div>
                                            <p className="text-[8.5px] text-zinc-400">
                                                Automated Digital Banking System • No signature required
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Page 2 Bottom Footer */}
                            <div className="border-t border-zinc-300 pt-3 mt-6 flex justify-between items-center text-[9.5px] text-zinc-500">
                                <div>
                                    <span className="font-semibold text-zinc-700">Budget Planner Digital Banking</span> • Ref: {statementMeta.statementNo}
                                </div>
                                <div className="font-bold text-zinc-700">
                                    Page 2 of {totalPages} • End of Statement
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}



