import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy",
  description: "GoalEdge Privacy Policy - How we protect and use your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-slate-600">
          <p className="text-sm">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-lg font-semibold text-slate-900">Information We Collect</h2>
          <p className="text-sm">
            We collect your email, name, and payment information solely to provide our prediction service and manage your subscription. We do not sell or share your data with third parties.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">How We Use Your Data</h2>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>To authenticate your account and manage your subscription status</li>
            <li>To send you service-related updates and important notices</li>
            <li>To improve our prediction models and user experience</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-900">Data Security</h2>
          <p className="text-sm">
            All passwords are hashed using bcrypt. Payment transactions are processed securely via Paystack. We use industry-standard encryption for data in transit and at rest.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">Your Rights</h2>
          <p className="text-sm">
            You may request deletion of your account and associated data at any time by contacting us. We retain data only as long as necessary to provide our services.
          </p>
        </div>
      </div>
    </div>
  );
}
