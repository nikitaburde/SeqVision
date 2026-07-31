"use client";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background p-4">
      <h2 className="mb-6 text-xl font-bold">
        SeqVision
      </h2>

      <nav className="space-y-2">
        <div className="rounded-md p-2 hover:bg-accent cursor-pointer">
          Home
        </div>

        <div className="rounded-md p-2 hover:bg-accent cursor-pointer">
          LSTM
        </div>

        <div className="rounded-md p-2 hover:bg-accent cursor-pointer">
          GRU
        </div>

        <div className="rounded-md p-2 hover:bg-accent cursor-pointer">
          Mamba
        </div>

        <div className="rounded-md p-2 hover:bg-accent cursor-pointer">
          Transformer
        </div>
      </nav>
    </aside>
  );
}