"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null
);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) return null;
  const trigger = (
    <button
      type="button"
      onClick={() => ctx.setOpen((v) => !v)}
      className="outline-none"
    >
      {children}
    </button>
  );
  return asChild ? <>{trigger}</> : trigger;
}

export function DropdownMenuContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div
      className={cn(
        "absolute right-0 mt-2 w-48 rounded-md border border-border bg-popover text-popover-foreground shadow-lg focus:outline-none z-50",
        className
      )}
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
  onSelect,
}: {
  children: React.ReactNode;
  className?: string;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted focus:outline-none",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-3 py-2 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}

export function DropdownMenuGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-1">{children}</div>;
}

