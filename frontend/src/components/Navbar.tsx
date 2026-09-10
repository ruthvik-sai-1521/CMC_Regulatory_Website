import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/product", label: "Product", icon: "grid" },
  { to: "/resources", label: "Resources", icon: "book" },
  { to: "/company", label: "Company", icon: "spark" },
  { to: "/security", label: "Security", icon: "shield" },
];

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    book: "M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5zM5 4.5v17M8 6h8",
    spark: "m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z",
    shield: "M12 3 20 6v5c0 5-3.4 8.1-8 10-4.6-1.9-8-5-8-10V6zM8.5 12l2.2 2.2 4.8-5",
  };
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-paper/10 bg-ink/95 text-paper shadow-lg shadow-ink/10 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink text-paper">
            <svg viewBox="0 0 32 32" className="h-4 w-4" aria-hidden="true">
              <path
                d="M9 16.5 14 21.5 23 10.5"
                stroke="#2E8C7D"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="max-w-[13rem] font-display text-base font-semibold leading-tight tracking-tight sm:max-w-none sm:whitespace-nowrap sm:text-lg">Rauzr Technologies Pvt Ltd</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `group relative flex items-center gap-2 py-6 text-sm text-paper/60 transition-colors hover:text-paper ${isActive ? "active text-paper" : ""}`
              }
            >
              <NavIcon name={l.icon} />
              {l.label}
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-teal-light transition-transform duration-300 group-hover:scale-x-100 group-[.active]:scale-x-100" />
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
                <Link to="/workspace" className="inline-flex items-center gap-2 text-sm text-paper/60 hover:text-paper">
                  <NavIcon name="grid" />
                Workspace
              </Link>
              <button onClick={logout} className="inline-flex items-center gap-2 rounded-sm border border-paper/20 px-4 py-2 text-sm text-paper/70 transition-colors hover:border-teal-light hover:text-paper">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></svg>
                Sign out
              </button>
            </>
          ) : (
              <Link to="/login" className="text-sm text-paper/60 hover:text-paper">
              Login
            </Link>
          )}
          <Link to="/book-demo" className="btn-primary whitespace-nowrap py-2">
            Book a demo
          </Link>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-paper/20 text-paper md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle menu</span>
          <span className={`relative h-4 w-4 ${open ? "" : ""}`} aria-hidden="true"><span className={`absolute left-0 top-1 h-px w-4 bg-current transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`} /><span className={`absolute left-0 top-3 h-px w-4 bg-current transition-transform ${open ? "-translate-y-0.5 -rotate-45" : ""}`} /></span>
        </button>
      </div>

      {open && (
        <div className="border-t border-paper/10 bg-ink md:hidden">
          <div className="container-page flex flex-col gap-4 py-5">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-paper/80">
                <NavIcon name={l.icon} />
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to="/workspace" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-paper/80">
                  <NavIcon name="grid" />
                  Workspace
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="btn-secondary border-paper/20 text-paper hover:border-teal-light hover:text-paper"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-paper/80">
                Login
              </Link>
            )}
            <Link to="/book-demo" onClick={() => setOpen(false)} className="btn-primary">
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
