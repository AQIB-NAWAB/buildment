import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { signupAction } from "@/app/(auth)/actions";
import { getSession } from "@/lib/session";

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return <AuthForm mode="signup" action={signupAction} />;
}
