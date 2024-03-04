import VendorCreate, {
  VendorCreateFormInput,
} from '@/components/book-source/VendorCreate';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import BookSourceSerialized from '@/types/BookSourceSerialized';
import clsx from 'clsx';
import _ from 'lodash';
import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';

export default function VendorSelect({
  hasError,
  onSelect,
  onVendorCreate,
  selectedVendorId,
  vendors,
}: {
  hasError?: boolean;
  onSelect: (value: number) => void;
  onVendorCreate?: SubmitHandler<VendorCreateFormInput>;
  selectedVendorId?: number;
  vendors: Array<BookSourceSerialized>;
}) {
  const onValueChange = useCallback(
    async (value: string) => {
      const valueAsNumber = _.toNumber(value);
      return onSelect(valueAsNumber);
    },
    [onSelect],
  );

  return (
    <div className="flex flex-1 gap-4">
      <Select
        onValueChange={onValueChange}
        value={selectedVendorId?.toString()}
      >
        <SelectTrigger
          className={clsx(hasError ? 'border-red-500' : '')}
          data-testid="select-vendor"
        >
          <SelectValue placeholder="Select Vendor..." />
        </SelectTrigger>
        <SelectContent>
          {vendors?.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.id.toString()}>
              {vendor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onVendorCreate && <VendorCreate onCreate={onVendorCreate} />}
    </div>
  );
}
