import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function AdminDashboard() {

  const session = await getServerAuthSession();
  console.log("Session is",session);

  if (!session) {
    // Redirect to the login page if there is no session
    redirect("/admin/login");
    return null; // Stop further execution if redirecting
  }

  return (
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {session?.user?.email}</p>
        {/* Admin-specific content */}
      </div>
  );
}
