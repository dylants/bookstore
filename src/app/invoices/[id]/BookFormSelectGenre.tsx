import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Genre } from '@prisma/client';
import clsx from 'clsx';
import _ from 'lodash';
import { useCallback } from 'react';

export default function BookFormSelectGenre({
  genres,
  hasError,
  onSelect,
  selectedGenreId,
}: {
  genres: Array<Genre>;
  hasError?: boolean;
  onSelect: (id: number) => void;
  selectedGenreId?: number;
}) {
  const onValueChange = useCallback(
    async (value: string) => {
      const valueAsNumber = _.toNumber(value);
      return onSelect(valueAsNumber);
    },
    [onSelect],
  );

  return (
    <div className="flex flex-col flex-1">
      <label className="text-sm capitalize">Genre</label>
      <Select onValueChange={onValueChange} value={selectedGenreId?.toString()}>
        <SelectTrigger
          className={clsx(hasError ? 'border-red-500' : '')}
          data-testid="select-genre"
        >
          <SelectValue placeholder="Select Genre..." />
        </SelectTrigger>
        <SelectContent>
          {genres.map((genre) => (
            <SelectItem key={genre.id} value={genre.id.toString()}>
              {genre.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
