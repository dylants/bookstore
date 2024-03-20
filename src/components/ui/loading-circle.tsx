import { cn } from '@/lib/tailwind-utils';
import { VariantProps, cva } from 'class-variance-authority';
import { motion, SVGMotionProps } from 'framer-motion';

const dotsTransition: SVGMotionProps<SVGCircleElement>['transition'] = {
  duration: 0.5,
  ease: 'easeInOut',
  repeat: Infinity,
  repeatType: 'reverse',
};

const loadingCircleVariants = cva('', {
  defaultVariants: {
    size: 'large',
  },
  variants: {
    size: {
      small: '',
      // eslint-disable-next-line sort-keys
      large: '',
      xLarge: '',
    },
  },
});

export interface LoadingCircleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingCircleVariants> {
  color?: string;
}

function LoadingCircle({
  className,
  // customPalette-400
  color = '#13315C',
  size = 'large',
  ...props
}: LoadingCircleProps) {
  let svgSize, strokeWidth: number;
  switch (size) {
    case 'small':
      svgSize = 20;
      strokeWidth = 2;
      break;
    case 'xLarge':
      svgSize = 200;
      strokeWidth = 10;
      break;
    case 'large':
    default:
      svgSize = 100;
      strokeWidth = 5;
      break;
  }
  const dotSize = svgSize * 0.02;
  const dotBounceHeight = svgSize / 20;

  return (
    <div
      className={cn(
        `w-[${svgSize}px] h-[${svgSize}px] fill-transparent`,
        className,
      )}
      {...props}
    >
      <motion.svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        <motion.circle
          cx={svgSize / 2 - svgSize / 7}
          cy={svgSize / 2}
          r={dotSize}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          animate={{
            y: [-dotBounceHeight, dotBounceHeight],
          }}
          transition={dotsTransition}
        />
        <motion.circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={dotSize}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          animate={{
            y: [-dotBounceHeight, dotBounceHeight],
          }}
          transition={{
            delay: 0.25,
            ...dotsTransition,
          }}
        />
        <motion.circle
          cx={svgSize / 2 + svgSize / 7}
          cy={svgSize / 2}
          r={dotSize}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          animate={{
            y: [-dotBounceHeight, dotBounceHeight],
          }}
          transition={{
            delay: 0.5,
            ...dotsTransition,
          }}
        />
        <motion.circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={svgSize * 0.4}
          stroke={color}
          strokeWidth={strokeWidth}
          animate={{
            pathLength: [0, 1],
            pathOffset: [0, 1],
          }}
          transition={{
            duration: 2,
            ease: 'easeIn',
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      </motion.svg>
    </div>
  );
}

export { LoadingCircle, loadingCircleVariants };
