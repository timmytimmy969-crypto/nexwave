"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Mail } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

const fields = ["Creator", "Actor", "Filmmaker", "Editor", "Photographer", "Storyteller", "Influencer"];
const roles = ["Creators", "Actors", "Filmmakers", "Editors", "Photographers", "Storytellers", "Influencers"];

export default function Home() {
  const [form, setForm] = useState({ fullName: "", email: "", instagram: "", field: fields[0] });
  const [phase, setPhase] = useState("form");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const year = useMemo(() => new Date().getFullYear(), []);

  async function submitRegistration(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPhase("otp");
      setMessage("A one-time code has been sent to your Gmail.");
    } catch (error) {
      setMessage(error.message || "Registration could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.email, code })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setWhatsapp(data.whatsapp);
      setPhase("success");
    } catch (error) {
      setMessage(error.message || "Verification could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav">
        <a href="#top" className="brand"><Image src="/nexwave-logo.svg" alt="" width={54} height={54} />NEXWAVE</a>
        <div><a href="#about">About</a><a href="#community">Community</a><a href="#join">Join</a></div>
      </nav>

      <section className="hero" id="top">
        <motion.div initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="hero-inner">
          <Image src="/nexwave-logo.svg" alt="NEXWAVE logo" width={310} height={214} priority />
          <p className="eyebrow">Create. Connect. Elevate.</p>
          <h1>NEXWAVE</h1>
          <h2>The next generation of creatives.</h2>
          <p>Nexwave is a creative collective built to help creators, actors, filmmakers, editors, photographers, influencers and storytellers grow together, collaborate, gain visibility and build meaningful careers.</p>
          <a className="button" href="#join">Join The First Wave <ArrowRight size={18} /></a>
        </motion.div>
      </section>

      <section className="section two" id="about">
        <div><span>Why it exists</span><h2>Talent should not have to grow alone.</h2></div>
        <p>Nexwave was created for talented African creatives who are building in isolation. It is not a school or a traditional media company. It is a living culture for people with hunger, taste and vision: a place to be seen, supported, challenged and connected.</p>
      </section>

      <section className="section" id="for">
        <span>Who it is for</span><h2>Different crafts. One wave.</h2>
        <div className="grid">{roles.map((role) => <article key={role}><h3>{role}</h3><p>For emerging talent ready to collaborate, improve, gain visibility and build with a community.</p></article>)}</div>
      </section>

      <section className="section two" id="community">
        <div><span>Online first. Real always.</span><h2>A creative movement for people moving in the same direction.</h2></div>
        <p>Members connect online, trade ideas, discover collaborators, attend meetups, share opportunities and evolve together. The long-term vision is to build one of the leading creative ecosystems for emerging African talent.</p>
      </section>

      <section className="section join" id="join">
        <div><span>Join the first wave</span><h2>Your room is forming.</h2><p>Register with your Gmail, verify your code, and step into the first Nexwave community space.</p></div>
        <AnimatePresence mode="wait">
          {phase === "form" && <motion.form className="form" onSubmit={submitRegistration} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <label>Full name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
            <label>Gmail address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label>Instagram username<input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} required /></label>
            <label>Creative field<select value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })}>{fields.map((field) => <option key={field}>{field}</option>)}</select></label>
            <button className="button" disabled={loading}>{loading ? "Sending..." : "Send Verification Code"} <Mail size={18} /></button>
            {message && <p className="note">{message}</p>}
          </motion.form>}
          {phase === "otp" && <motion.form className="form" onSubmit={verifyCode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Enter your one-time code</h3><p>We sent a 6-digit code to {form.email}.</p>
            <input className="otp" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" required />
            <button className="button" disabled={loading || code.length !== 6}>{loading ? "Verifying..." : "Verify and Enter"} <Check size={18} /></button>
            {message && <p className="note">{message}</p>}
          </motion.form>}
          {phase === "success" && <motion.div className="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Image src="/nexwave-logo.svg" alt="NEXWAVE logo" width={220} height={150} />
            <h2>Welcome to Nexwave - The First Wave starts here.</h2>
            <p>A welcome email has been sent to you.</p>
            <a className="button" href={whatsapp} target="_blank">Enter WhatsApp Group <ArrowRight size={18} /></a>
          </motion.div>}
        </AnimatePresence>
      </section>

      <footer><Image src="/nexwave-logo.svg" alt="" width={80} height={56} /><p>NEXWAVE {year}. Create. Connect. Elevate.</p></footer>
    </main>
  );
}
