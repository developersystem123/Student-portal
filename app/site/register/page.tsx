import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/site/auth/RegisterForm";
import { getAccount } from "@/components/site/data";
import { safeNextPath } from "@/lib/validation";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Create account",
  description: "Create your free EduPortal account.",
  path: "/register",
});
type Props = { searchParams: Promise<{ next?: string | string[] }> };

// sign-up.html → section.sign-up-one, wired to the portal's real sign-up.
export default async function RegisterPage({ searchParams }: Props) {
  const rawNext = (await searchParams).next;
  // `?next=` (e.g. the course a visitor was enrolling in) is validated and carried through the form.
  const next = safeNextPath(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  const account = await getAccount();
  if (account) redirect(next ?? account.href);

  return (
    <>
      <section className="sign-up-one edu-auth edu-auth--wide">
        <div className="container">
          <div className="sign-up-one__form">
            <div className="inner-title text-center">
              <span className="edu-auth__badge"><i className="icon-thumbs-up" aria-hidden="true" />Free forever</span>
              <h1 id="edu-register-title">Create your <span>EduPortal</span> account</h1>
              <p>Courses, an AI tutor, quizzes and certificates — all in one place.</p>
            </div>
            <RegisterForm next={next} />
          </div>
        </div>
      </section>
    </>
  );
}
