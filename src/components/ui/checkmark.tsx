import { cn } from '@/lib/tailwind-utils';
import { VariantProps, cva } from 'class-variance-authority';
import { motion } from 'framer-motion';

// borrowed heavily from:
// https://www.framer.com/motion/examples/#line-drawing
// https://codesandbox.io/s/framer-motion-5-1-line-drawing-ph6ln

const draw = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: (i: number) => {
    const delay = i * 0.5;
    return {
      opacity: 1,
      pathLength: 2,
      transition: {
        opacity: { delay, duration: 0.01 },
        pathLength: {
          bounce: 0,
          delay,
          duration: 1.5,
          type: 'spring',
        },
      },
    };
  },
};

const checkmarkVariants = cva('', {
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

export interface CheckmarkProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof checkmarkVariants> {
  color: string;
}

function Checkmark({
  className,
  color = '#00cc88',
  size = 'large',
}: CheckmarkProps) {
  let pixelSize, fillSize: number;
  switch (size) {
    case 'small':
      pixelSize = 20;
      fillSize = 3;
      break;
    case 'xLarge':
      pixelSize = 200;
      fillSize = 10;
      break;
    case 'large':
    default:
      pixelSize = 100;
      fillSize = 5;
      break;
  }

  return (
    <div
      className={cn(
        `w-[${pixelSize}px] h-[${pixelSize}px] stroke-[${fillSize}] fill-transparent`,
        className,
      )}
    >
      <motion.svg
        width={pixelSize}
        height={pixelSize}
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
        initial="hidden"
        animate="visible"
      >
        {/* The math below is based on the 3 available sizes */}
        <motion.circle
          cx={pixelSize / 2}
          cy={pixelSize / 2}
          r={pixelSize * 0.4}
          stroke={color}
          variants={draw}
          custom={1.2}
        />
        <motion.line
          x1={pixelSize * 0.25}
          y1={pixelSize * 0.52}
          x2={pixelSize * 0.455}
          y2={pixelSize * 0.675}
          stroke={color}
          variants={draw}
          custom={0}
        />
        <motion.line
          x1={pixelSize * 0.42}
          y1={pixelSize * 0.68}
          x2={pixelSize * 0.7}
          y2={pixelSize * 0.32}
          stroke={color}
          variants={draw}
          custom={0.5}
        />
      </motion.svg>
    </div>
  );
}

export { Checkmark, checkmarkVariants };
