import Link from "next/link";
import { Cookie, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cookie Policy",
  description: "GoalEdge Cookie Policy - How we use cookies to enhance your experience.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <Cookie className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-900">Cookie Policy</h1>
        </div>

        <div className="space-y-6 text-slate-600">
          <p className="text-sm">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-lg font-semibold text-slate-900">What Are Cookies?</h2>
          <p className="text-sm">
            Cookies are small text files stored on your device to help websites function properly and provide a better experience.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">Cookies We Use</h2>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li><strong>Essential:</strong> Authentication tokens to keep you signed in securely</li>
            <li><strong>Performance:</strong> Analytics to understand how our platform is used and improve speed</li>
            <li><strong>Preferences:</strong> Theme and language settings stored locally</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-900">Managing Cookies</h2>
          <p className="text-sm">
            You may disable cookies through your browser settings. Note that disabling essential cookies may affect login and subscription features.
          </p>
        </div>
      </div>
    </div>
  );
}
