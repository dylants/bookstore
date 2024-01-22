import * as React from 'react';

import { cn } from 'lib/utils';
import { Loader2 } from 'lucide-react';
import { VariantProps, cva } from 'class-variance-authority';

const loadingVariants = cva('text-customPalette-400 animate-spin', {
  defaultVariants: {
    size: 'default',
  },
  variants: {
    size: {
      default: 'h-12 w-12',
      lg: 'h-16 w-16',
      sm: 'h-8 w-8',
    },
  },
});

export interface LoadingSpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof loadingVariants> {}

const LoadingSpinner = ({ className, size, ...props }: LoadingSpinnerProps) => {
  return (
    <Loader2 className={cn(loadingVariants({ className, size }))} {...props} />
  );
};
LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };
