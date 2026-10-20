import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import VerifyForm from "@/components/site/catalog/VerifyForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Verify a certificate",
  description: "Confirm an EduPortal certificate using its verification code.",
  path: "/verify",
});
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ code?: string | string[] }> }) {
  const params = await searchParams;
  const code = Array.isArray(params.code) ? params.code[0] ?? "" : params.code ?? "";
  return <>
    <PageHeader title="Verify a certificate" />
    <section className="contact-three edu-verify"><div className="container"><div className="edu-verify__inner">
      <div className="section-title-two text-center"><span className="edu-verify__icon icon-stamp" aria-hidden="true" /><div className="section-title-two__tagline-box"><span className="section-title-two__tagline">Certificate verification</span></div><h2 className="section-title-two__title">Verify a certificate</h2><p>Enter the verification code printed on an EduPortal certificate to confirm it&apos;s genuine.</p></div>
      <VerifyForm initialCode={code} />
    </div></div></section>
  </>;
}
