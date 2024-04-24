import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from 'lib/tailwind-utils';
import { ReloadIcon } from '@radix-ui/react-icons';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-customPalette-500 disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-4 py-2',
        icon: 'h-9 w-9',
        lg: 'h-10 rounded-md px-8',
        sm: 'h-8 rounded-md px-3 text-xs',
      },
      variant: {
        default:
          'bg-customPalette-300 text-customPalette-100 shadow hover:bg-customPalette-400/90',
        destructive:
          'bg-red-500 text-customPalette-100 shadow-sm hover:bg-red-500/90',
        ghost: 'hover:bg-customPalette-200/10',
        link: 'underline-offset-4 hover:underline',
        outline:
          'border border-customPalette-300 bg-white shadow-sm hover:bg-white/50',
        secondary:
          'bg-customPalette-100 border border-customPalette-300 shadow-sm hover:bg-white/50',
      },
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          isLoading && 'cursor-not-allowed pointer-events-none',
          buttonVariants({ className, size, variant }),
        )}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <ReloadIcon className="h-4 w-4 animate-spin" />
        ) : (
          <>{children}</>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
