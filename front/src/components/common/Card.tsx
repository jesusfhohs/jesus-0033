import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx('bg-white rounded-xl p-6 border border-gray-200 shadow-sm', className)
      )}
    >
      {children}
    </div>
  );
}