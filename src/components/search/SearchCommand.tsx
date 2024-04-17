'use client';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

function SearchResult({ result }: { result: SearchCommandResult }) {
  const { imageUrl, text } = result;

  return (
    <div className="flex gap-4">
      {imageUrl ? (
        <Image alt={text} src={imageUrl} width={16} height={24} />
      ) : (
        <div className="w-[16px] h-[24px] border border-customPalette-300">
          No Image
        </div>
      )}
      <div>{text}</div>
    </div>
  );
}

export type SearchCommandResult = {
  id: string;
  imageUrl: string | null;
  text: string;
};

export type SearchCommandProps = {
  isSearching?: boolean;
  onClose: () => void;
  onSearchValueChange: (searchValue: string) => void;
  onSelect: (result: SearchCommandResult) => void;
  placeholder?: string;
  results: Array<SearchCommandResult> | null;
  searchValue: string;
};

export default function SearchCommand(props: SearchCommandProps) {
  const {
    isSearching,
    onClose,
    onSearchValueChange,
    onSelect,
    placeholder = 'Search Inventory...',
    results,
    searchValue,
  } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className="w-[225px] h-8 justify-between text-customPalette-500"
        onClick={() => setIsOpen(true)}
      >
        <span>{placeholder}</span>
        <SearchIcon width={18} height={18} />
      </Button>
      <CommandDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
            onClose();
          }
        }}
        shouldFilter={false}
      >
        <CommandInput
          placeholder={placeholder}
          onValueChange={(value) => onSearchValueChange(value)}
          value={searchValue}
          data-testid="search-command-input"
        />
        <CommandList>
          {isSearching ? (
            <CommandItem className="cursor-default">
              <Skeleton className="h-[24px] w-full" />
            </CommandItem>
          ) : (
            <>
              {results && searchValue && (
                <>
                  {results.length === 0 ? (
                    <CommandEmpty className="min-h-[24px] p-3">
                      No results found.
                    </CommandEmpty>
                  ) : (
                    <>
                      {results.map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => {
                            onSelect(result);
                            setIsOpen(false);
                          }}
                        >
                          <SearchResult result={result} />
                        </CommandItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
