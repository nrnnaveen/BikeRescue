import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Wrench,
  MapPin,
  Clock,
  ShieldCheck,
  PhoneCall,
  Navigation,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Bike,
  Building2,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const problems = [
    { title: 'Tyre Puncture', icon: '⭕' },
    { title: 'Dead Battery', icon: '🔋' },
    { title: 'Engine Trouble', icon: '⚙️' },
    { title: 'Brake Failure', icon: '🛑' },
    { title: 'Chain Off/Snapped', icon: '🔗' },
    { title: 'Out of Fuel', icon: '⛽' },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-slate-50 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Quick Emergency Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-brand-800 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>24/7 Roadside Assistance Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Help when your bike <br className="hidden sm:inline" />
              <span className="text-brand-600">needs it most.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Stuck with a puncture, dead battery, or broken chain? BikeRescue
              instantly connects you with verified nearby mechanics using live GPS
              location. Get fast on-the-spot repair with zero hassle.
            </p>

            {/* Main Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <Link
                href="/user/request"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all transform hover:-translate-y-0.5"
              >
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                <span>Get Help Now</span>
              </Link>

              <Link
                href="/shop-register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base px-6 py-3.5 rounded-2xl border border-slate-300 shadow-sm transition-all"
              >
                <Building2 className="w-5 h-5 text-slate-600" />
                <span>Register Your Shop</span>
              </Link>
            </div>

            {/* Quick Problems Grid */}
            <div className="mt-12 pt-8 border-t border-slate-200/80">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Instant Assistance For Common Breakdown Issues
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {problems.map((p, idx) => (
                  <Link
                    key={idx}
                    href={`/user/request?problem=${encodeURIComponent(p.title.split(' ')[0])}`}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-brand-300 hover:bg-orange-50/50 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 shadow-sm transition-all"
                  >
                    <span>{p.icon}</span>
                    <span>{p.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Seamless Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              How BikeRescue Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From roadside breakdown to back on the road in 4 straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Detect Location',
                desc: 'Hit "Use GPS" to pinpoint your exact breakdown coordinates on the interactive map.',
                icon: MapPin,
                color: 'text-blue-600 bg-blue-50 border-blue-200',
              },
              {
                step: '02',
                title: 'Select Problem',
                desc: 'Pick your bike issue (puncture, battery, engine) and submit your help request.',
                icon: AlertTriangle,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
              },
              {
                step: '03',
                title: 'Mechanic Dispatched',
                desc: 'Nearby available repair shops receive the notification and accept the job.',
                icon: Navigation,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
              },
              {
                step: '04',
                title: 'On-Site Fix & Rate',
                desc: 'The technician arrives with tools, resolves your breakdown, and gets you moving.',
                icon: CheckCircle2,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center ${item.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Riders Section */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-3 py-1 rounded-full">
                For Bike Riders & Commuters
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3 sm:text-4xl">
                Ride with confidence. <br />
                Assistance is always around the corner.
              </h2>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                Whether you are commuting to work, on a weekend road trip, or delivery riding,
                a sudden breakdown shouldn&apos;t leave you stranded on an unfamiliar highway.
              </p>

              <div className="mt-6 space-y-3.5">
                {[
                  {
                    title: 'One-Tap GPS Incident Reporting',
                    desc: 'No need to explain landmarks or street names — your coordinates are sent directly to mechanics.',
                  },
                  {
                    title: 'Live Step-by-Step Progress Timeline',
                    desc: 'Watch as the mechanic accepts, heads over, arrives at your spot, and finishes repairs.',
                  },
                  {
                    title: 'Verified Mechanics & Community Ratings',
                    desc: 'Review ratings, services, and genuine customer feedback before confirming.',
                  },
                  {
                    title: 'Direct Phone Dialing (No Intermediaries)',
                    desc: 'Speak directly with your assigned technician in real time for updates.',
                  },
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{feat.title}</h4>
                      <p className="text-xs text-slate-500">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-colors"
                >
                  <span>Create Free Rider Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">
                    Live Breakdown Demo
                  </span>
                </div>
                <span className="text-[11px] font-semibold bg-brand-100 text-brand-700 px-2.5 py-0.5 rounded-full">
                  Mechanic On The Way
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold text-lg">
                    ⭕
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Rear Tyre Puncture</h4>
                    <p className="text-[11px] text-slate-500">Yamaha MT-15 (KA-01-EQ-4050)</p>
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-emerald-800 font-bold">ABC Bike Works</p>
                    <p className="text-[10px] text-emerald-600">Technician: Ramesh Kumar • ⭐ 4.8</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800">1.8 km away</span>
                    <p className="text-[10px] text-slate-500">ETA: ~6 mins</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <div className="flex-1 text-center py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                  <span>Call Mechanic</span>
                </div>
                <div className="flex-1 text-center py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Live GPS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Mechanical Shops Section */}
      <section id="for-shops" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Shop Dashboard Preview */}
            <div className="order-2 lg:order-1 bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-bold text-white">
                    Shop Portal: FastRide Motors
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-full text-[11px] text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Accepting Requests</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-lg font-black text-brand-400">3</span>
                  <p className="text-[10px] text-slate-400">New Nearby</p>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-lg font-black text-blue-400">1</span>
                  <p className="text-[10px] text-slate-400">In Progress</p>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-lg font-black text-emerald-400">28</span>
                  <p className="text-[10px] text-slate-400">Completed</p>
                </div>
              </div>

              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      🚨 Battery Dead Breakdown
                    </span>
                    <h5 className="text-xs font-semibold text-white mt-1.5">
                      Royal Enfield Classic 350
                    </h5>
                    <p className="text-[11px] text-slate-400">2.1 km away • Indiranagar Ring Rd</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">Just now</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <div className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-1.5 text-center text-xs font-bold rounded-lg text-white cursor-pointer transition-colors">
                    Accept Request
                  </div>
                  <div className="px-3 bg-slate-700 py-1.5 text-center text-xs font-bold rounded-lg text-slate-300">
                    Decline
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                For Local Repair Shops & Technicians
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3 sm:text-4xl">
                Turn roadside distress into loyal repeat customers.
              </h2>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                Connect directly with stranded bikers in your local neighborhood.
                Receive instantaneous breakdown notifications, navigate directly to the customer,
                and expand your business without any listing fees.
              </p>

              <div className="mt-6 space-y-3.5">
                {[
                  {
                    title: 'Real-Time Local Breakdown Alerts',
                    desc: 'Get notified the moment a rider within your 5km-20km radius requests mechanical assistance.',
                  },
                  {
                    title: 'Availability Control',
                    desc: 'Toggle between Available and Offline anytime with a single click.',
                  },
                  {
                    title: 'One-Click Turn-by-Turn GPS Navigation',
                    desc: 'Open navigation to the exact coordinates of the rider using built-in Google Maps or OpenStreetMap links.',
                  },
                  {
                    title: 'Build Verified Customer Trust',
                    desc: 'Earn 5-star verified ratings and establish your workshop as the go-to emergency service.',
                  },
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{feat.title}</h4>
                      <p className="text-xs text-slate-500">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/shop-register"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-colors"
                >
                  <span>Register Mechanical Shop</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Assistance Banner */}
      <section className="py-12 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                <AlertTriangle className="w-7 h-7 text-white animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Critical Emergency / Highway Accident?</h3>
                <p className="text-xs text-red-100 mt-1 max-w-xl">
                  If there are physical injuries or immediate life threats, contact emergency police
                  and medical ambulance hotlines immediately.
                </p>
              </div>
            </div>

            <Link
              href="/emergency"
              className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-colors flex-shrink-0"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Helpline Directory</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-bold text-base">BikeRescue</span>
                <p className="text-[11px] text-slate-400">
                  Help when your bike needs it most.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <Link href="/login" className="hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Rider Signup
              </Link>
              <Link href="/shop-register" className="hover:text-white transition-colors">
                Shop Registration
              </Link>
              <Link href="/emergency" className="hover:text-red-400 transition-colors">
                Emergency SOS
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} BikeRescue Platform. Built for bike riders everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
