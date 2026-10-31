"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { cx } from "@/lib/format";
import useAuth from "@/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";
import LogoSlot from "@/components/ui/LogoSlot";
import MobileNav from "./MobileNav";

const SECTIONS = [
  ["about", "About"],
  ["services", "Services"],
  ["certification", "Certification"],
  ["founder", "Founder"],
  ["mission", "Mission"],
  ["allied", "Allied"],
  ["contact", "Contact"],
];

const MOBILE_LINKS = [
  ["about", "About"],
  ["services", "Services"],
  ["certification", "Certification"],
  ["verify", "Verify a Certificate"],
  ["founder", "Founder"],
  ["mission", "Mission"],
  ["allied", "Allied"],
  ["contact", "Contact"],
];

/** Floating clay nav: shrinks on scroll, highlights the section in view, full-screen menu on mobile. */
export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { user, loading } = useAuth();
  const [shrink, setShrink] = useState(false);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShrink(window.scrollY > 30);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [isHome]);

  const href = (id) => (isHome ? `#${id}` : `/#${id}`);
  const staff = user && (user.role === "physician" || user.role === "admin");
  const account = loading
    ? null
    : user
      ? {
          href: staff ? "/admin" : "/dashboard",
          label: staff ? "Portal" : "Dashboard",
          icon: staff ? "steth" : "user",
        }
      : { href: "/login", label: "Sign in", icon: "user" };

  return (
    <>
      <header className={cx("site-header", shrink && "shrink")} id="header">
        <div className="wrap">
          <nav className="nav glass" aria-label="Main">
            <Link className="brand" href={isHome ? "#hero" : "/"} aria-label="U.S.S.M.F. home">
              <LogoSlot priority />
              <span>
                U.S.S.M.F.<small>Sports Medicine Federation</small>
              </span>
            </Link>
            <ul className="nav-links">
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={href(id)} className={isHome && active === id ? "active" : undefined}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="nav-cta">
              <a className="verify" href={href("verify")}>
                Verify
              </a>
              {account ? (
                <Link className="verify" href={account.href}>
                  {account.label}
                </Link>
              ) : null}
              <Link className="btn btn-primary btn-sm" href="/apply">
                Apply Now
              </Link>
              <button
                className="burger"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mnav"
                onClick={() => setMenuOpen(true)}
              >
                <Icon name="menu" />
              </button>
            </div>
          </nav>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen ? (
          <MobileNav
            links={MOBILE_LINKS.map(([id, label]) => ({ href: href(id), label }))}
            account={account}
            onClose={() => setMenuOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
