import ModelExplorerScaffold from "@/components/models/ModelExplorerScaffold";
import { modelExplorers } from "@/constants/modelExplorers";

export default function TransformerModelPage() {
  return <ModelExplorerScaffold {...modelExplorers.transformer} />;
}
