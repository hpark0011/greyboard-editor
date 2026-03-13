import * as React from "react";
import { cn } from "../lib/utils";
import { Button, type ButtonProps } from "../primitives/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../primitives/tooltip";

interface IconButtonProps extends Omit<ButtonProps, "size"> {
  tooltip?: string;
  size?: "sm" | "default";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ tooltip, className, size = "default", ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn(
          size === "sm" ? "h-7 w-7" : "h-8 w-8",
          className
        )}
        {...props}
      />
    );

    if (!tooltip) return button;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton };
