import * as React from "react";
import { BubbleLeftFillIcon } from "@feel-good/icons";
import { cn } from "../lib/utils";

const icons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  BubbleLeftFillIcon,
  CheckmarkSmallIcon: (props) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.5 8.5L6.5 11.5L12.5 5" />
    </svg>
  ),
  MinusSmallIcon: (props) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M4 8H12" />
    </svg>
  ),
  ArrowTriangleRightFillIcon: (props) => (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M5.5 3.5L11.5 8L5.5 12.5V3.5Z" />
    </svg>
  ),
};

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
}

function Icon({ name, className, ...props }: IconProps) {
  const SvgIcon = icons[name];
  if (!SvgIcon) {
    return null;
  }
  return <SvgIcon className={cn("size-4", className)} />;
}

export { Icon };
