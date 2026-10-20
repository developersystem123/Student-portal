import type { Metadata } from "next";
import AuthNotice from "@/components/site/auth/AuthNotice";
import ResetPasswordForm from "@/components/site/auth/ResetPasswordForm";
import { RESET_TTL_MINUTES } from "@/lib/authConstants";
import { resetLinkProblem, resolveResetToken } from "@/lib/passwordReset";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Choose a new password",
    description: "Set a new password for your EduPortal account.",
    path: "/reset-password",
    noIndex: true,
  }),
  // The URL carries a one-time token — keep it out of referrer headers as well as search results.
  referrer: "no-referrer",
};
// The page the emailed link lands on. The token is checked server-side so a dead link shows an
// explanation instead of a form that would fail on submit.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const raw = (await searchParams).token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const resolved = await resolveResetToken(token);

  return (
    <>
      <section className="login-one edu-auth">
        <div className="container">
          <div className="login-one__form">
            <div className="inner-title text-center">
              <h1 id="edu-reset-title">
                {resolved.ok ? <>Set your <span>new password</span></> : <>This link isn&apos;t <span>usable</span></>}
              </h1>
              <p>
                {resolved.ok
                  ? `Resetting the password for ${resolved.user.email}. Links are valid for ${RESET_TTL_MINUTES} minutes.`
                  : "Reset links work once, then expire."}
              </p>
            </div>
            {resolved.ok ? (
              <ResetPasswordForm token={token} />
            ) : (
              <AuthNotice tone="error" title="Reset link not accepted">
                <p>{resetLinkProblem(resolved.reason)}</p>
                <div className="edu-auth__panel-actions">
                  <a className="thm-btn" href="/forgot-password">
                    <span className="icon-angles-right" aria-hidden="true" />Request a new link
                  </a>
                </div>
                <p className="edu-auth__panel-links">
                  Or <a href="/login">go back to sign in</a>.
                </p>
              </AuthNotice>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
