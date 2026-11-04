import {
  getAdminUsers,
  getAssignableRoles,
} from "@/actions/access-control";
import { getStudents } from "@/actions/students";
import { getTeachers } from "@/actions/teachers";
import UsersAdminView from "./UsersAdminView";

export default async function AdminUsersPage() {
  const [users, roles, students, teachers] = await Promise.all([
    getAdminUsers(),
    getAssignableRoles(),
    getStudents(),
    getTeachers(),
  ]);
  return (
    <UsersAdminView
      initialUsers={users}
      roles={roles}
      students={students.map((student) => ({
        id: student.student_id,
        label: `${student.last_name} ${student.first_name} · ${student.student_number}`,
      }))}
      teachers={teachers.map((teacher) => ({
        id: teacher.teacher_id,
        label: [teacher.last_name, teacher.first_name, teacher.middle_name].filter(Boolean).join(" "),
      }))}
    />
  );
}
