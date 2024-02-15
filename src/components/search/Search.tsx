import { InputIcon } from '@/components/ui/input-icon';
import { ReloadIcon } from '@radix-ui/react-icons';
import { SearchIcon } from 'lucide-react';
import React, { useImperativeHandle } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

export type SearchFormInput = {
  input: string;
};

export type SearchProps = {
  hasError?: boolean;
  isSearching?: boolean;
  labelText?: string;
  onSubmit: SubmitHandler<SearchFormInput>;
  value?: string;
};

const Search = React.forwardRef<
  React.ElementRef<typeof InputIcon>,
  SearchProps
>(({ hasError, isSearching, labelText, onSubmit, value }, forwardedRef) => {
  const { handleSubmit, register } = useForm<SearchFormInput>({
    values: {
      input: value || '',
    },
  });
  const { ref: formRef, ...formRest } = register('input', { required: true });

  // https://stackoverflow.com/a/76739143/3666800
  const ref = React.useRef<HTMLInputElement | null>(null);
  useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-4 items-end">
        <div className="flex flex-col flex-1">
          {labelText && <label className="text-sm">{labelText}</label>}
          <InputIcon
            Icon={
              isSearching ? (
                <ReloadIcon className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon width={20} height={20} />
              )
            }
            asButton
            hasError={hasError}
            onClick={handleSubmit(onSubmit)}
            // https://www.react-hook-form.com/faqs/#Howtosharerefusage
            {...formRest}
            ref={(e) => {
              formRef(e);
              ref.current = e;
            }}
          />
        </div>
      </div>
    </form>
  );
});
Search.displayName = 'Search';

export default Search;
