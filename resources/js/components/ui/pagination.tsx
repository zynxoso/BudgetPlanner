import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';
import { buttonVariants, ButtonProps } from '@/components/ui/button';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
    <nav
        role="navigation"
        aria-label="pagination"
        className={cn('mx-auto flex w-full justify-center', className)}
        {...props}
    />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
    ({ className, ...props }, ref) => (
        <ul ref={ref} className={cn('flex flex-wrap items-center gap-1 sm:gap-1.5', className)} {...props} />
    ),
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
    ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />,
);
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
    isActive?: boolean;
    disabled?: boolean;
} & Pick<ButtonProps, 'size'> &
    (
        | ({ href: string } & React.ComponentProps<typeof Link>)
        | ({ href?: undefined } & React.ComponentProps<'button'>)
    );

const PaginationLink = ({
    className,
    isActive,
    disabled,
    size = 'sm',
    href,
    ...props
}: PaginationLinkProps) => {
    const classes = cn(
        buttonVariants({
            variant: isActive ? 'default' : 'outline',
            size,
        }),
        'min-w-8 h-8 sm:min-w-9 sm:h-9 text-xs font-medium cursor-pointer select-none transition-all',
        isActive && 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xs font-semibold',
        disabled && 'pointer-events-none opacity-40 cursor-not-allowed',
        className,
    );

    if (href && !disabled) {
        return (
            <Link
                aria-current={isActive ? 'page' : undefined}
                className={classes}
                href={href}
                preserveScroll
                preserveState
                {...(props as any)}
            />
        );
    }

    return (
        <button
            type="button"
            aria-current={isActive ? 'page' : undefined}
            disabled={disabled}
            className={classes}
            {...(props as any)}
        />
    );
};
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
    className,
    label = 'Previous',
    ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) => (
    <PaginationLink
        aria-label="Go to previous page"
        size="sm"
        className={cn('gap-1 px-2.5 sm:px-3', className)}
        {...props}
    >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
    </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
    className,
    label = 'Next',
    ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) => (
    <PaginationLink
        aria-label="Go to next page"
        size="sm"
        className={cn('gap-1 px-2.5 sm:px-3', className)}
        {...props}
    >
        <span className="hidden sm:inline">{label}</span>
        <ChevronRight className="h-4 w-4" />
    </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
    <span
        aria-hidden
        className={cn('flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-muted-foreground', className)}
        {...props}
    >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More pages</span>
    </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
};
