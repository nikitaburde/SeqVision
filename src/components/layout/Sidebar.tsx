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
    <aside className="w-72 border-r bg-sidebar p-4">
      <Link href={APP_ROUTES.home} className="mb-6 block text-xl font-bold">
        SeqVision
      </Link>

      <nav className="space-y-6">
        <div className="space-y-1">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={navClass(pathname === item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div>
          <p className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">Models</p>
          <div className="space-y-1">
            {MODELS.map((model) => {
              const href = APP_ROUTES.models[model.id];
              const active = pathname === href;
              return (
                <Link key={model.id} href={href} className={navClass(active)}>
                  <span>{model.name}</span>
                  {model.flagship ? <span className="ml-2 text-xs text-emerald-600">Flagship</span> : null}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
