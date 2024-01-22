import { cn } from "lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-customPalette-200/20",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
