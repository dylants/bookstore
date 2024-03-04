'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Format } from '@prisma/client';
import clsx from 'clsx';
import _ from 'lodash';
import { useCallback } from 'react';

export default function BookFormSelectFormat({
  formats,
  hasError,
  onSelect,
  selectedFormatId,
}: {
  formats: Array<Format>;
  hasError?: boolean;
  onSelect: (id: number) => void;
  selectedFormatId?: number;
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
      <label className="text-sm capitalize">Format</label>
      <Select
        onValueChange={onValueChange}
        value={selectedFormatId?.toString()}
      >
        <SelectTrigger
          className={clsx(hasError ? 'border-red-500' : '')}
          data-testid="select-format"
        >
          <SelectValue placeholder="Select Format..." />
        </SelectTrigger>
        <SelectContent>
          {formats.map((format) => (
            <SelectItem key={format.id} value={format.id.toString()}>
              {format.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
