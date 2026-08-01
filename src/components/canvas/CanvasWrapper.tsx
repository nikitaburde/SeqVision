interface CanvasWrapperProps {
  children: React.ReactNode;
}

export default function CanvasWrapper({ children }: CanvasWrapperProps) {
  return <div className="h-full w-full rounded-lg border bg-muted/10">{children}</div>;
}
