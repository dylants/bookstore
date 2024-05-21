'use client';

import { Input } from '@/components/ui/input';
import { InputIcon } from '@/components/ui/input-icon';
import React, { useCallback, useImperativeHandle } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

export type SkuSearchFormInput = {
  input: string;
};

export type SkuSearchProps = {
  isSearching: boolean;
  onChange: (value: string) => void;
  onSubmit: SubmitHandler<SkuSearchFormInput>;
  value: string;
};

const SkuSearch = React.forwardRef<
  React.ElementRef<typeof InputIcon>,
  SkuSearchProps
>((props, forwardedRef) => {
  const { isSearching, onChange, onSubmit, value } = props;
  const { handleSubmit, register } = useForm<SkuSearchFormInput>({
    values: {
      input: value,
    },
  });
  const { ref: formRef, ...formRest } = register('input', {
    onChange(event) {
      onChange(event.target.value);
    },
    required: true,
  });

  const internalOnSubmit: SubmitHandler<SkuSearchFormInput> = useCallback(
    (props) => {
      onSubmit(props);
    },
    [onSubmit],
  );

  // https://stackoverflow.com/a/76739143/3666800
  const ref = React.useRef<HTMLInputElement | null>(null);
  useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement);

  return (
    <form className="w-full" onSubmit={handleSubmit(internalOnSubmit)}>
      <div className="flex gap-4 items-end">
        <div className="flex flex-col flex-1">
          <Input
            variant="ghost"
            className="pl-2 h-[40px]"
            disabled={isSearching}
            placeholder="Scan or Enter SKU"
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
SkuSearch.displayName = 'SkuSearch';

export default SkuSearch;
