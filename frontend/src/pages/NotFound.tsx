import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="text-sm text-teal-dark">404</p>
      <h1 className="mt-2 text-3xl font-medium">This page doesn't exist.</h1>
      <Link to="/" className="mt-6 text-sm text-teal-dark hover:underline">
        Back to home →
      </Link>
    </div>
  );
}
