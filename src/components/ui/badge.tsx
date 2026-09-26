import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        steel: "bg-elevated text-steel",
        outline: "border border-border text-muted-foreground",
        hot: "bg-primary text-primary-foreground",
        stock: "bg-success/15 text-success",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };
