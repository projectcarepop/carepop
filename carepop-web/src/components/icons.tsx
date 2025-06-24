import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "h-4 w-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface IconProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof iconVariants> {}

const createIcon = (d: string) => {
  const Icon = ({ className, variant, size, ...props }: IconProps) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(iconVariants({ variant, size, className }))}
        {...props}
      >
        <path d={d} />
      </svg>
    )
  }
  Icon.displayName = "Icon"
  return Icon
}

export const Icons = {
  google: ({ className, variant, size, ...props }: IconProps) => (
    <svg 
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(iconVariants({ variant, size, className }))}
      {...props}
    >
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-4.25 1.62-5.03 0-9.12-4.09-9.12-9.12s4.09-9.12 9.12-9.12c2.82 0 4.93 1.1 6.34 2.36l2.22-2.22C19.46 1.18 16.25 0 12.48 0 5.88 0 .02 5.88.02 12.48s5.86 12.48 12.46 12.48c3.34 0 6.08-1.1 8.12-3.12 2.1-2.1 2.82-5.22 2.82-7.78-.02-.66-.08-1.32-.2-1.94z"/>
    </svg>
  ),
  apple: createIcon("M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 4-2.31 4-5.38 0-3.11-2.25-4.49-4.25-4.49C13.75 12.13 13 14 13 14s-1.75-2.13-3.5-2.13c-2.5 0-4.5 2.06-4.5 4.94 0 2.61 2 4.19 3.5 4.19 1.19 0 2.25-1 3.5-1zM12 2C10.5 2 9.25 1 8 1 5 1 4 3.31 4 6.38c0 3.11 2.25 4.49 4.25 4.49C10.25 10.87 11 9 11 9s1.75 2.13 3.5 2.13c2.5 0 4.5-2.06 4.5-4.94C19 4.61 17 3.19 15.5 3.19c-1.19 0-2.25.94-3.5.94z"),
  eye: createIcon("M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"),
  eyeOff: createIcon("M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"),
  spinner: createIcon("M21 12a9 9 0 1 1-6.219-8.56"),
  mail: createIcon("M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8M22 13l-8 5-8-5"),
} 