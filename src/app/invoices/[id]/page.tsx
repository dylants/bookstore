'use client';

import BookForm from '@/app/invoices/[id]/BookForm';
import InvoiceDescription from '@/app/invoices/[id]/InvoiceDescription';
import InvoiceTotal from '@/app/invoices/[id]/InvoiceTotal';
import {
  Breadcrumbs,
  BreadcrumbsHome,
  BreadcrumbsDivider,
  BreadcrumbsLink,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import InvoiceItemsTable from '@/components/invoice-item/InvoiceItemsTable';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getFormats } from '@/lib/actions/format';
import { getGenres } from '@/lib/actions/genre';
import { completeInvoice, getInvoiceWithItems } from '@/lib/actions/invoice';
import InvoiceHydratedWithItemsHydrated from '@/types/InvoiceHydratedWithItemsHydrated';
import { Format, Genre } from '@prisma/client';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';

export default function InvoicePage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] =
    useState<InvoiceHydratedWithItemsHydrated | null>();
  const [formats, setFormats] = useState<Array<Format>>();
  const [genres, setGenres] = useState<Array<Genre>>();

  const invoiceId = _.toNumber(params.id);

  const loadInvoice = useCallback(async () => {
    const invoice = await getInvoiceWithItems(invoiceId);
    setInvoice(invoice);
  }, [invoiceId]);

  const loadFormats = useCallback(async () => {
    const formats = await getFormats();
    setFormats(formats);
  }, []);

  const loadGenres = useCallback(async () => {
    const genres = await getGenres();
    setGenres(genres);
  }, []);

  // on initial render, load all the things
  useEffect(() => {
    loadInvoice();
    loadFormats();
    loadGenres();
  }, [loadFormats, loadGenres, loadInvoice]);

  if (!invoice || !formats || !genres) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsLink href="/invoices">Invoices</BreadcrumbsLink>
        <BreadcrumbsDivider />
        <BreadcrumbsText>{invoice.invoiceNumber}</BreadcrumbsText>
      </Breadcrumbs>

      <InvoiceDescription invoice={invoice} />

      {!invoice.isCompleted && (
        <div className="flex justify-end mt-2">
          <Button
            variant="secondary"
            onClick={async () => {
              await completeInvoice(invoiceId);
              loadInvoice();
            }}
          >
            Complete Invoice
          </Button>
        </div>
      )}

      <hr className="my-8 mx-8 bg-slate-300" />

      {!invoice.isCompleted && (
        <BookForm
          formats={formats}
          genres={genres}
          invoice={invoice}
          onCreateInvoiceItem={() => {
            loadInvoice();
            // TODO add success
          }}
        />
      )}

      <div className="mt-4">
        <InvoiceItemsTable invoiceItems={invoice.invoiceItems} />
      </div>

      <div className="flex justify-end mt-4">
        <InvoiceTotal invoice={invoice} />
      </div>
    </>
  );
}
