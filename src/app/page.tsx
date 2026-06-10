import RegistrationForm from "@/components/RegistrationForm";

export default function HomePage() {
  return (
    <>
      <div className="flag-stripe">
        <i className="s1" />
        <i className="s2" />
        <i className="s3" />
        <i className="s4" />
      </div>

      <header className="hero">
        <div className="wrap">
          <p className="eyebrow">Durban, South Africa · Registration</p>
          <h1>
            <span className="accent">Youth</span> Digital Empowerment &amp;{" "}
            Entrepreneurship <span className="accent-g">Master Class</span>
          </h1>
          <p className="tag">Empower. Equip. Connect. Succeed.</p>

          <div className="facts">
            <div className="fact">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
                  <path d="M3 9h18M8 2.5v4M16 2.5v4" />
                </svg>
              </span>
              <b>11 June 2026</b>
            </div>
            <div className="fact">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5V12l3 2" />
                </svg>
              </span>
              09:00 – 15:30
            </div>
            <div className="fact">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              Moses Kotane Research Institute, Durban
            </div>
          </div>

          <div className="partners">
            <span className="partners-label">In partnership with</span>
            <p className="partners-names">
              Moses Kotane Research Institute · Play Your Part · eThekwini
              Municipality · Brand South Africa · Wear Your Brand
            </p>
          </div>
        </div>
      </header>

      <main className="sheet">
        <RegistrationForm />
      </main>

      <p className="foot">
        Youth Digital Empowerment &amp; Entrepreneurship Master Class · Built by
        Lubelo Tech Solutions
      </p>
    </>
  );
}
