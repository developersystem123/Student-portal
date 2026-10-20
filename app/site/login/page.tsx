import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/site/auth/LoginForm";
import { getAccount } from "@/components/site/data";
import { safeNextPath } from "@/lib/validation";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to EduPortal to continue your learning journey.",
  path: "/login",
});
type Props = { searchParams: Promise<{ next?: string | string[] }> };

// login.html → section.login-one, wired to the portal's real sign-in.
export default async function LoginPage({ searchParams }: Props) {
  const rawNext = (await searchParams).next;
  // `?next=` (e.g. the course a visitor was enrolling in) is validated and carried through the form.
  const next = safeNextPath(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  // Already signed in: straight back to where they were headed, else the right portal.
  const account = await getAccount();
  if (account) redirect(next ?? account.href);

  return (
    <>
      <section className="login-one edu-auth">
        <div className="container">
          <div className="login-one__form">
            <div className="inner-title text-center">
              <h1 id="edu-login-title">Welcome back</h1>
              <p>Sign in to continue your learning journey.</p>
            </div>
            <LoginForm next={next} />
          </div>
        </div>
      </section>
    </>
  );
}
