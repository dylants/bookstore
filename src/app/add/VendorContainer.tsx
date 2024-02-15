'use client';

import { useCallback, useEffect, useState } from 'react';
import VendorSelect from '@/components/book-source/VendorSelect';
import { BookSource } from '@prisma/client';
import { getBookSources } from '@/lib/actions/book-source';
import { VendorCreateFormInput } from '@/components/book-source/VendorCreate';

export default function VendorContainer({
  hasError,
  onSelect,
}: {
  hasError?: boolean;
  onSelect: (value: number) => void;
}) {
  const [vendors, setVendors] = useState<Array<BookSource>>([]);

  const loadVendors = useCallback(async () => {
    const { bookSources: vendors } = await getBookSources({
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
