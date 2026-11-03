import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { 
  ShieldCheck, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  Clock, 
  CheckCircle2, 
  FileCheck,
  AlertTriangle,
  Building2,
  Lock
} from 'lucide-react';

export const AboutContactPage: React.FC = () => {
  const { settings, submitContact, currentUser } = useApp();

  const [name, setName] = useState(currentUser?.name || currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || currentUser?.mobile || '');
  const [subject, setSubject] = useState('Vehicle Inspection Assistance');
  const [message, setMessage] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact({
      name: name.trim(),
      email: email.trim() || 'Not provided',
      phone: phone.trim(),
      subject,
      message: message.trim()
    });
    setSubmittedSuccess(true);
    setMessage('');
    setTimeout(() => setSubmittedSuccess(false), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex justify-center mb-2">
          <BrandLogo variant="website" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#77101F]/10 text-[#77101F] text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>India's Transparent Auto Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#101828] font-display tracking-tight">
          Restoring Trust in Used Vehicle Trading
        </h1>
        <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
          OnRoadPriz was created with a singular mission: eliminate dishonest middleman markups and empower vehicle owners and buyers to trade directly with verified RTO documents and open telephone access.
        </p>
      </div>

      {/* 2. THE 3 PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-[#DCE3EC] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#77101F]/10 text-[#77101F] flex items-center justify-center font-black">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#101828] font-display">0% Commission Model</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Traditional car brokers take 3-5% from the buyer and 3-5% from the seller. On OnRoadPriz, transactions happen directly between the two parties with zero transaction cuts.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#DCE3EC] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#101828] font-display">Direct Verification</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Every vehicle listing can be backed by verified Smart RC credentials, active insurance policies, and genuine odometer records to ensure 100% peace of mind.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#DCE3EC] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-black">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#101828] font-display">Heavy Machinery & Fleets</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Unlike portals that restrict themselves to city cars, OnRoadPriz supports construction JCBs, tippers, passenger buses, and commercial lorries across Indian states.
          </p>
        </div>
      </div>

      {/* 3. CONTACT FORM & OFFICE INFORMATION */}
      <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Office Contact Details (Synced with Admin Portal Settings) */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#77101F]">
                Get In Touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#101828] font-display mt-1">
                Help & Vehicle Verification
              </h2>
              <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                Need help inspecting a vehicle, transferring RC paperwork at your local RTO, or promoting your commercial fleet? Our specialists are available 6 days a week.
              </p>
            </div>

            <div className="space-y-4 text-xs text-[#101828]">
              <div className="flex items-start gap-3 p-4 bg-[#F7F9FC] rounded-2xl border border-[#DCE3EC]">
                <MapPin className="w-5 h-5 text-[#77101F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">
                    {settings?.headquartersTitle || 'Operational Center'}
                  </h4>
                  <p className="text-[#667085] mt-0.5 whitespace-pre-line">
                    {settings?.headquartersAddress || 'OnRoadPriz Towers, VIP Road, Siripuram, Visakhapatnam, AP 530003'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#F7F9FC] rounded-2xl border border-[#DCE3EC]">
                <Phone className="w-5 h-5 text-[#77101F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Direct Owner Support Helpline</h4>
                  <p className="text-[#667085] mt-0.5 font-mono">
                    {settings?.supportPhone || '+91 891 278 4590'}
                  </p>
                  <p className="text-[11px] text-[#98A2B3]">
                    {settings?.supportHours || 'Monday – Saturday, 9:00 AM – 8:00 PM IST'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#F7F9FC] rounded-2xl border border-[#DCE3EC]">
                <Mail className="w-5 h-5 text-[#77101F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Email Correspondence</h4>
                  <p className="text-[#667085] mt-0.5 font-mono break-all">
                    {settings?.supportEmail || 'support@onroadpriz.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support Form */}
          <div className="bg-[#F7F9FC] rounded-2xl border border-[#DCE3EC] p-6 sm:p-8 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#101828] font-display">Send Inquiry to Specialist</h3>
              <p className="text-xs text-[#667085]">Receive rapid callback from our verified desk.</p>
            </div>

            {submittedSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Inquiry Sent Successfully!</span>
                  <span>Your message has been logged in our support desk and an automotive specialist will reach out shortly.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101828] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Varma"
                  className="w-full p-3 bg-white border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#101828] mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full p-3 bg-white border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#101828] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full p-3 bg-white border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#101828] mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-3 bg-white border border-[#DCE3EC] rounded-xl text-[#101828] font-semibold focus:outline-hidden focus:border-[#77101F]"
                >
                  <option value="Vehicle Inspection Assistance">Vehicle Inspection Assistance</option>
                  <option value="RC Transfer Paperwork Guidance">RC Transfer Paperwork Guidance</option>
                  <option value="Seller Premium Plan Upgrade">Seller Premium Plan Upgrade</option>
                  <option value="Report an Unverified Seller">Report an Unverified Seller</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#101828] mb-1">Message *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="How can our automotive advisors assist you today?"
                  className="w-full p-3 bg-white border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
