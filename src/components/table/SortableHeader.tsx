import { Button } from '@/components/ui/button';
import { Column } from '@tanstack/react-table';
import clsx from 'clsx';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function SortableHeader<T>({
  className,
  column,
  text,
}: {
  className?: string;
  column: Column<T>;
  text: string;
}) {
  const sorted = column.getIsSorted();
  const sortIcon = sorted ? (
    <>
      {sorted === 'asc' ? (
        <ArrowUp className="ml-1 h-4 w-4" />
      ) : (
        <ArrowDown className="ml-1 h-4 w-4" />
      )}
    </>
  ) : (
    // this acts as a placeholder for the sort icon
    <div className="ml-1 h-4 w-4"></div>
  );

  return (
    <Button
      variant="ghost"
      className={clsx('flex justify-end w-full px-0', className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {text}
      {sortIcon}
    </Button>
  );
}
