import React from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Scale,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#77101F] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </button>

          <button
            onClick={() => navigate('/terms')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#77101F] bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-[#77101F]" />
            <span>View Full Terms &amp; Guidelines</span>
          </button>
        </div>

        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#77101F]/10 flex items-center justify-center text-[#77101F] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Privacy &amp; Document Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Operated by Trussets Marketing And Construction Entreprises (TMCE) · Platform: OnRoadPriz (Web &amp; Android)
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Language & Acceptance Notice */}
      <div className="bg-amber-50 border-l-4 border-[#77101F] rounded-r-2xl p-5 sm:p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-[#77101F] font-black text-sm uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Important Notice</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
          If you&apos;re not comfortable with English, please seek help from friends or family before proceeding. By listing your vehicle or purchasing contact details, you confirm that you have read, understood, and accepted Onroadpriz’s Terms, Guidelines, and Privacy Policy. Onroadpriz is not responsible if you proceed without understanding the information provided.
        </p>
      </div>

      {/* Main Privacy & Document Policy Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 text-slate-700 text-sm leading-relaxed shadow-xs">
        {/* 1. What We Collect? */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-display">
            <FileText className="w-5 h-5 text-[#77101F]" />
            <span>1. What We Collect?</span>
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
              <span>
                Genuine vehicle-related documents such as RC, insurance, and NOC’s like loan and lease clearance for buyers to verify.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
              <span>
                Basic contact details of the owner/lister for the buyers to connect for sale.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
              <span>
                Government ID proof (Aadhaar, PAN, Passport, etc.) for ownership and relationship proof is collected strictly for the Onroadpriz internal verification only to assign verification badges. If the Vehicle Owners choose to have the verification badge.
              </span>
            </li>
          </ul>
        </section>

        {/* 2. How Do We Use Documents? */}
        <section className="space-y-3 pt-6 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-display">
            <BookOpen className="w-5 h-5 text-[#77101F]" />
            <span>2. How Do We Use Documents?</span>
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pl-1">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
              <span>
                We collect only one property related document, and also, one KYC document to confirm ownership. If the owner himself/herself is not uploading the details, we would also require proof of a relationship between the uploader and the owner.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
              <span>
                KYC is optional and used purely for internal verification to assign a “Verified” badge to the user’s account.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
              <span>
                Property related documents are visible only to potential buyers after they unlock Owner’s Access.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
              <span>
                We do not misuse, alter, or share any documents with third parties under any circumstance.
              </span>
            </li>
          </ul>
        </section>

        {/* 3. Data Protection & Owner Consent */}
        <section className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-display">
            <Lock className="w-5 h-5 text-[#77101F]" />
            <span>3. Data Protection &amp; Owner Consent</span>
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pl-1">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Documents are securely stored and accessible only to authorized verification staff.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Documents are never shared with third parties without the owner’s consent.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                User details (buyer/seller) are protected under strict privacy protocols from third parties.
              </span>
            </li>
          </ul>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#77101F]" />
              <span>Owner Consent Clause (“I Agree”)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              By clicking “I Agree”, the vehicle owner grants permission for the buyer to access their contact details, RC book, and insurance information. These details will be visible in the buyer’s dashboard only after the buyer purchases the owner details. No access is provided to any user who has not purchased the owner’s access.
            </p>
          </div>
        </section>

        {/* 4. Mobile App & Platform Technical Privacy Disclosures */}
        <section className="space-y-3 pt-6 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-display">
            <ShieldCheck className="w-5 h-5 text-[#77101F]" />
            <span>4. Technical &amp; Application Data Disclosures</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            OnRoadPriz operates the <strong>OnRoadPriz Used Vehicle Marketplace</strong> website (<a href="https://onroadpriz.com" className="text-[#77101F] underline">https://onroadpriz.com</a>) and the <strong>OnRoadPriz Android Application</strong> (Package ID: <code>in.brandorigin.onroadpriz</code>), owned by <strong>Trussets Marketing And Construction Entreprises (TMCE)</strong> as an intermediary under the Information Technology Act, 2000.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs">Mobile Number &amp; OTP Verification</h3>
              <p className="text-xs text-slate-600">
                Collected for user authentication, OTP verification, and direct buyer-to-seller marketplace connection. Mobile numbers are stored in our secure database with a strict uniqueness constraint.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs">Precise &amp; Coarse Location</h3>
              <p className="text-xs text-slate-600">
                Requested on-demand with explicit device permission to show nearby vehicle listings and provide accurate local pricing. Never tracked continuously in the background.
              </p>
            </div>
          </div>
        </section>

        {/* 5. User Rights & Account Deletion */}
        <section className="space-y-3 pt-6 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-display">
            <AlertTriangle className="w-5 h-5 text-[#77101F]" />
            <span>5. User Rights, Account Deletion &amp; Jurisdiction</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            You have the right to access, correct, export, or delete your account and personal data at any time. You can initiate an account deletion request directly in the Android app under <strong>Profile &gt; Security &gt; Delete Account</strong>, or submit a request on our web portal at{' '}
            <button onClick={() => navigate('/account-deletion')} className="text-[#77101F] font-bold underline cursor-pointer">
              onroadpriz.com/account-deletion
            </button>.
          </p>
          <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            The entire Terms &amp; Conditions and Privacy Policy are applicable for legal actions under relevant IPC sections. All disputes arising out of the use of Onroadpriz shall be subject to the exclusive jurisdiction of the courts in <strong>Hyderabad, Telangana</strong>.
          </p>
        </section>

        {/* 6. Contact Information */}
        <section className="space-y-3 pt-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">6. Contact &amp; Grievance Information</h2>
          <p className="text-xs text-slate-600">
            For privacy queries, document verification inquiries, data requests, or grievances:
          </p>
          <div className="text-xs font-medium text-slate-800 space-y-1">
            <p>Entity: <strong>Trussets Marketing And Construction Entreprises (TMCE)</strong></p>
            <p>Email: <a href="mailto:support@onroadpriz.com" className="text-[#77101F] underline">support@onroadpriz.com</a></p>
            <p>Jurisdiction: Hyderabad, Telangana, India</p>
            <p>Published by BrandOrigin (<a href="https://brandorigin.in" target="_blank" rel="noopener noreferrer" className="text-[#77101F] underline">https://brandorigin.in</a>).</p>
          </div>
        </section>
      </div>
    </div>
  );
};
