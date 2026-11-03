import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Scale,
  Lock,
  Users,
  Car,
  ArrowLeft,
  Info,
  Gavel,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type SectionFilter = 'all' | 'notice' | 'role-dos' | 'terms' | 'privacy' | 'responsibilities' | 'clauses';

export const TermsAndConditionsPage: React.FC = () => {
  const { navigate } = useApp();
  const [activeSection, setActiveSection] = useState<SectionFilter>('all');

  const sectionTabs: { id: SectionFilter; label: string }[] = [
    { id: 'all', label: 'All Sections' },
    { id: 'notice', label: 'Important Notice (1–5)' },
    { id: 'role-dos', label: "Platform Role & Do's/Don'ts" },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'privacy', label: 'Privacy & Document Policy' },
    { id: 'responsibilities', label: 'Roles & Responsibilities' },
    { id: 'clauses', label: 'Legal Clauses & Jurisdiction' },
  ];

  const showSection = (id: SectionFilter) => activeSection === 'all' || activeSection === id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Navigation & Header */}
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
            onClick={() => navigate('/privacy-policy')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#77101F] bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-[#77101F]" />
            <span>View Dedicated Privacy Policy Page</span>
          </button>
        </div>

        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#77101F]/10 flex items-center justify-center text-[#77101F] shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Onroadpriz – Terms, Guidelines &amp; Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Operated by Trussets Marketing And Construction Entreprises (TMCE) · Applicable Across Web &amp; Mobile Platforms
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Language & Acceptance Banner */}
      <div className="bg-amber-50 border-l-4 border-[#77101F] rounded-r-2xl p-5 sm:p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-[#77101F] font-black text-sm uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Please Read Carefully Before Proceeding</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
          If you&apos;re not comfortable with English, please seek help from friends or family before proceeding. By listing your vehicle or purchasing contact details, you confirm that you have read, understood, and accepted Onroadpriz’s Terms, Guidelines, and Privacy Policy. Onroadpriz is not responsible if you proceed without understanding the information provided.
        </p>
      </div>

      {/* Section Filter Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSection === tab.id
                ? 'bg-[#77101F] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================
          SECTION 1: IMPORTANT NOTICE (1 - 5)
      ========================================================= */}
      {showSection('notice') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#77101F] shrink-0" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
              Important Notice
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 leading-relaxed">
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#77101F] text-white text-xs font-black flex items-center justify-center shrink-0">1</span>
                <span>Vehicle Image Policy</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 pl-8">
                Vehicle images must not contain text, descriptions, mobile numbers, or any information other than the vehicle image itself. Violations will result in listing deletion without a refund, as per the OnRoadPriz Business Policy.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#77101F] text-white text-xs font-black flex items-center justify-center shrink-0">2</span>
                <span>Platform Purpose</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 pl-8">
                OnRoadPriz connects vehicle owners directly with buyers, eliminating brokers, agents, and middlemen. Buyers can view ownership-related information, RC, contact details, insurance, and other relevant documents, subject to the applicable verification indicators displayed on the platform.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#77101F] text-white text-xs font-black flex items-center justify-center shrink-0">3</span>
                <span>Non-Refund Policy</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 pl-8">
                OnRoadPriz follows a non-refund policy. Genuine platform-related issues may be reviewed on a case-by-case basis for an appropriate resolution.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#77101F] text-white text-xs font-black flex items-center justify-center shrink-0">4</span>
                <span>Reporting Brokers and Misrepresentation</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 pl-8">
                OnRoadPriz prohibits brokers, agents, and middlemen, whether individuals or entities. Agents/brokers may misrepresenting themselves as vehicle owners, their relatives, authorised representatives, or genuine buyers may be reported through the platform&apos;s Report option. OnRoadPriz reserves the right to block accounts found violating its policies, we cannot identify them until the genuine user report. The paid-access model is intended to discourage non-genuine participation and promote direct owner-to-buyer connections.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#77101F] text-white text-xs font-black flex items-center justify-center shrink-0">5</span>
                <span>Buyer Engagement and Listing Promotion</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 pl-8">
                Buyer engagement depends on the uploaded data such as quality of vehicle images, vehicle-related documents (visible after plan purchase), and the owner&apos;s timely responsiveness. OnRoadPriz does not mediate or provide personal assistance for individual listings. OnRoadPriz may use ownership-verified listings that meet the above criteria for marketing and promotional purposes.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 2: PLATFORM ROLE, DO'S & DON'TS, AUTHORIZED LISTINGS
      ========================================================= */}
      {showSection('role-dos') && (
        <div className="space-y-6">
          {/* Platform Role */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#77101F] shrink-0" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                Platform Role
              </h2>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
                <span>Onroadpriz is only a vehicle listing and connecting platform.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
                <span>We act solely on the information and documents submitted by vehicle owners/listers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
                <span>We do not guarantee sale, purchase, price, or returns.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
                <span>Once a buyer purchases access to the owner’s contact details, Onroadpriz’s role ends.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
                <span>Any discussions, negotiations, test drives, token amounts, or final transactions are solely between the vehicle owner and buyer.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
                <span>
                  Onroadpriz owned by <strong>Trussets Marketing And Construction Entreprises (TMCE)</strong> is an online marketplace and intermediary as defined under the Information Technology Act, 2000. Onroadpriz and TMCE do not control or participate in negotiations, pricing, or transactions and shall not be held liable for disputes, fraud, or misrepresentations.
                </span>
              </li>
            </ul>
          </section>

          {/* Do's & Don'ts for Owners and Buyers */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-[#77101F] shrink-0" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                Do’s &amp; Don’t for Owners and Buyers
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dos */}
              <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-5 space-y-4">
                <h3 className="text-sm font-black text-emerald-900 flex items-center gap-2 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Dos</span>
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Owners must provide accurate vehicle details and genuine documents.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>To eliminate duplications and fraudulent postings, only the property owner, their parents, spouse, or their children are authorized to list the vehicles for sale.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Owners must agree that once a buyer purchases the Owner’s Access, their contact details and vehicle-related documents will be shared.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Buyers should conduct their own due diligence (inspection, RTO checks, insurance verification, hypothecation status, accident history, etc.) before making the payments for sale.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Both parties should use the platform for genuine and lawful purposes only.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Buyers and sellers are advised to act with caution and complete knowledge at every stage of the process.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Owner</strong> – By clicking “I Agree”, the vehicle owner grants permission for the buyer to access their contact details, RC book, and insurance information. These details will be visible in the buyer’s dashboard only after the buyer purchases the owner details. No access is provided to any user who has not purchased the owner’s access.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Don'ts */}
              <div className="rounded-2xl bg-rose-50/60 border border-rose-200 p-5 space-y-4">
                <h3 className="text-sm font-black text-rose-900 flex items-center gap-2 uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>Don’ts</span>
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Do not list vehicles you do not own or are unauthorized to sell.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Do not provide false, incomplete, or misleading details.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Do not misuse contact information obtained from Onroadpriz and Owners. It will result in suspension of account and may attract legal consequences under applicable law.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Do not expect Onroadpriz to mediate disputes, recover money/documents, or guarantee deals.</span>
                  </li>
                </ul>

                {/* Authorized Listings Box inside right column */}
                <div className="mt-6 pt-5 border-t border-rose-200/80 space-y-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#77101F]" />
                    <span>Authorized Listings</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
                      <span>To eliminate duplications and fraudulent postings, only the vehicle owner, their parents, spouse, or their children are authorized to list their vehicle on Onroadpriz.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
                      <span>Dealers, brokers, and agents are strictly not permitted to list vehicles on this platform, unless they are bought and proof of ownership is submitted.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#77101F] mt-2 shrink-0" />
                      <span>Any listing found to be created by an unauthorized party will be removed without notice, and no refund will be processed.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================
          SECTION 3: TERMS & CONDITIONS
      ========================================================= */}
      {showSection('terms') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#77101F] shrink-0" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display uppercase tracking-tight">
              Terms &amp; Conditions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* Refund Policy */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Refund Policy</h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>Payments made for listing or contact purchases (Owner Access) are non-refundable.</li>
              </ul>
            </div>

            {/* Contact Purchase */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Contact Purchase (Unlocking the listing owner profile)</h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>Buyers must purchase the owner’s access to view owner contact details.</li>
                <li>This ensures only genuine leads reach the owner.</li>
              </ul>
            </div>

            {/* Buyer Contact Policy */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Buyer Contact Policy</h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>If an owner does not respond to the buyer’s first call within 24 hours, the buyer must report it and wait 48 hours.</li>
                <li>If the owner still does not respond within 48 hours, the buyer will be allowed to select one alternate listing of any value, free of charge.</li>
              </ul>
            </div>

            {/* Owner Non-Response */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Owner Non-Response</h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>If an owner repeatedly fails to respond after a buyer purchases the owner&apos;s access, Onroadpriz reserves the right to remove the listing without notice.</li>
                <li>No refunds will be provided.</li>
              </ul>
            </div>

            {/* Test Drive Policy */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 md:col-span-2">
              <h3 className="font-bold text-slate-900 text-sm">Test Drive Policy</h3>
              <ul className="space-y-2 list-disc list-inside text-slate-600">
                <li>If a buyer requests a test drive, they must show the car owner their profile and unlock/contact purchase dashboard to the car owner before inspecting the vehicle.</li>
                <li>If the owner is not confident about the buyer’s driving ability, the owner may reject the test drive option on the spot.</li>
                <li>
                  In such cases, the buyer may either:
                  <ul className="pl-6 mt-1.5 space-y-1 list-[circle] text-slate-700 font-medium">
                    <li>Request the owner to drive and demonstrate the vehicle, OR</li>
                    <li>Bring a mechanic or experienced driver to assist in verification.</li>
                  </ul>
                </li>
              </ul>
            </div>

            {/* Listing Closure Policy */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Listing Closure Policy</h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>
                  Once a vehicle is sold, the owner must immediately update the platform and remove the listing. This is to avoid confusion to the buyers. If any buyer reports the vehicle is sold, the listing will be removed immediately, in such cases the owner will not be eligible for the “Earn per Buyer” amount.
                </li>
              </ul>
            </div>

            {/* Owners Offer to Buyers */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Owners Offer to Buyers</h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>The owner may reject an offer if another buyer is already in the queue or has paid the token earlier.</li>
                <li>Onroadpriz provides no refunds if a buyer delays and misses the deal.</li>
              </ul>
            </div>

            {/* Right to Remove the Listing */}
            <div className="p-5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5 md:col-span-2">
              <h3 className="font-bold text-rose-900 text-sm">Right to Remove the Listing</h3>
              <p className="text-slate-700">
                Any listing found to be fraudulent, misleading, or violating guidelines can be removed without notice and no refund is offered.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 4: PRIVACY & DOCUMENT POLICY
      ========================================================= */}
      {showSection('privacy') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between gap-2.5 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-[#77101F] shrink-0" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                Privacy &amp; Document Policy
              </h2>
            </div>
            <button
              onClick={() => navigate('/privacy-policy')}
              className="text-xs font-bold text-[#77101F] hover:underline cursor-pointer"
            >
              Open Standalone Privacy Policy →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* What We Collect? */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#77101F] shrink-0" />
                <span>What We Collect?</span>
              </h3>
              <ul className="space-y-2.5 text-slate-600 list-disc list-inside">
                <li>Genuine vehicle-related documents such as RC, insurance, and NOC’s like loan and lease clearance for buyers to verify.</li>
                <li>Basic contact details of the owner/lister for the buyers to connect for sale.</li>
                <li>Government ID proof (Aadhaar, PAN, Passport, etc.) for ownership and relationship proof is collected strictly for the Onroadpriz internal verification only to assign verification badges. If the Vehicle Owners choose to have the verification badge.</li>
              </ul>
            </div>

            {/* How Do We Use Documents? */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#77101F] shrink-0" />
                <span>How Do We Use Documents?</span>
              </h3>
              <ul className="space-y-2.5 text-slate-600 list-disc list-inside">
                <li>We collect only one property related document, and also, one KYC document to confirm ownership. If the owner himself/herself is not uploading the details, we would also require proof of a relationship between the uploader and the owner.</li>
                <li>KYC is optional and used purely for internal verification to assign a “Verified” badge to the user’s account.</li>
                <li>Property related documents are visible only to potential buyers after they unlock Owner’s Access.</li>
                <li>We do not misuse, alter, or share any documents with third parties under any circumstance.</li>
              </ul>
            </div>

            {/* Data Protection */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#77101F] shrink-0" />
                <span>Data Protection</span>
              </h3>
              <ul className="space-y-2.5 text-slate-600 list-disc list-inside">
                <li>Documents are securely stored and accessible only to authorized verification staff.</li>
                <li>Documents are never shared with third parties without the owner’s consent.</li>
                <li>User details (buyer/seller) are protected under strict privacy protocols from third parties.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 5: ROLES & RESPONSIBILITIES
      ========================================================= */}
      {showSection('responsibilities') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#77101F] shrink-0" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
              Roles &amp; Responsibilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* Onroadpriz */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-[#77101F]">
                  Onroadpriz
                </h3>
                <ul className="space-y-2 text-slate-600 list-disc list-inside">
                  <li>Provide a digital marketplace to list, browse, and connect. The platform holds no liability for lack of leads or unsuccessful deals.</li>
                  <li>Verify basic ownership documents at the time of listing approval, if provided.</li>
                  <li>Mark listings with a “Verified” badge where documents are provided.</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>Note:</strong> Verification only confirms submission of documents. It does not guarantee vehicle quality, legality, ownership, or performance.
              </div>
            </div>

            {/* Vehicle Owners */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-[#77101F] flex items-center gap-1.5">
                <Car className="w-4 h-4" />
                <span>Vehicle Owners</span>
              </h3>
              <ul className="space-y-2 text-slate-600 list-disc list-inside">
                <li>Ensure the vehicle information and documents submitted are true and valid.</li>
                <li>Upload vehicle related documents in the platform for the buyers who are purchasing or enabling packages to show interest on the vehicle.</li>
                <li>Respond promptly to buyer inquiries.</li>
                <li>Cooperate with buyers who purchase their Owner’s Access.</li>
                <li>Remove sold listings immediately to avoid penalties.</li>
              </ul>
            </div>

            {/* Buyers */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-[#77101F] flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Buyers</span>
              </h3>
              <ul className="space-y-2 text-slate-600 list-disc list-inside">
                <li>Independently verify vehicle details (RTO, insurance, accident history, and hypothecation).</li>
                <li>Exercise caution and seek mechanical, legal, or financial advice before making payments.</li>
                <li>Bear the full responsibility for inspection, document checks, and transaction safety.</li>
                <li>Report non-responsive owners within 48 hours.</li>
                <li>All buyers are advised to bring a trusted companion when meeting owners for inspections or transactions.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 6: IMPORTANT & ADDITIONAL CLAUSES + FINAL NOTES
      ========================================================= */}
      {showSection('clauses') && (
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-2.5">
              <Info className="w-5 h-5 text-[#77101F] shrink-0" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                Important &amp; Additional Clauses
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {/* Dispute Resolution */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Dispute Resolution</h3>
                <ul className="space-y-2 list-disc list-inside text-slate-600">
                  <li>
                    If an owner does not respond to a buyer within 24 hours, the buyer must report it. Onroadpriz will review the case within 72 hours and may offer an alternate contact unlock as compensation.
                  </li>
                  <li>
                    In case of disputes over inspections, both buyer and seller must provide relevant proof (chat logs, customer ID, etc.).
                  </li>
                </ul>
              </div>

              {/* Platform Disclaimer */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Platform Disclaimer</h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                  <li>Onroadpriz is a digital marketplace only.</li>
                  <li>
                    We do not:
                    <ul className="pl-6 mt-1 space-y-1 list-[circle] text-slate-700">
                      <li>Mediate disputes.</li>
                      <li>Guarantee sale price, timelines, or vehicle condition.</li>
                      <li>Act as a broker or dealer.</li>
                      <li>Mediate transactions, payments, and negotiations, which remain solely between buyer and seller.</li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* Purpose of Terms & Conditions */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 md:col-span-2">
                <h3 className="font-bold text-slate-900 text-sm">Purpose of Terms &amp; Conditions</h3>
                <p className="text-slate-600 leading-relaxed">
                  The purpose of these Terms &amp; Conditions for Onroadpriz is to safeguard the interests of the platform and the company against fraudulent activities, misuse, or attempts to exploit any process loopholes. Any deliberate acts intended to damage the company’s business, reputation, or financial interests—including but not limited to competitive manipulation, false listings, or financial exploitation—are strictly prohibited and may attract legal penalties and other actions to protect the company’s rights.
                </p>
              </div>
            </div>
          </section>

          {/* Final Notes & Transaction Guidelines */}
          <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-5">
            <div className="border-b border-slate-800 pb-4 flex items-center gap-2.5">
              <Gavel className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-black font-display">
                Final Notes &amp; Transaction Guidelines
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Onroadpriz is a digital marketplace only. The platform is not responsible for any disputes, recovery of token money, or legal/financial losses arising from interactions between buyers and sellers. All legal and financial obligations lie solely between the buyer and the vehicle owner.
            </p>

            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-3">
              <p className="text-xs sm:text-sm font-bold text-white">
                Onroadpriz is not involved in, nor responsible for, any part of the transaction, including but not limited to:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Negotiations or price agreements</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Signing of sale deeds or agreements</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Token advance handling</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Delivery of possession</span>
                </li>
                <li className="flex items-center gap-2 sm:col-span-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>RTO transfer or related formalities</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#77101F]/30 border border-[#77101F] text-xs sm:text-sm text-amber-100 leading-relaxed">
              The entire Terms &amp; Conditions are applicable for legal actions under relevant IPC sections. All disputes arising out of the use of Onroadpriz shall be subject to the exclusive jurisdiction of the courts in <strong>Hyderabad, Telangana</strong>.
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
