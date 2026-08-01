import ModelExplorerScaffold from "@/components/models/ModelExplorerScaffold";
import { modelExplorers } from "@/constants/modelExplorers";

export default function MambaModelPage() {
  return <ModelExplorerScaffold {...modelExplorers.mamba} />;
}
