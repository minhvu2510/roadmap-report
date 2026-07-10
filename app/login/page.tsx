"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(mail: string) {
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: mail }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j.error || "Đăng nhập thất bại");
        setBusy(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setErr("Lỗi kết nối");
      setBusy(false);
    }
  }

  return (
    <div className="wrap login-wrap">
      <div className="login-card">
        <p className="kicker">Engineering Roadmap</p>
        <h1>Đăng nhập</h1>
        <p>Đăng nhập để xem lộ trình phát triển sản phẩm.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) login(email);
          }}
        >
          <div className="field">
            <label>Email công ty</label>
            <input
              type="email"
              placeholder="ban@cong-ty.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          {err && <div className="err">{err}</div>}
          <div className="modal-actions" style={{ marginTop: 14 }}>
            <button className="btn primary" type="submit" disabled={busy} style={{ width: "100%" }}>
              {busy ? "Đang vào…" : "Đăng nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
