"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Login } from "@/modules/Login";
import { SCREENS } from "@/modules/registry";

export default function Page() {
  const [authed, setAuthed] = useState(false);
  const [screen, setScreen] = useState("dashboard");

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const Module = SCREENS[screen] || SCREENS.dashboard;
  return (
    <div className="app">
      <Sidebar active={screen} onNavigate={setScreen} onSignOut={() => setAuthed(false)} />
      <Topbar screen={screen} />
      <main id="main">
        <Module onNavigate={setScreen} />
      </main>
    </div>
  );
}
