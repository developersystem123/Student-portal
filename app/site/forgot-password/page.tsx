import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/site/auth/ForgotPasswordForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Forgot password",
  description: "Reset your EduPortal password with a link sent to your email.",
  path: "/forgot-password",
  noIndex: true,
});
// login.html's "Forgot password?" link used to point at /contact — this is where it goes now.
export default function ForgotPasswordPage() {
  return (
    <>
      <section className="login-one edu-auth">
        <div className="container">
          <div className="login-one__form">
            <div className="inner-title text-center">
              <h1 id="edu-forgot-title">Forgot your <span>password</span>?</h1>
              <p>We&apos;ll email you a link to choose a new one.</p>
            </div>
            <ForgotPasswordForm />
          </div>
        </div>
      </section>
    </>
  );
}
