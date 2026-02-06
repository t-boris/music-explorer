"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

const publicLinks = [
  { href: "/levels", label: "Levels" },
  { href: "/songs", label: "Songs" },
];

const authLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/practice", label: "Practice" },
  { href: "/progress", label: "Progress" },
  { href: "/community", label: "Community" },
];

function NavLink({
  href,
  label,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm font-medium transition-colors hover:text-accent-400 ${
        isActive ? "text-accent-400" : "text-text-secondary"
      }`}
    >
      {label}
    </Link>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = user
    ? [...publicLinks, ...authLinks]
    : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-800/95 backdrop-blur supports-[backdrop-filter]:bg-surface-800/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Music className="h-6 w-6 text-accent-400" />
          <span className="font-heading text-lg font-bold text-text-primary">
            Music Explorer
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={pathname.startsWith(link.href)}
            />
          ))}

          {loading && (
            <>
              <Separator orientation="vertical" className="h-5" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 w-16 animate-pulse rounded bg-surface-700"
                />
              ))}
            </>
          )}

          {user && !loading && (
            <>
              <Separator orientation="vertical" className="h-5" />
              {authLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={pathname.startsWith(link.href)}
                />
              ))}
            </>
          )}
        </nav>

        {/* Right side: user menu + mobile menu */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-surface-800">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-text-primary">
                  <Music className="h-5 w-5 text-accent-400" />
                  Music Explorer
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                {visibleLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    isActive={pathname.startsWith(link.href)}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
                {loading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-4 w-20 animate-pulse rounded bg-surface-700"
                      />
                    ))}
                  </>
                )}
                <Separator className="my-2" />
                <div onClick={() => setMobileOpen(false)}>
                  <UserMenu />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
