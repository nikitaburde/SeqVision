import type { Metadata } from "next";
import LanguageLab from "@/components/language/LanguageLab";

export const metadata: Metadata = {
  title: "Language Model Lab · SeqVision",
  description: "Run a tiny letter-sorting decoder and inspect causal attention in interactive 3D.",
};

export default function LanguagePage() {
  return <LanguageLab />;
}
