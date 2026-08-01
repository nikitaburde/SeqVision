import ModelExplorerScaffold from "@/components/models/ModelExplorerScaffold";
import { modelExplorers } from "@/constants/modelExplorers";

export default function TcnModelPage() {
  return <ModelExplorerScaffold {...modelExplorers.tcn} />;
}
