import DashboardLayout from "@/components/layout/DashboardLayout";

export default function HomePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold">
        Welcome to SeqVision
      </h1>

      <p className="mt-4 text-muted-foreground">
        Interactive visualization platform for sequence models.
      </p>
    </div>
  );
}