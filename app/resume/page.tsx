'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface FormData {
  name: string;
  email: string;
  phone: string;
  skills: string;
  experience: string;
  education: string;
  projects: string;
  targetRole: string;
  targetCompany: string;
}

interface ATSResult {
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
}

export default function ResumePage() {
  const [userId, setUserId] = useState("");
  const [credits, setCredits] = useState(0);
  const [step, setStep] = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
    education: "",
    projects: "",
    targetRole: "",
    targetCompany: "",
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserId(user.id);

        const { data } = await supabase
          .from("subscriptions")
          .select("credits_remaining")
          .eq("user_id", user.id)
          .single();

        if (data) setCredits(data.credits_remaining);
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    if (!form.name || !form.skills || !form.targetRole) {
      setError("Please fill Name, Skills and Target Role.");
      return;
    }
    if (credits < 5) {
      setError(`Not enough credits. Need 5, you have ${credits}.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate.");
        return;
      }

      setGeneratedResume(data.resume);
      setResumeId(data.resumeId);
      setCredits((prev) => prev - 5);
      setStep("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleATSCheck = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }
    if (credits < 2) {
      setError("Not enough credits. Need 2 credits.");
      return;
    }

    setAtsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          resumeText: generatedResume,
          jobDescription,
          resumeId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setAtsResult(data);
      setCredits((prev) => prev - 2);
    } catch {
      setError("ATS check failed.");
    } finally {
      setAtsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.name.replace(/\\s+/g, "_")}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes shimmerBg {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        
        .fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
          display: inline-block;
        }
        
        .glass-container {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          border-radius: 24px;
        }

        .input-glow {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #d1d5db;
        }
        .input-glow:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
          background: #ffffff;
          transform: translateY(-2px);
        }
        
        .section-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          padding: 28px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .section-card:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          border-color: #bfdbfe;
        }

        .primary-btn {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -10px rgba(37, 99, 235, 0.5);
          filter: brightness(1.05);
        }
        .primary-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        
        .shimmer-bg {
          background: linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa, #3b82f6, #2563eb);
          background-size: 200% auto;
          animation: shimmerBg 3s linear infinite;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #fef3c7 100%)',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: "'Inter', sans-serif"
      }}>
        
        {/* Decorative backdrop */}
        <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />

        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
          padding: '16px 32px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button onClick={() => step === 'form' ? router.push("/dashboard") : setStep("form")} className="primary-btn" style={{
              color: '#475569', background: 'white', border: '1px solid #e2e8f0',
              padding: '8px 16px', borderRadius: '10px', fontSize: '14px',
              fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              {step === 'form' ? '← Dashboard' : '← Build Another'}
            </button>
            <Link href="/resume/templates" className="primary-btn" style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)', color: '#1d4ed8',
              padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
              fontSize: '14px', fontWeight: '700', border: '1px solid #bfdbfe',
              boxShadow: '0 2px 8px rgba(37,99,235,0.1)'
            }}>
              📝 Browse Templates
            </Link>
          </div>
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white',
            fontSize: '14px', fontWeight: '700', padding: '6px 16px', borderRadius: '9999px',
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
          }}>
            🪙 {credits} credits
          </span>
        </nav>

        {/* ── FORM VIEW ────────────────────────────────── */}
        {step === "form" && (
          <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 10 }}>
            <div className="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="animate-float" style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>📄</div>
              <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#0f172a', marginBottom: '12px', letterSpacing: '-1px' }}>
                AI Resume Builder
              </h1>
              <p style={{ color: '#475569', fontSize: '18px', fontWeight: '500', maxWidth: '500px', margin: '0 auto' }}>
                Fill your details to generate an ATS-friendly resume instantly. 
                <span style={{ color: '#2563eb', fontWeight: '700', marginLeft: '6px', backgroundColor: '#dbeafe', padding: '4px 10px', borderRadius: '8px' }}>
                  Costs 5 credits.
                </span>
              </p>
            </div>

            {error && (
              <div className="fade-up" style={{
                background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                padding: '16px', borderRadius: '12px', marginBottom: '32px',
                fontSize: '15px', fontWeight: '600', textAlign: 'center',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)'
              }}>
                ⚠️ {error}
              </div>
            )}

            <div className="glass-container fade-up delay-1" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Personal Info */}
                <div className="section-card">
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>👤</span> Personal Information
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {[
                      { name: "name", label: "Full Name *", placeholder: "e.g. Rahul Sharma" },
                      { name: "email", label: "Email *", placeholder: "e.g. rahul@gmail.com" },
                      { name: "phone", label: "Phone", placeholder: "e.g. +91 9876543210" },
                      { name: "targetRole", label: "Target Role *", placeholder: "e.g. Frontend Developer" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                          {field.label}
                        </label>
                        <input
                          name={field.name}
                          value={form[field.name as keyof FormData]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className="input-glow"
                          style={{
                            width: '100%', borderRadius: '12px', padding: '14px 16px',
                            fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                            color: '#1e293b', fontWeight: '500'
                          }}
                        />
                      </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Target Company
                      </label>
                      <select
                        name="targetCompany"
                        value={form.targetCompany}
                        onChange={handleChange}
                        className="input-glow"
                        style={{
                          width: '100%', borderRadius: '12px', padding: '14px 16px',
                          fontSize: '15px', outline: 'none', appearance: 'none',
                          color: '#1e293b', fontWeight: '500', cursor: 'pointer',
                          backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 16px top 50%',
                          backgroundSize: '12px auto'
                        }}
                      >
                        <option value="">Select company (optional) - e.g. for tailored wording</option>
                        {[
                          "TCS", "Infosys", "Wipro", "Accenture", "HCL", "Tech Mahindra",
                          "Cognizant", "Amazon", "Google", "Microsoft", "Deloitte", "KPMG", "Other",
                        ].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="section-card">
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>💻</span> Skills *
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>Separate with commas. Be comprehensive.</p>
                  <textarea
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    rows={3}
                    className="input-glow"
                    placeholder="e.g. Python, Java, React, Node.js, SQL, AWS, Git..."
                    style={{
                      width: '100%', borderRadius: '12px', padding: '16px',
                      fontSize: '15px', outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                      color: '#1e293b', fontWeight: '500'
                    }}
                  />
                </div>

                {/* Experience */}
                <div className="section-card">
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>💼</span> Work Experience
                  </h2>
                  <textarea
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    rows={4}
                    className="input-glow"
                    placeholder="Software Intern at ABC (June-Aug 2023): Built REST APIs, reduced load time 30%&#10;Or write: Fresher — no experience yet"
                    style={{
                      width: '100%', borderRadius: '12px', padding: '16px',
                      fontSize: '15px', outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                      color: '#1e293b', fontWeight: '500', lineHeight: '1.6'
                    }}
                  />
                </div>

                {/* Education */}
                <div className="section-card">
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🎓</span> Education
                  </h2>
                  <textarea
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    rows={3}
                    className="input-glow"
                    placeholder="B.Tech Computer Science — VNIT Nagpur (2020-2024) — CGPA: 8.2&#10;12th — DPS Delhi — 92% (2020)"
                    style={{
                      width: '100%', borderRadius: '12px', padding: '16px',
                      fontSize: '15px', outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                      color: '#1e293b', fontWeight: '500', lineHeight: '1.6'
                    }}
                  />
                </div>

                {/* Projects */}
                <div className="section-card">
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🚀</span> Projects
                  </h2>
                  <textarea
                    name="projects"
                    value={form.projects}
                    onChange={handleChange}
                    rows={4}
                    className="input-glow"
                    placeholder="E-Commerce Website: React + Node.js, 500 users, Razorpay payment&#10;AI Chatbot: Python + Claude API, automated support for 3 businesses"
                    style={{
                      width: '100%', borderRadius: '12px', padding: '16px',
                      fontSize: '15px', outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                      color: '#1e293b', fontWeight: '500', lineHeight: '1.6'
                    }}
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || credits < 5}
                  className={`primary-btn ${loading ? 'shimmer-bg' : ''}`}
                  style={{
                    width: '100%',
                    background: loading ? 'transparent' : credits < 5 ? '#e2e8f0' : '#2563eb',
                    color: credits < 5 && !loading ? '#64748b' : 'white',
                    padding: '20px', borderRadius: '16px', border: 'none',
                    fontSize: '18px', fontWeight: '800', cursor: loading || credits < 5 ? 'not-allowed' : 'pointer',
                    boxShadow: loading || credits < 5 ? 'none' : '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px'
                  }}
                >
                  {loading
                    ? <><span className="animate-float">✨</span> Architecting your perfect resume...</>
                    : credits < 5
                      ? `Not enough credits (5 required, you have ${credits})`
                      : <><span className="animate-float">✨</span> Generate Magic Resume — 5 Credits</>}
                </button>
              </div>
            </div>
          </main>
        )}

        {/* ── RESULT VIEW ────────────────────────────────── */}
        {step === "result" && (
          <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px', position: 'relative', zIndex: 10 }}>
            
            <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#0f172a', marginBottom: '8px', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="animate-float">🎉</span> Resume Ready!
                </h1>
                <p style={{ color: '#475569', fontSize: '18px', fontWeight: '500' }}>
                  Your generated resume is ready. Download it or check its ATS score.
                </p>
              </div>
              <button onClick={handleDownload} className="primary-btn" style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white',
                padding: '16px 32px', borderRadius: '14px', border: 'none',
                fontSize: '16px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span className="animate-float">⬇️</span> Download TXT
              </button>
            </div>

            {error && (
              <div className="fade-up" style={{
                background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: '600',
                boxShadow: '0 4px 12px rgba(220,38,38,0.1)'
              }}>⚠️ {error}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
              
              {/* Resume Output */}
              <div className="glass-container fade-up delay-1" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>📄</span> Generated Output
                </h2>
                <div style={{
                  background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                  padding: '32px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                  maxHeight: '800px', overflowY: 'auto'
                }}>
                  <pre style={{
                    fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap',
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    lineHeight: '1.8', margin: 0
                  }}>
                    {generatedResume}
                  </pre>
                </div>
              </div>

              {/* ATS Checker Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="glass-container fade-up delay-2" style={{ padding: '32px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🎯</span> ATS Score Checker
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', fontWeight: '500' }}>
                    Paste a job description to see how well this resume matches. 
                    <span style={{ color: '#2563eb', fontWeight: '700', marginLeft: '6px', background: '#e0e7ff', padding: '2px 8px', borderRadius: '6px' }}>Costs 2 credits.</span>
                  </p>
                  
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="input-glow"
                    placeholder="Paste the full job description here..."
                    rows={8}
                    style={{
                      width: '100%', border: '1px solid #d1d5db',
                      borderRadius: '16px', padding: '20px', fontSize: '15px',
                      outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                      fontFamily: 'inherit', color: '#1e293b', fontWeight: '500',
                      lineHeight: '1.6', marginBottom: '24px'
                    }}
                  />
                  
                  <button
                    onClick={handleATSCheck}
                    disabled={atsLoading || credits < 2 || !jobDescription.trim()}
                    className={`primary-btn ${atsLoading ? 'shimmer-bg' : ''}`}
                    style={{
                      width: '100%',
                      background: atsLoading ? 'transparent' : (credits < 2 || !jobDescription.trim()) ? '#cbd5e1' : '#8b5cf6',
                      color: (credits < 2 && !atsLoading) ? '#64748b' : 'white',
                      padding: '16px', borderRadius: '12px', border: 'none',
                      fontSize: '16px', fontWeight: '800', cursor: (atsLoading || credits < 2 || !jobDescription.trim()) ? 'not-allowed' : 'pointer',
                      boxShadow: (atsLoading || credits < 2 || !jobDescription.trim()) ? 'none' : '0 10px 20px -5px rgba(139, 92, 246, 0.4)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                    }}
                  >
                    {atsLoading ? '🔍 Analyzing match...' : '🎯 Calculate ATS Score — 2 Credits'}
                  </button>
                </div>

                {/* ATS Result */}
                {atsResult && (
                  <div className="glass-container fade-up" style={{ padding: '32px', borderLeft: `6px solid ${atsResult.score >= 80 ? '#10b981' : atsResult.score >= 60 ? '#f59e0b' : '#ef4444'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                      <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Match Analysis</h3>
                      <div style={{
                        background: atsResult.score >= 80 ? '#dcfce7' : atsResult.score >= 60 ? '#fef3c7' : '#fee2e2',
                        color: atsResult.score >= 80 ? '#059669' : atsResult.score >= 60 ? '#d97706' : '#dc2626',
                        padding: '12px 24px', borderRadius: '16px', textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>ATS Score</div>
                        <div style={{ fontSize: '36px', fontWeight: '900' }}>{atsResult.score}%</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: '24px' }}>
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#10b981', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          ✅ Keywords Matched
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {atsResult.matched_keywords.map((k, i) => (
                            <span key={i} style={{ background: '#dcfce7', color: '#059669', fontSize: '13px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                              {k}
                            </span>
                          ))}
                          {atsResult.matched_keywords.length === 0 && <span style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>None yet.</span>}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ef4444', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          ❌ Missing Keywords
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {atsResult.missing_keywords.map((k, i) => (
                            <span key={i} style={{ background: '#fee2e2', color: '#dc2626', fontSize: '13px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                              {k}
                            </span>
                          ))}
                          {atsResult.missing_keywords.length === 0 && <span style={{ color: '#059669', fontSize: '14px', fontWeight: '600' }}>You hit all the key terms!</span>}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#6366f1', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          💡 Improvement Suggestions
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '14px', lineHeight: '1.7', fontWeight: '500' }}>
                          {atsResult.suggestions.map((s, i) => (
                            <li key={i} style={{ marginBottom: '8px' }}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>
    </>
  );
}
