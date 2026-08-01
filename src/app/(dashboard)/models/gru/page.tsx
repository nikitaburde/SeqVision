import ModelExplorerScaffold from "@/components/models/ModelExplorerScaffold";
import { modelExplorers } from "@/constants/modelExplorers";

export default function GruModelPage() {
  return <ModelExplorerScaffold {...modelExplorers.gru} />;
}
