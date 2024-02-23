import { cn } from '@/lib/tailwind-utils';
import { HomeIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';

const Breadcrumbs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-5 items-center space-x-3 mt-4 mb-8 font-medium text-sm text-slate-500',
      className,
    )}
  >
    {children}
  </div>
));
Breadcrumbs.displayName = 'Breadcrumbs';

const BreadcrumbsLink = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & {
    href: string;
  }
>(({ children, className, href }, ref) => (
  <Link ref={ref} href={href} className={className}>
    {children}
  </Link>
));
BreadcrumbsLink.displayName = 'BreadcrumbsLink';

const BreadcrumbsText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className }, ref) => (
  <div ref={ref} className={className}>
    {children}
  </div>
));
BreadcrumbsText.displayName = 'BreadcrumbsText';

const BreadcrumbsDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className }, ref) => (
  <div ref={ref} className={className}>
    /
  </div>
));
BreadcrumbsDivider.displayName = 'BreadcrumbsDivider';

const BreadcrumbsHome = React.forwardRef<
  React.ElementRef<typeof Link>,
  Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href'>
>(({ className }, ref) => (
  <BreadcrumbsLink ref={ref} href={'/'} className={className}>
    <HomeIcon />
  </BreadcrumbsLink>
));
BreadcrumbsHome.displayName = 'BreadcrumbsHome';

export {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsLink,
  BreadcrumbsText,
};
