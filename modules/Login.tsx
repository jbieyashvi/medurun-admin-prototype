"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";

export function Login({ onLogin }: { onLogin: () => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="login">
      <div className="login-left">
        <div style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 23, fontWeight: 800, letterSpacing: "-.5px" }}>
          <Icon name="Ambulance" size={24} /> Medurun
        </div>
        <div className="login-h">Emergency Care,<br />Managed <span className="ac">Smarter.</span></div>
        <div style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)", maxWidth: 430 }}>
          Unified super admin platform for ambulance agencies, drivers, dispatchers, and patients across all cities.
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 28, maxWidth: 480 }}>
          {[["142", "Active Agencies"], ["3,841", "Verified Drivers"], ["₹2.4Cr", "Monthly Revenue"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.6px" }}>{v}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="login-card">
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.6px", textAlign: "center", marginBottom: 6 }}>Welcome Back</div>
          <div style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", marginBottom: 32 }}>Sign in to your super admin account</div>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input className="input" defaultValue="admin@medurun.com" />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: "relative" }}>
              <input className="input" type={show ? "text" : "password"} defaultValue="password123" />
              <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: 13, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                <Icon name={show ? "EyeOff" : "Eye"} size={16} />
              </button>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", height: 48, marginTop: 6 }} onClick={onLogin}>Sign In</button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: "#9CA3AF", marginTop: 18 }}>
            <Icon name="ShieldCheck" size={14} /> Secure access with 2FA verification
          </div>
        </div>
      </div>
    </div>
  );
}
