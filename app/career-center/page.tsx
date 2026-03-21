'use client'
import { useState } from 'react'
import Link from 'next/link'

const ARTICLES = {
  'Featured Advice': [
    {
      title: 'How to Crack TCS NQT 2025 — Complete Guide',
      desc: 'Everything you need to know about TCS National Qualifier Test — syllabus, pattern, cutoffs and preparation strategy.',
      tag: 'TCS', color: '#2563eb', readTime: '8 min', popular: true,
      href: '/career-center/tcs-nqt-guide'
    },
    {
      title: 'Top 50 HR Interview Questions with Perfect Answers',
      desc: 'Master the most common HR questions asked in Indian campus placements with AI-crafted model answers.',
      tag: 'HR Tips', color: '#7c3aed', readTime: '12 min', popular: true,
      href: '/career-center/hr-interview-questions'
    },
    {
      title: 'How to Write a Resume That Gets 90%+ ATS Score',
      desc: 'Step-by-step guide to building an ATS-friendly resume for Indian companies. Includes real examples.',
      tag: 'Resume', color: '#059669', readTime: '10 min', popular: false,
      href: '/career-center/ats-resume-guide'
    },
    {
      title: 'Infosys InfyTQ Certification — How to Prepare',
      desc: 'Complete roadmap for Infosys placement preparation including InfyTQ, SP and DSE tracks.',
      tag: 'Infosys', color: '#d97706', readTime: '7 min', popular: false,
      href: '/career-center/infosys-preparation'
    },
  ],
  'Resume Templates': [
    {
      title: 'Best Resume Format for Freshers in India 2025',
      desc: 'The exact resume format that Indian HR managers prefer. With downloadable templates.',
      tag: 'Resume', color: '#2563eb', readTime: '6 min', popular: true,
      href: '/career-center/fresher-resume-format'
    },
    {
      title: 'How to Write a Resume Summary That Gets Noticed',
      desc: 'Craft a powerful professional summary in 3-4 sentences that makes recruiters call you immediately.',
      tag: 'Resume', color: '#059669', readTime: '5 min', popular: false,
      href: '/career-center/resume-summary'
    },
    {
      title: '10 Resume Mistakes Indian Freshers Make',
      desc: 'Avoid these common resume mistakes that get your application rejected before anyone reads it.',
      tag: 'Tips', color: '#dc2626', readTime: '7 min', popular: false,
      href: '/career-center/resume-mistakes'
    },
  ],
  'Resume Advice': [
    {
      title: 'How to Quantify Achievements on Your Resume',
      desc: 'Turn "worked on a project" into "Built REST API serving 10,000+ daily users". Real examples included.',
      tag: 'Resume', color: '#7c3aed', readTime: '6 min', popular: true,
      href: '/career-center/quantify-achievements'
    },
    {
      title: 'Skills Section — What to Include as a Fresher',
      desc: 'Which skills to list, how to organize them, and what NOT to include on your resume.',
      tag: 'Resume', color: '#2563eb', readTime: '5 min', popular: false,
      href: '/career-center/resume-skills'
    },
    {
      title: 'How to Write Projects Section With No Experience',
      desc: 'Turn your college projects into impressive resume bullets that companies actually want to see.',
      tag: 'Resume', color: '#059669', readTime: '8 min', popular: false,
      href: '/career-center/resume-projects'
    },
  ],
  'Interview Advice': [
    {
      title: 'STAR Method — Answer Any Behavioral Question',
      desc: 'Master the Situation-Task-Action-Result framework used in every top company interview.',
      tag: 'Interview', color: '#2563eb', readTime: '8 min', popular: true,
      href: '/career-center/star-method'
    },
    {
      title: 'How to Introduce Yourself in an Interview',
      desc: 'The perfect 2-minute self-introduction that sets a strong first impression. Scripts included.',
      tag: 'Interview', color: '#7c3aed', readTime: '6 min', popular: true,
      href: '/career-center/self-introduction'
    },
    {
      title: 'Technical Round Preparation for CSE Freshers',
      desc: 'Data structures, algorithms, DBMS, OS, CN — what to study and how much depth is needed.',
      tag: 'Technical', color: '#059669', readTime: '15 min', popular: false,
      href: '/career-center/technical-round-prep'
    },
    {
      title: 'How to Handle Salary Negotiation as a Fresher',
      desc: 'Exact scripts and strategies to negotiate ₹1-2 LPA more than the initial offer.',
      tag: 'Salary', color: '#d97706', readTime: '7 min', popular: false,
      href: '/career-center/salary-negotiation'
    },
  ],
  'Cover Letter Advice': [
    {
      title: 'How to Write a Cover Letter for Indian Companies',
      desc: 'Do Indian companies even read cover letters? Yes — here is how to write one that works.',
      tag: 'Cover Letter', color: '#2563eb', readTime: '6 min', popular: false,
      href: '/career-center/cover-letter'
    },
    {
      title: 'Cover Letter Template for Freshers',
      desc: 'Copy-paste ready cover letter templates for IT companies, banks, and consulting firms.',
      tag: 'Template', color: '#059669', readTime: '4 min', popular: false,
      href: '/career-center/cover-letter-template'
    },
  ],
  'Jobs': [
    {
      title: 'Top 20 Companies Hiring Freshers in 2025',
      desc: 'Complete list of companies actively hiring engineering and MBA freshers with salary ranges.',
      tag: 'Jobs', color: '#2563eb', readTime: '9 min', popular: true,
      href: '/career-center/companies-hiring-freshers'
    },
    {
      title: 'How to Apply on Naukri.com and Get Responses',
      desc: 'Optimize your Naukri profile and application strategy to get more recruiter calls.',
      tag: 'Job Search', color: '#d97706', readTime: '8 min', popular: false,
      href: '/career-center/naukri-guide'
    },
  ],
  'Careers': [
    {
      title: 'Software Engineer Career Path in India — 2025',
      desc: 'From fresher to senior engineer — salaries, skills needed, and timelines at each level.',
      tag: 'Career', color: '#7c3aed', readTime: '12 min', popular: true,
      href: '/career-center/software-engineer-career'
    },
    {
      title: 'MBA vs MTech — Which is Better for Your Career?',
      desc: 'Honest comparison of both paths with salary data, career growth, and placement statistics.',
      tag: 'Career', color: '#059669', readTime: '10 min', popular: false,
      href: '/career-center/mba-vs-mtech'
    },
  ],
}

const EXPERTS = [
  { name: 'Priya Menon', role: 'Ex-TCS HR Manager', exp: '12 years', avatar: 'PM', color: '#2563eb' },
  { name: 'Rahul Verma', role: 'Software Architect', exp: '10 years', avatar: 'RV', color: '#7c3aed' },
  { name: 'Anita Shah', role: 'Career Coach', exp: '8 years', avatar: 'AS', color: '#059669' },
]

export default function CareerCenterPage() {
  const [activeSection, setActiveSection] = useState('Featured Advice')
  const [searchQuery, setSearchQuery] = useState('')

  const sections = Object.keys(ARTICLES)

  const filteredArticles = searchQuery
    ? Object.values(ARTICLES).flat().filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ARTICLES[activeSection as keyof typeof ARTICLES] || []

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 32px', position: 'sticky' as const, top: 0, zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          height: '64px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '13px'
            }}>AI</div>
            <span style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>
              Placement<span style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>Coach</span>
            </span>
          </Link>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {['Resume Builder', 'Interview Prep', 'Pricing'].map((item, i) => (
              <Link key={i} href={i === 0 ? '/resume' : i === 1 ? '/interview' : '/billing'} style={{
                color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500'
              }}>{item}</Link>
            ))}
            <Link href="/dashboard" style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white', padding: '8px 18px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '13px', fontWeight: '600'
            }}>Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        padding: '64px 32px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' as const }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(37,99,235,0.15)',
            border: '1px solid rgba(37,99,235,0.25)',
            color: '#93c5fd', fontSize: '12px', fontWeight: '700',
            padding: '6px 16px', borderRadius: '9999px', marginBottom: '20px'
          }}>
            CAREER CENTER
          </div>
          <h1 style={{
            fontSize: '48px', fontWeight: '900', color: 'white',
            marginBottom: '16px', lineHeight: '1.2'
          }}>
            Your One-Stop Career Resource
          </h1>
          <p style={{
            color: '#94a3b8', fontSize: '18px', maxWidth: '560px',
            margin: '0 auto 32px', lineHeight: '1.7'
          }}>
            Expert guides, interview tips, resume advice and career resources.
            Written by placement experts for Indian students.
          </p>

          {/* Search Bar */}
          <div style={{
            maxWidth: '480px', margin: '0 auto',
            position: 'relative' as const
          }}>
            <span style={{
              position: 'absolute' as const, left: '16px',
              top: '50%', transform: 'translateY(-50%)',
              fontSize: '16px', pointerEvents: 'none'
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search articles, tips, company guides..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px 14px 44px',
                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box' as const
              }}
            />
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '40px'
          }}>
            {[
              { num: '50+', label: 'Expert Articles' },
              { num: '15+', label: 'Company Guides' },
              { num: '10K+', label: 'Students Helped' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' as const }}>
                <div style={{
                  fontSize: '28px', fontWeight: '800',
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>{stat.num}</div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }}>

          {/* ── SIDEBAR ──────────────────────────── */}
          <div style={{ position: 'sticky' as const, top: '80px' }}>

            {/* Table of Contents */}
            <div style={{
              background: 'white', borderRadius: '16px',
              border: '1px solid #e2e8f0', overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '20px'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  Table of Contents
                </h3>
              </div>
              {sections.map((section, i) => (
                <div key={i}
                  onClick={() => { setActiveSection(section); setSearchQuery('') }}
                  style={{
                    padding: '12px 20px', cursor: 'pointer',
                    borderLeft: activeSection === section && !searchQuery
                      ? '3px solid #7c3aed' : '3px solid transparent',
                    background: activeSection === section && !searchQuery
                      ? '#faf5ff' : 'transparent',
                    borderBottom: i < sections.length - 1 ? '1px solid #f8fafc' : 'none',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    if (activeSection !== section || searchQuery)
                      (e.currentTarget as HTMLElement).style.background = '#f8fafc'
                  }}
                  onMouseLeave={e => {
                    if (activeSection !== section || searchQuery)
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <span style={{
                    fontSize: '14px', fontWeight: activeSection === section && !searchQuery ? '600' : '400',
                    color: activeSection === section && !searchQuery ? '#7c3aed' : '#475569'
                  }}>
                    {section}
                  </span>
                  <span style={{
                    float: 'right', fontSize: '11px', fontWeight: '600',
                    color: '#94a3b8',
                    background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px'
                  }}>
                    {ARTICLES[section as keyof typeof ARTICLES]?.length}
                  </span>
                </div>
              ))}
            </div>

            {/* Meet Experts */}
            <div style={{
              background: 'white', borderRadius: '16px',
              border: '1px solid #e2e8f0', padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                Meet Our Career Experts
              </h3>
              {EXPERTS.map((expert, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'center',
                  marginBottom: i < 2 ? '14px' : '0',
                  paddingBottom: i < 2 ? '14px' : '0',
                  borderBottom: i < 2 ? '1px solid #f8fafc' : 'none'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                    background: expert.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700', fontSize: '13px'
                  }}>{expert.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>
                      {expert.name}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                      {expert.role}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '1px' }}>
                      {expert.exp} experience
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
              borderRadius: '16px', padding: '20px', marginTop: '20px',
              border: '1px solid rgba(37,99,235,0.2)'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>🚀</div>
              <h4 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>
                Ready to get placed?
              </h4>
              <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.6', marginBottom: '16px' }}>
                Build your AI resume and start practicing interviews today.
              </p>
              <Link href="/register" style={{
                display: 'block', textAlign: 'center' as const,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white', padding: '10px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '13px', fontWeight: '700'
              }}>
                Start Free →
              </Link>
            </div>
          </div>

          {/* ── ARTICLES ─────────────────────────── */}
          <div>

            {/* Section Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                {searchQuery ? `Search Results for "${searchQuery}"` : activeSection}
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                {searchQuery
                  ? `${filteredArticles.length} articles found`
                  : `${filteredArticles.length} articles • Expert guidance for Indian students`}
              </p>
            </div>

            {/* Search results or section articles */}
            {filteredArticles.length === 0 ? (
              <div style={{
                background: 'white', borderRadius: '16px',
                border: '1px solid #e2e8f0', padding: '48px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ color: '#0f172a', fontWeight: '700', marginBottom: '8px' }}>
                  No articles found
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Try a different search term
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                {filteredArticles.map((article, i) => (
                  <div key={i} style={{
                    background: 'white', borderRadius: '16px',
                    border: '1px solid #e2e8f0', padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s', cursor: 'pointer'
                  }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
                      el.style.transform = 'translateY(-2px)'
                      el.style.borderColor = article.color + '40'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                      el.style.transform = 'translateY(0)'
                      el.style.borderColor = '#e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                      {/* Article Number */}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                        background: article.color + '15',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: article.color, fontWeight: '800', fontSize: '18px'
                      }}>
                        {i + 1}
                      </div>

                      <div style={{ flex: 1 }}>
                        {/* Tags row */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                          <span style={{
                            background: article.color + '15', color: article.color,
                            fontSize: '11px', fontWeight: '700',
                            padding: '3px 10px', borderRadius: '6px'
                          }}>{article.tag}</span>
                          {article.popular && (
                            <span style={{
                              background: '#fef3c7', color: '#92400e',
                              fontSize: '11px', fontWeight: '700',
                              padding: '3px 10px', borderRadius: '6px'
                            }}>🔥 Popular</span>
                          )}
                          <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: 'auto' }}>
                            ⏱ {article.readTime} read
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{
                          fontSize: '17px', fontWeight: '700', color: '#0f172a',
                          marginBottom: '8px', lineHeight: '1.4'
                        }}>
                          {article.title}
                        </h3>

                        {/* Description */}
                        <p style={{
                          color: '#64748b', fontSize: '14px',
                          lineHeight: '1.6', marginBottom: '16px'
                        }}>
                          {article.desc}
                        </p>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '24px', height: '24px', borderRadius: '6px',
                              background: EXPERTS[i % 3].color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: '9px', fontWeight: '700'
                            }}>{EXPERTS[i % 3].avatar}</div>
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                              By {EXPERTS[i % 3].name}
                            </span>
                          </div>
                          <Link href="/register" style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            color: article.color, textDecoration: 'none',
                            fontSize: '13px', fontWeight: '700',
                            background: article.color + '10',
                            padding: '7px 14px', borderRadius: '8px',
                            transition: 'all 0.15s'
                          }}>
                            Read Article →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
              borderRadius: '20px', padding: '40px', marginTop: '32px',
              border: '1px solid rgba(37,99,235,0.15)', textAlign: 'center' as const
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ color: 'white', fontWeight: '800', fontSize: '24px', marginBottom: '12px' }}>
                Ready to put this advice into action?
              </h3>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '24px', lineHeight: '1.7' }}>
                Build your AI resume, practice interviews, and get daily WhatsApp coaching.
                Start free — no credit card needed.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link href="/resume" style={{
                  padding: '14px 32px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  textDecoration: 'none', color: 'white',
                  fontSize: '15px', fontWeight: '700',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.3)'
                }}>
                  Build My Resume →
                </Link>
                <Link href="/interview" style={{
                  padding: '14px 24px', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  textDecoration: 'none', color: 'white',
                  fontSize: '15px', fontWeight: '600',
                  background: 'rgba(255,255,255,0.05)'
                }}>
                  Practice Interview
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer style={{
        background: '#0a0f1a', padding: '40px 32px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: '48px'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '13px'
            }}>AI</div>
            <span style={{ color: '#475569', fontSize: '14px' }}>
              © 2026 AI Placement Coach • Made with ❤️ in India 🇮🇳
            </span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Home', 'Resume Builder', 'Interview Prep', 'Pricing'].map((item, i) => (
              <Link key={i} href="/" style={{
                color: '#334155', textDecoration: 'none', fontSize: '13px'
              }}>{item}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}