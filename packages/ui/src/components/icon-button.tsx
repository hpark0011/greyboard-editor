import * as React from "react";
import { Button, type ButtonProps } from "../primitives/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../primitives/tooltip";

interface IconButtonProps extends ButtonProps {
  tooltip?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ tooltip, className, size = "icon-sm", ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
        variant="ghost"
        size={size}
        className={className}
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
  },
);
IconButton.displayName = "IconButton";

export { IconButton };
