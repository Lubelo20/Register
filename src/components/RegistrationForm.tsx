"use client";

import { useState } from "react";

const SOCIAL_PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "X (Twitter)", "TikTok"];

type Fields = {
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  city: string;
  occupation: string;
  institution: string;
  businessName: string;
  sector: string;
  stage: string;
  businessDesc: string;
  domain: string;
  referral: string;
  goals: string;
};

const EMPTY: Fields = {
  firstName: "",
  surname: "",
  email: "",
  phone: "",
  city: "",
  occupation: "",
  institution: "",
  businessName: "",
  sector: "",
  stage: "",
  businessDesc: "",
  domain: "",
  referral: "",
  goals: "",
};

function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function phoneOk(v: string) {
  return /^(\+27|0)\d{9}$/.test(v.replace(/[^\d+]/g, ""));
}

export default function RegistrationForm() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [status, setStatus] = useState("");
  const [hasBusiness, setHasBusiness] = useState("");
  const [hasWebsite, setHasWebsite] = useState("");
  const [socials, setSocials] = useState<string[]>([]);
  const [optin, setOptin] = useState(false);
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState(""); // honeypot

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ firstName: string; reference: string } | null>(null);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const toggleSocial = (p: string) =>
    setSocials((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  function validate() {
    const e: Record<string, boolean> = {};
    if (!f.firstName.trim()) e.firstName = true;
    if (!f.surname.trim()) e.surname = true;
    if (!emailOk(f.email.trim())) e.email = true;
    if (!phoneOk(f.phone.trim())) e.phone = true;
    if (!f.city.trim()) e.city = true;
    if (!f.occupation.trim()) e.occupation = true;
    if (!status) e.status = true;
    if (!f.referral) e.referral = true;
    if (!hasBusiness) e.hasBusiness = true;
    if (hasBusiness === "Yes" && !hasWebsite) e.hasWebsite = true;
    if (!consent) e.consent = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (hp) return; // bot
    if (!validate()) {
      document.querySelector(".bad, .err")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          status,
          hasBusiness,
          hasWebsite: hasBusiness === "Yes" ? hasWebsite : "",
          socials,
          marketingOptIn: optin,
          company_url: hp,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setDone({ firstName: f.firstName, reference: data.reference });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function addToCalendar() {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Lubelo Tech//Master Class//EN",
      "BEGIN:VEVENT",
      `UID:${done?.reference || Date.now()}@masterclass`,
      "DTSTART:20260611T070000Z",
      "DTEND:20260611T133000Z",
      "SUMMARY:Youth Digital Empowerment & Entrepreneurship Master Class",
      "LOCATION:Moses Kotane Research Institute, 190 K.E Masinga Road, Durban",
      "DESCRIPTION:Empower. Equip. Connect. Succeed. Arrival & registration from 09:00.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "master-class-11-june-2026.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (done) {
    return (
      <div className="done">
        <div className="tick">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2>You&apos;re registered</h2>
        <p>
          Thanks, <b>{done.firstName}</b> — your seat for the Master Class on <b>11 June 2026</b> is reserved.
        </p>
        <div className="refcode">
          <span className="refcode-label">Your reference</span>
          <span className="refcode-value">{done.reference}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sheet-pad">
      <p className="lede">
        Seats are limited. Fill in your details below to reserve your place. Fields marked{" "}
        <span style={{ color: "var(--gold)", fontWeight: 700 }}>*</span> are required.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* honeypot */}
        <div className="hp" aria-hidden="true">
          <label>
            Leave this empty
            <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          </label>
        </div>

        {/* 1 · details */}
        <fieldset>
          <legend>
            <span className="num">1</span> Your details
          </legend>
          <div className="grid">
            <label className="fld">
              <span className="lab">First name<span className="req">*</span></span>
              <input type="text" className={errors.firstName ? "bad" : ""} value={f.firstName} onChange={set("firstName")} autoComplete="given-name" />
              {errors.firstName && <span className="err">Please enter your first name.</span>}
            </label>
            <label className="fld">
              <span className="lab">Surname<span className="req">*</span></span>
              <input type="text" className={errors.surname ? "bad" : ""} value={f.surname} onChange={set("surname")} autoComplete="family-name" />
              {errors.surname && <span className="err">Please enter your surname.</span>}
            </label>
            <label className="fld">
              <span className="lab">Email address<span className="req">*</span></span>
              <input type="email" className={errors.email ? "bad" : ""} value={f.email} onChange={set("email")} placeholder="you@example.co.za" autoComplete="email" />
              {errors.email && <span className="err">Enter a valid email address.</span>}
            </label>
            <label className="fld">
              <span className="lab">Cell number<span className="req">*</span></span>
              <input type="tel" className={errors.phone ? "bad" : ""} value={f.phone} onChange={set("phone")} placeholder="082 123 4567" autoComplete="tel" />
              {errors.phone && <span className="err">Enter a valid South African cell number.</span>}
            </label>
            <label className="fld full">
              <span className="lab">City / Area<span className="req">*</span></span>
              <input type="text" className={errors.city ? "bad" : ""} value={f.city} onChange={set("city")} placeholder="e.g. Durban" />
              {errors.city && <span className="err">Please enter your city or area.</span>}
            </label>
          </div>
        </fieldset>

        {/* 2 · what you do */}
        <fieldset>
          <legend>
            <span className="num">2</span> What you do
          </legend>
          <label className="fld">
            <span className="lab">Occupation<span className="req">*</span></span>
            <input type="text" className={errors.occupation ? "bad" : ""} value={f.occupation} onChange={set("occupation")} placeholder="e.g. Student, Designer, Founder" />
            {errors.occupation && <span className="err">Please tell us your occupation.</span>}
          </label>

          <div style={{ marginTop: 14 }}>
            <span className="lab">Current status<span className="req">*</span></span>
            <div className="chips">
              {["Student", "Employed", "Self-employed", "Unemployed"].map((s) => (
                <label className="chip" key={s}>
                  <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
            {errors.status && <span className="err">Please choose one.</span>}

            {status === "Student" && (
              <div className="reveal">
                <label className="fld">
                  <span className="lab">Institution</span>
                  <input type="text" value={f.institution} onChange={set("institution")} placeholder="e.g. Durban University of Technology" />
                </label>
              </div>
            )}
          </div>
        </fieldset>

        {/* 3 · business */}
        <fieldset>
          <legend>
            <span className="num">3</span> Your business
          </legend>
          <span className="lab">Do you have a business?<span className="req">*</span></span>
          <div className="chips">
            {["Yes", "No"].map((v) => (
              <label className="chip" key={v}>
                <input type="radio" name="hasBusiness" checked={hasBusiness === v} onChange={() => setHasBusiness(v)} />
                <span>{v}</span>
              </label>
            ))}
          </div>
          {errors.hasBusiness && <span className="err">Please choose one.</span>}

          {hasBusiness === "Yes" && (
            <div className="reveal">
              <div className="grid">
                <label className="fld full">
                  <span className="lab">Business name</span>
                  <input type="text" value={f.businessName} onChange={set("businessName")} />
                </label>
                <label className="fld">
                  <span className="lab">Industry / sector</span>
                  <input type="text" value={f.sector} onChange={set("sector")} placeholder="e.g. Retail, Tech, Beauty" />
                </label>
                <label className="fld">
                  <span className="lab">Stage</span>
                  <select value={f.stage} onChange={set("stage")}>
                    <option value="">Select…</option>
                    <option>Just an idea</option>
                    <option>Starting up</option>
                    <option>Trading / operating</option>
                    <option>Established</option>
                  </select>
                </label>
                <label className="fld full">
                  <span className="lab">What does your business do? <span className="hint">(one line)</span></span>
                  <input type="text" value={f.businessDesc} onChange={set("businessDesc")} placeholder="Briefly describe your product or service" />
                </label>
              </div>

              <div style={{ marginTop: 16 }}>
                <span className="lab">Does your business have a website?<span className="req">*</span></span>
                <div className="chips">
                  {["Yes", "No"].map((v) => (
                    <label className="chip" key={v}>
                      <input type="radio" name="hasWebsite" checked={hasWebsite === v} onChange={() => setHasWebsite(v)} />
                      <span>{v}</span>
                    </label>
                  ))}
                </div>
                {errors.hasWebsite && <span className="err">Please choose one.</span>}

                {hasWebsite === "Yes" && (
                  <div className="reveal">
                    <label className="fld">
                      <span className="lab">Website domain</span>
                      <input type="text" value={f.domain} onChange={set("domain")} placeholder="e.g. mybusiness.co.za" />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </fieldset>

        {/* 4 · social media (ticks only) */}
        <fieldset>
          <legend>
            <span className="num">4</span> Social media
          </legend>
          <span className="lab">Tick the platforms you use <span className="hint">(optional)</span></span>
          <div className="socials">
            {SOCIAL_PLATFORMS.map((p) => (
              <label className="chip" key={p}>
                <input type="checkbox" checked={socials.includes(p)} onChange={() => toggleSocial(p)} />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* 5 · last things */}
        <fieldset>
          <legend>
            <span className="num">5</span> A few last things
          </legend>
          <div className="grid">
            <label className="fld">
              <span className="lab">How did you hear about us?<span className="req">*</span></span>
              <select className={errors.referral ? "bad" : ""} value={f.referral} onChange={set("referral")}>
                <option value="">Select…</option>
                <option>Social media</option>
                <option>WhatsApp</option>
                <option>A friend / word of mouth</option>
                <option>University / DUT</option>
                <option>A partner organisation</option>
                <option>Other</option>
              </select>
              {errors.referral && <span className="err">Please let us know how you heard about us.</span>}
            </label>
            <label className="fld full">
              <span className="lab">What do you hope to get out of the day? <span className="hint">(optional)</span></span>
              <textarea value={f.goals} onChange={set("goals")} placeholder="Optional — helps us shape the sessions" />
            </label>
          </div>
        </fieldset>

        {/* consent */}
        <fieldset>
          <div className="consent">
            <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <label htmlFor="consent">
              <b>I agree</b> to the organisers collecting and processing the information above to manage my registration
              and communicate about this event, in line with the Protection of Personal Information Act (POPIA).
              <span className="req" style={{ color: "var(--gold)" }}>*</span>
            </label>
          </div>
          {errors.consent && <span className="err" style={{ marginLeft: 2 }}>Please tick to continue.</span>}

          <div className="consent" style={{ marginTop: 10, background: "#fff", borderStyle: "dashed" }}>
            <input type="checkbox" id="optin" checked={optin} onChange={(e) => setOptin(e.target.checked)} />
            <label htmlFor="optin">Keep me updated about future events via SMS and email. (Optional)</label>
          </div>
        </fieldset>

        {submitError && <p className="form-error">{submitError}</p>}

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              "Reserving…"
            ) : (
              <>
                Reserve my seat
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h13M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
          <span className="form-note">You&apos;ll get a confirmation reference on the next screen.</span>
        </div>
      </form>
    </div>
  );
}
