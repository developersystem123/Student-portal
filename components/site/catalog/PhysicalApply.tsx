"use client";

import { useState } from "react";
import type { Course } from "@/lib/mockData";
import { useAuth } from "@/lib/store";
import { PhysicalApplicationModal } from "@/components/course/PhysicalApplicationModal";

export default function PhysicalApply({ course }: { course: Course }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <>
      <button type="button" className="edu-apply-btn" onClick={() => {
        if (!user) { window.location.assign("/register"); return; }
        // Same rule as the portal catalogue: only student accounts can apply.
        if (user.role !== "Student") { setNotice("In-person applications are only available to student accounts."); return; }
        setOpen(true);
      }}>Apply for in-person classes</button>
      {notice && <p className="edu-apply-notice" role="status">{notice}</p>}
      {open && <PhysicalApplicationModal course={course} open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
