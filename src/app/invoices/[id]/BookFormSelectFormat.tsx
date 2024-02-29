import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FORMAT_OPTIONS } from '@/lib/book/format';
import clsx from 'clsx';

export default function BookFormSelectFormat({
  hasError,
  onSelect,
  selectedFormat,
}: {
  hasError?: boolean;
  onSelect: (value: string) => void;
  selectedFormat?: string;
}) {
  return (
    <div className="flex flex-col flex-1">
      <label className="text-sm capitalize">Format</label>
      <Select onValueChange={onSelect} value={selectedFormat}>
        <SelectTrigger className={clsx(hasError ? 'border-red-500' : '')}>
          <SelectValue placeholder="Select Format..." />
        </SelectTrigger>
        <SelectContent>
          {FORMAT_OPTIONS.map((format) => (
            <SelectItem key={format.value} value={format.value}>
              {format.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
