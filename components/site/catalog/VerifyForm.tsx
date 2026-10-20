"use client";

import { useCallback, useEffect, useState } from "react";

type Certificate = { verifyCode: string; studentName: string; courseTitle: string; score: number; issuedAt: string };
type Result = { state: "idle" | "loading" | "invalid" | "error" } | { state: "valid"; certificate: Certificate };

export default function VerifyForm({ initialCode }: { initialCode: string }) {
  const [result, setResult] = useState<Result>({ state: "idle" });
  const verify = useCallback(async (raw: string) => {
    // Codes are printed in upper case; normalise so a lower-case entry still matches.
    const code = raw.trim().toUpperCase();
    if (!code) return;
    // Keep the code in the URL so a result can be shared or bookmarked without retyping it.
    // replaceState (not router.replace) avoids a server round-trip that would re-run this effect.
    const url = new URL(window.location.href);
    url.searchParams.set("code", code);
    window.history.replaceState(null, "", url);
    setResult({ state: "loading" });
    try {
      const response = await fetch(`/api/certificates/verify?code=${encodeURIComponent(code)}`);
      if (!response.ok) { setResult({ state: "error" }); return; }
      const data = await response.json();
      setResult(data.valid && data.certificate ? { state: "valid", certificate: data.certificate } : { state: "invalid" });
    } catch { setResult({ state: "error" }); }
  }, []);
  useEffect(() => {
    if (!initialCode) return;
    const timer = window.setTimeout(() => { void verify(initialCode); }, 0);
    return () => window.clearTimeout(timer);
  }, [initialCode, verify]);
  return (
    <div className="edu-verify__card">
      <form className="contact-three__form" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); void verify(String(data.get("code") ?? "")); }}>
        <label className="contact-three__input-title" htmlFor="edu-verify-code">Verification code *</label>
        <div className="edu-verify__form-row"><div className="contact-three__input-box"><input id="edu-verify-code" type="text" name="code" placeholder="e.g. EDU-AB12CD" defaultValue={initialCode} autoComplete="off" spellCheck={false} aria-describedby="edu-verify-help" required /></div><div className="contact-three__btn-box"><button type="submit" disabled={result.state === "loading"} className="thm-btn contact-three__btn edu-submit"><span className="icon-angles-right" aria-hidden="true" />{result.state === "loading" ? "Checking…" : "Verify"}</button></div></div>
        <p className="edu-verify__help" id="edu-verify-help">Find the code under the QR code in the bottom corner of the certificate, or at the end of its share link. It starts with <code>EDU-</code>, and letter case doesn&apos;t matter.</p>
      </form>
      <div aria-live="polite" role="status">
        {result.state === "loading" && <p className="edu-verify__feedback">Checking the certificate…</p>}
        {result.state === "valid" && <div className="edu-verify__result edu-verify__result--valid"><h3><span className="fas fa-check-circle" /> Valid certificate <span className="edu-verify__score">{result.certificate.score}%</span></h3><dl><div><dt>Issued to</dt><dd>{result.certificate.studentName}</dd></div><div><dt>Course</dt><dd>{result.certificate.courseTitle}</dd></div><div><dt>Issued on</dt><dd>{new Date(result.certificate.issuedAt).toLocaleDateString()}</dd></div><div><dt>Verification code</dt><dd>{result.certificate.verifyCode}</dd></div></dl></div>}
        {result.state === "invalid" && <div className="edu-verify__result edu-verify__result--invalid"><h3>No certificate found</h3><p>We couldn&apos;t find a certificate with that code. Check the code and try again.</p></div>}
        {result.state === "error" && <div className="edu-verify__result edu-verify__result--invalid"><h3>Verification unavailable</h3><p>We couldn&apos;t check this certificate right now. Please try again shortly.</p></div>}
      </div>
    </div>
  );
}
