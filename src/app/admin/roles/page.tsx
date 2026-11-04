import { getRolePermissionMatrix } from "@/actions/access-control";
import RolesPageView from "./RolesPageView";

export default async function AdminRolesPage() {
  const data = await getRolePermissionMatrix();
  return <RolesPageView initialData={data} />;
}
