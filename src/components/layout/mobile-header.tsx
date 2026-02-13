"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function MobileHeader({
  fullName,
  email,
}: {
  fullName: string | null;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 items-center border-b px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
        <span className="ml-3 text-lg font-semibold tracking-tight">
          Courtside
        </span>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar
            fullName={fullName}
            email={email}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
