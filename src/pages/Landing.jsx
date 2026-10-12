import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  PieChart,
  Lightbulb,
  FileDown,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Expense Tracking',
      desc: 'Log expenses effortlessly with categories, payment methods, notes, and instant calculations in Indian Rupees (₹).'
    },
    {
      icon: PieChart,
      title: 'Monthly Budgeting',
      desc: 'Set overall and category-specific budget ceilings with visual progress indicators and multi-stage threshold warnings.'
    },
    {
      icon: Lightbulb,
      title: 'Smart Insights Engine',
      desc: 'Receive transparent, rule-based recommendations that highlight spending spikes, top expenses, and positive savings habits.'
    },
    {
      icon: FileDown,
      title: 'PDF & CSV Reports',
      desc: 'Generate executive monthly financial statements and export raw transaction logs with a single click.'
    },
    {
      icon: ShieldCheck,
      title: 'Private & Secure',
      desc: 'Built with Spring Security, BCrypt password hashing, and strict user data isolation so your financials remain private.'
    },
    {
      icon: Sparkles,
      title: 'Student-Friendly',
      desc: 'Tailored for young adults and students learning to budget, control discretionary spends, and build lifelong wealth habits.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      desc: 'Sign up in seconds with your name and email to start your personalized financial ledger.'
    },
    {
      number: '02',
      title: 'Set Monthly Budgets',
      desc: 'Define how much you intend to spend overall and across categories like Food, Travel, and Shopping.'
    },
    {
      number: '03',
      title: 'Log Daily Expenses',
      desc: 'Track transactions via UPI, Cards, or Cash as you make them throughout the month.'
    },
    {
      number: '04',
      title: 'Analyze & Save',
      desc: 'Review interactive charts, download monthly reports, and let smart insights optimize your savings.'
    }
  ];

  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      {/* Top Header */}
      <header className="border-bottom sticky-top bg-white">
        <div className="container py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="sidebar-logo-icon" style={{ width: '34px', height: '34px' }}>
              <Wallet size={20} />
            </div>
            <span className="fw-bold fs-4 text-dark">
              Smart<span style={{ color: '#10B981' }}>Spend</span>
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn btn-outline-emerald btn-sm px-3">
              Login
            </Link>
            <Link to="/register" className="btn btn-emerald btn-sm px-3">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        <div className="container py-5 text-center">
          <div 
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4"
            style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: '0.875rem', fontWeight: 600 }}
          >
            <Sparkles size={16} /> Intelligent Student & Young Adult Finance
          </div>

          <h1 className="display-4 fw-extrabold text-dark mb-4 mx-auto" style={{ maxWidth: '850px', letterSpacing: '-0.03em' }}>
            Take Control of Your Money. <br />
            <span style={{ color: '#10B981' }}>Build Better Spending Habits.</span>
          </h1>

          <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '650px', fontSize: '1.2rem' }}>
            SmartSpend combines daily expense tracking, monthly budgeting limits, interactive analytics, and rule-based insights into one clean, modern platform.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/register" className="btn btn-emerald px-4 py-3 fs-6 d-flex align-items-center gap-2">
              Start Budgeting Now <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary-custom px-4 py-3 fs-6">
              Sign In to Your Dashboard
            </Link>
          </div>

          {/* Quick value check items */}
          <div className="d-flex flex-wrap justify-content-center gap-4 mt-5 text-muted small fw-medium">
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={18} className="text-success" /> 100% Free for Students
            </div>
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={18} className="text-success" /> Genuine PDF & CSV Exports
            </div>
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={18} className="text-success" /> Real-time Budget Alerts
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h6 className="text-uppercase fw-bold text-success small" style={{ letterSpacing: '0.1em' }}>Core Capabilities</h6>
            <h2 className="fw-bold text-dark display-6">Everything You Need to Manage Your Money</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '540px' }}>
              Engineered with clean architectural principles, real Spring Boot REST APIs, and a high-aesthetic interface.
            </p>
          </div>

          <div className="row g-4">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="smart-card h-100 p-4 border transition">
                    <div 
                      className="d-inline-flex p-3 rounded-3 mb-3"
                      style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}
                    >
                      <Icon size={24} />
                    </div>
                    <h5 className="fw-bold text-dark mb-2">{f.title}</h5>
                    <p className="text-muted small mb-0 lh-base">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <h6 className="text-uppercase fw-bold text-success small" style={{ letterSpacing: '0.1em' }}>Simple Workflow</h6>
            <h2 className="fw-bold text-dark display-6">How SmartSpend Works</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
              Four simple steps to master your personal cashflow.
            </p>
          </div>

          <div className="row g-4">
            {steps.map((s, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="bg-white p-4 rounded-4 border h-100 shadow-sm position-relative">
                  <div 
                    className="fw-extrabold display-6 mb-3"
                    style={{ color: '#10B981', opacity: 0.85 }}
                  >
                    {s.number}
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{s.title}</h5>
                  <p className="text-muted small mb-0">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div 
            className="p-5 rounded-4 text-center text-white"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
          >
            <h2 className="fw-bold mb-3 display-6">Ready to Take Control of Your Expenses?</h2>
            <p className="text-light mb-4 mx-auto" style={{ maxWidth: '560px', opacity: 0.9 }}>
              Join SmartSpend today. Track your transactions, stop overspending, and build financial confidence.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/register" className="btn btn-emerald px-4 py-2 fs-6">
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-outline-light px-4 py-2 fs-6">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-4 border-top bg-light text-muted small">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark">SmartSpend</span>
            <span>&copy; {new Date().getFullYear()} — Smart Expense & Budget Management System</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link to="/login" className="text-muted text-decoration-none">Login</Link>
            <Link to="/register" className="text-muted text-decoration-none">Register</Link>
            <span>College Project Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
