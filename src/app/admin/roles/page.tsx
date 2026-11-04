import { getRolePermissionMatrix } from "@/actions/access-control";
import RolesAdminView from "./RolesAdminView";

export default async function AdminRolesPage() {
  const data = await getRolePermissionMatrix();
  return <RolesAdminView initialData={data} />;
}
