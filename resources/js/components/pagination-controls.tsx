import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export interface LaravelPaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface LaravelPaginationMeta {
    links?: LaravelPaginationLink[];
    current_page?: number;
    from?: number | null;
    to?: number | null;
    total?: number;
    last_page?: number;
    per_page?: number;
}

interface ClientPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    className?: string;
}

interface ServerPaginationProps {
    meta: LaravelPaginationMeta;
    className?: string;
}

export function ServerPagination({ meta, className = '' }: ServerPaginationProps) {
    if (!meta.links || meta.links.length <= 3) {
        return null;
    }

    const { links, from, to, total } = meta;

    // Filter out &laquo; and &raquo; for direct page buttons
    const prevLink = links[0];
    const nextLink = links[links.length - 1];
    const pageLinks = links.slice(1, -1);

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/80 text-xs text-muted-foreground w-full ${className}`}>
            <div>
                {typeof from === 'number' && typeof to === 'number' && typeof total === 'number' ? (
                    <p className="text-xs text-muted-foreground">
                        Showing <span className="font-semibold text-foreground">{from}</span> to{' '}
                        <span className="font-semibold text-foreground">{to}</span> of{' '}
                        <span className="font-semibold text-foreground">{total}</span> results
                    </p>
                ) : null}
            </div>

            <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href={prevLink?.url || undefined}
                            disabled={!prevLink?.url}
                        />
                    </PaginationItem>

                    {pageLinks.map((link, idx) => {
                        if (link.label === '...') {
                            return (
                                <PaginationItem key={`ellipsis-${idx}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={`page-${link.label}-${idx}`}>
                                <PaginationLink
                                    href={link.url || undefined}
                                    isActive={link.active}
                                    disabled={!link.url}
                                >
                                    {link.label}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            href={nextLink?.url || undefined}
                            disabled={!nextLink?.url}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

export function ClientPagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    className = '',
}: ClientPaginationProps) {
    if (totalItems <= pageSize) {
        return null;
    }

    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalItems);

    // Calculate page range (max 5 visible buttons)
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/80 text-xs text-muted-foreground w-full ${className}`}>
            <div>
                <p className="text-xs text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{from}</span> to{' '}
                    <span className="font-semibold text-foreground">{to}</span> of{' '}
                    <span className="font-semibold text-foreground">{totalItems}</span> results
                </p>
            </div>

            <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1}
                        />
                    </PaginationItem>

                    {pages.map((page, idx) => {
                        if (typeof page === 'string') {
                            return (
                                <PaginationItem key={`ellipsis-${idx}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={`page-${page}`}>
                                <PaginationLink
                                    isActive={currentPage === page}
                                    onClick={() => onPageChange(page)}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage >= totalPages}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
