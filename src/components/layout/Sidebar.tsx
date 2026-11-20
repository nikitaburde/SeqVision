"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MODELS } from "@/constants/model";
import { APP_ROUTES, PRIMARY_NAV_ITEMS } from "@/constants/routes";

function navClass(active: boolean) {
  return `block rounded-md px-3 py-2 text-sm ${
    active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
  }`;
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b bg-sidebar p-4 lg:w-56 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0">
      <Link href={APP_ROUTES.home} className="mb-3 block text-xl font-bold lg:mb-6">
        SeqVision
      </Link>

      <nav aria-label="Main navigation" className="space-y-3 lg:space-y-6">
        <div className="flex flex-wrap gap-1 lg:block lg:space-y-1">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={navClass(pathname === item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div>
          <p className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">Models</p>
          <div className="flex flex-wrap gap-1 lg:block lg:space-y-1">
            {MODELS.map((model) => {
              const href = APP_ROUTES.models[model.id];
              const active = pathname === href;
              return (
                <Link key={model.id} href={href} aria-current={active ? "page" : undefined} className={navClass(active)}>
                  <span>{model.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
