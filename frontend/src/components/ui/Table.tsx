import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-auto">
        <table
          className={cn('w-full caption-bottom text-sm', className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        className={cn('[&_tr]:border-b', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        className={cn('[&_tr:last-child]:border-0', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableBody.displayName = 'TableBody';

const TableFooter = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    return (
      <tfoot
        className={cn('border-t bg-primary font-medium text-primary-foreground', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableFooter.displayName = 'TableFooter';

const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    return (
      <th
        className={cn('h-12 w-full px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    return (
      <td
        className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableCell.displayName = 'TableCell';

const TableCaption = forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => {
    return (
      <caption
        className={cn('mt-4 text-sm text-muted-foreground', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
