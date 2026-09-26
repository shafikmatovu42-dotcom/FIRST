import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md border border-input bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
