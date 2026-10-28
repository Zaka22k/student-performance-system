import { getGroups } from "@/actions/groups";
import GroupsPageView from "./GroupsPageView";

export default async function GroupsPage() {
  const initialGroups = await getGroups("");

  return <GroupsPageView initialGroups={initialGroups} />;
}
