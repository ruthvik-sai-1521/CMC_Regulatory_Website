import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <span className="font-display text-lg font-semibold">Rauzr Technologies Pvt Ltd</span>
          <p className="mt-3 max-w-xs text-sm text-slate">
            Structured extraction and automated GxP rule audits for CMC regulatory dossiers.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-ink">Product</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate">
            <li>
              <Link to="/product" className="hover:text-ink">
                How it works
              </Link>
            </li>
            <li>
              <Link to="/book-demo" className="hover:text-ink">
                Book a demo
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-ink">Resources</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate">
            <li>
              <Link to="/resources" className="hover:text-ink">
                Guides &amp; updates
              </Link>
            </li>
            <li>
              <Link to="/company" className="hover:text-ink">
                Company
              </Link>
            </li>
            <li>
              <Link to="/security" className="hover:text-ink">
                Security
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-ink">Account</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate">
            <li>
              <Link to="/login" className="hover:text-ink">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-ink">
                Create account
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-6">
        <p className="container-page text-xs text-slate">
          © {new Date().getFullYear()} Rauzr Technologies Pvt Ltd. Reference build for demonstration purposes only —
          not validated for real regulatory submissions.
        </p>
      </div>
    </footer>
  );
}
