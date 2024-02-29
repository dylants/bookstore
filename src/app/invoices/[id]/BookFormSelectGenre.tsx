import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GENRE_OPTIONS } from '@/lib/book/genre';
import clsx from 'clsx';

export default function BookFormSelectGenre({
  hasError,
  onSelect,
  selectedGenre,
}: {
  hasError?: boolean;
  onSelect: (value: string) => void;
  selectedGenre?: string;
}) {
  return (
    <div className="flex flex-col flex-1">
      <label className="text-sm capitalize">Genre</label>
      <Select onValueChange={onSelect} value={selectedGenre}>
        <SelectTrigger className={clsx(hasError ? 'border-red-500' : '')}>
          <SelectValue placeholder="Select Genre..." />
        </SelectTrigger>
        <SelectContent>
          {GENRE_OPTIONS.map((genre) => (
            <SelectItem key={genre.value} value={genre.value}>
              {genre.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
