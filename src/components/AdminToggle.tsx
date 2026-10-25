"use client";
import { useRouter } from "next/navigation"; import { useState } from "react";
export default function AdminToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter(); const [err, setErr] = useState("");
  async function go() { const r = await fetch("/api/admin/course", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, published: !published }) }); if (r.ok) router.refresh(); else setErr("Thao tác thất bại"); }
  return <><button onClick={go}>{published ? "Ẩn khóa học" : "Xuất bản"}</button>{err && <span role="alert"> {err}</span>}</>;
}
