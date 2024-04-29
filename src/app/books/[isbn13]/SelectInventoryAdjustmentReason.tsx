'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InventoryAdjustmentReason } from '@prisma/client';
import clsx from 'clsx';
import _ from 'lodash';
import { useCallback } from 'react';

export default function SelectInventoryAdjustmentReason({
  reasons,
  hasError,
  onSelect,
  selectedReasonId,
}: {
  reasons: Array<InventoryAdjustmentReason>;
  hasError?: boolean;
  onSelect: (id: number) => void;
  selectedReasonId?: number;
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
      <label className="text-sm capitalize">Reason</label>
      <Select
        onValueChange={onValueChange}
        value={selectedReasonId?.toString()}
      >
        <SelectTrigger
          className={clsx(hasError ? 'border-red-500' : '')}
          data-testid="select-reason"
        >
          <SelectValue placeholder="Select Reason..." />
        </SelectTrigger>
        <SelectContent>
          {reasons.map((reason) => (
            <SelectItem key={reason.id} value={reason.id.toString()}>
              {reason.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
