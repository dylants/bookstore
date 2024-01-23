import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useImperativeHandle, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface SearchFormInput {
  searchString: string;
}

export interface SearchFormParams {
  onSearch: (searchString: string) => Promise<void>;
}

const SearchForm = React.forwardRef<HTMLInputElement, SearchFormParams>(
  ({ onSearch }, forwardedRef) => {
    const { handleSubmit, register, reset } = useForm<SearchFormInput>();
    const { ref: formRef, ...formRest } = register('searchString');

    // https://stackoverflow.com/a/76739143/3666800
    const ref = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement);

    const onSubmit: SubmitHandler<SearchFormInput> = async ({
      searchString,
    }) => {
      // TODO we need to signify to the caller that we're loading
      await onSearch(searchString);
      reset();
    };

    return (
      <div>
        <form className="flex gap-2" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            // https://www.react-hook-form.com/faqs/#Howtosharerefusage
            {...formRest}
            ref={(e) => {
              formRef(e);
              ref.current = e;
            }}
          />
          <Button type="submit">Search</Button>
        </form>
      </div>
    );
  },
);
SearchForm.displayName = 'SearchForm';

export default SearchForm;
