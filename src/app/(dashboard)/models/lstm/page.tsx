import ModelExplorerScaffold from "@/components/models/ModelExplorerScaffold";
import { modelExplorers } from "@/constants/modelExplorers";

export default function LstmModelPage() {
  return <ModelExplorerScaffold {...modelExplorers.lstm} />;
}
