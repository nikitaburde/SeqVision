import ModelExplorerScaffold from "@/components/models/ModelExplorerScaffold";
import { modelExplorers } from "@/constants/modelExplorers";

export default function XlstmModelPage() {
  return <ModelExplorerScaffold {...modelExplorers.xlstm} />;
}
