'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/tailwind-utils';

export type InputIconProps = React.ComponentPropsWithoutRef<typeof Input> & {
  Icon: JSX.Element;
  asButton?: boolean;
  buttonDisabled?: boolean;
  hasError?: boolean;
  onClick?: () => void;
};

const InputIcon = React.forwardRef<
  React.ElementRef<typeof Input>,
  InputIconProps
>(
  (
    { className, Icon, asButton, buttonDisabled, hasError, onClick, ...props },
    ref,
  ) => {
    const Comp = asButton ? 'button' : 'div';
    return (
      <div
        className={cn(
          'flex h-9 w-full rounded-md border border-customPalette-200/30 bg-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50',
          hasError ? 'border-red-500' : '',
          className,
        )}
      >
        <Input
          ref={ref}
          // -1px to account for the border on the parent div
          className="mt-[-1px] pr-0"
          variant="ghost"
          {...props}
        />
        <div className="w-[56px] h-full flex items-center justify-center">
          <Comp
            className={cn(
              'flex self-center',
              buttonDisabled ? 'pointer-events-none' : '',
            )}
            onClick={onClick}
            disabled={buttonDisabled}
          >
            {Icon}
          </Comp>
        </div>
      </div>
    );
  },
);
InputIcon.displayName = 'InputIcon';

export { InputIcon };
