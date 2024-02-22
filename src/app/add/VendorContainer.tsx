'use client';

import { useCallback, useEffect, useState } from 'react';
import VendorSelect from '@/components/book-source/VendorSelect';
import { getBookSources } from '@/lib/actions/book-source';
import { VendorCreateFormInput } from '@/components/book-source/VendorCreate';
import BookSourceSerialized from '@/types/BookSourceSerialized';

export default function VendorContainer({
  hasError,
  onSelect,
}: {
  hasError?: boolean;
  onSelect: (value: number) => void;
}) {
  const [vendors, setVendors] = useState<Array<BookSourceSerialized>>([]);

  const loadVendors = useCallback(async () => {
    const { bookSources: vendors } = await getBookSources({
      isVendor: true,
      paginationQuery: {
        // TODO need to find a way to solve this
        first: 100,
      },
    });
    setVendors(vendors);
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const onVendorCreate = useCallback(async (data: VendorCreateFormInput) => {
    // TODO implement create vendor call
    console.log(data);
  }, []);

  return (
    <>
      <h2 className="my-2">Vendor</h2>
      <VendorSelect
        hasError={hasError}
        onSelect={onSelect}
        onVendorCreate={(data) => onVendorCreate(data)}
        vendors={vendors}
      />
    </>
  );
}
