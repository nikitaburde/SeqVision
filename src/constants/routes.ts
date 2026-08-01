import type { ModelId } from "@/types";

export const APP_ROUTES = {
  home: "/",
  compare: "/compare",
  research: "/research",
  docs: "/docs",
  models: {
    lstm: "/models/lstm",
    xlstm: "/models/xlstm",
    gru: "/models/gru",
    mamba: "/models/mamba",
    transformer: "/models/transformer",
    convlstm: "/models/convlstm",
    tcn: "/models/tcn",
  } as Record<ModelId, string>,
};

export const PRIMARY_NAV_ITEMS = [
  { label: "Home", href: APP_ROUTES.home },
  { label: "Compare", href: APP_ROUTES.compare },
  { label: "Research", href: APP_ROUTES.research },
  { label: "Docs", href: APP_ROUTES.docs },
];
