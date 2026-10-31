import Link from "next/link";
import LogoSlot from "@/components/ui/LogoSlot";

const COLUMNS = [
  {
    title: "Federation",
    links: [
      ["/#about", "About U.S.S.M.F."],
      ["/#mission", "Mission"],
      ["/#timeline", "Timeline"],
      ["/#impact", "Impact"],
    ],
  },
  {
    title: "Services",
    links: [
      ["/#services", "Sports medicine"],
      ["/#services", "Injury prevention"],
      ["/#services", "Rehabilitation"],
      ["/#related", "Insurance"],
    ],
  },
  {
    title: "Certification",
    links: [
      ["/apply", "Apply"],
      ["/#status", "Track application"],
      ["/verify", "Verify certificate"],
      ["/#disciplines", "Disciplines"],
    ],
  },
  {
    title: "Connect",
    links: [
      ["/#founder", "Our founder"],
      ["/#allied", "Allied federations"],
      ["/#integrity", "Our stand"],
      ["/#join", "Join the movement"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="f-clouds" aria-hidden="true">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path
            fill="#F5F9FF"
            d="M0 0h1440v20c-40 0-60 30-110 30s-70-34-120-34-60 40-120 40-80-30-130-30-70 36-130 36-70-40-130-40-60 30-120 30-80-26-130-26-60 34-120 34-70-30-120-30S110 40 60 40 0 20 0 20z"
          />
        </svg>
      </div>
      <div className="wrap">
        <div className="f-grid">
          <div className="f-brand">
            <span className="brand">
              <LogoSlot />
              <span>
                U.S.S.M.F.<small>Sports Medicine Federation</small>
              </span>
            </span>
            <p>Advancing athlete health through science, innovation and excellence. Launching Phase IV.</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(([href, label]) => (
                  <li key={label}>
                    {href.startsWith("/#") ? <a href={href}>{label}</a> : <Link href={href}>{label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="f-bottom">
          <span>
            © {new Date().getFullYear()} United States Sports Medicine Federation. All rights reserved.
          </span>
          <span>Designed &amp; developed by Vivek Chaudhary</span>
        </div>
      </div>
    </footer>
  );
}
