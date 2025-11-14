import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Sparkles, Plus, Trash, CheckCircle2, AlertCircle } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import ResumeService, { ResumeInput, ResumeSection, ATSScore } from '../services/resumeService';

const emptyExperience = { company: '', role: '', start: '', end: '', details: '' };

const ResumeBuilder: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const service = useMemo(() => new ResumeService(), []);
  const [form, setForm] = useState<ResumeInput>({
    fullName: '',
    title: '',
    yearsExperience: 0,
    summary: '',
    skills: [],
    experiences: [{ ...emptyExperience }],
    education: [],
    email: '',
    phone: '',
    location: '',
    links: {},
    projects: [],
    certifications: [],
    bulletsPerExperience: 5,
  });
  const [skillInput, setSkillInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [section, setSection] = useState<ResumeSection | null>(null);
  const [editableSection, setEditableSection] = useState<ResumeSection | null>(null);
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  const updateExperience = (idx: number, key: string, val: string) => {
    setForm(prev => {
      const copy = { ...prev, experiences: [...prev.experiences] };
      (copy.experiences[idx] as any)[key] = val;
      return copy;
    });
  };

  const addExperience = () => setForm(p => ({ ...p, experiences: [...p.experiences, { ...emptyExperience }] }));
  const removeExperience = (idx: number) => setForm(p => ({ ...p, experiences: p.experiences.filter((_, i) => i !== idx) }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };

  const generate = async () => {
    setAiLoading(true);
    try {
      const res = await service.generate(form);
      setSection(res);
      setEditableSection(res);
      setIsEditingPreview(true);
    } finally {
      setAiLoading(false);
    }
  };

  const checkATS = async () => {
    setAtsLoading(true);
    try {
      const score = await service.checkATS(form, preview);
      setAtsScore(score);
    } finally {
      setAtsLoading(false);
    }
  };

  const fallbackSection: ResumeSection = useMemo(() => ({
    summary: form.summary || `${form.title} with ${form.yearsExperience || 0}+ years of experience.`,
    skills: form.skills,
    experiences: form.experiences.map(e => ({
      company: e.company,
      role: e.role,
      start: e.start,
      end: e.end,
      bullets: e.details ? e.details.split('\n').map(line => line.trim()).filter(Boolean) : [],
    })),
    projects: form.projects?.map(p => ({ name: p.name, bullets: p.description ? p.description.split('\n').map(line => line.trim()).filter(Boolean) : [], link: p.link })) || [],
    certifications: form.certifications || [],
  }), [form]);

  const preview = editableSection || section || fallbackSection;

  const toggleEditingSection = () => {
    if (!isEditingPreview) {
      if (!editableSection) {
        setEditableSection(preview);
      }
      setIsEditingPreview(true);
    } else {
      setIsEditingPreview(false);
    }
  };

  const updateEditable = (updater: (prev: ResumeSection) => ResumeSection) => {
    setEditableSection(prev => {
      const base = prev ?? preview;
      return updater(base);
    });
  };

  const printPdf = () => {
    window.print();
  };

  const scrollToATSScore = () => {
    const scoreElement = document.getElementById('ats-score-section');
    const buttonElement = document.getElementById('ats-check-button');
    
    if (scoreElement) {
      scoreElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (buttonElement) {
      buttonElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const previewInputClass = `${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} rounded px-2 py-1 outline-none focus:border-purple-500 focus:ring-0`;
  const previewTextareaClass = `${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} rounded-lg p-2 outline-none focus:border-purple-500 focus:ring-0`;

  return (
    <div className="px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 space-y-4`}>
          <h2 className="text-lg font-semibold">Resume Builder</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Target title (e.g., Frontend Engineer)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Years of experience" type="number" value={form.yearsExperience ?? 0} onChange={e => setForm({ ...form, yearsExperience: Number(e.target.value) })} />
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Location" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Phone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="GitHub URL" value={form.links?.github || ''} onChange={e => setForm({ ...form, links: { ...form.links, github: e.target.value } })} />
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="LinkedIn URL" value={form.links?.linkedin || ''} onChange={e => setForm({ ...form, links: { ...form.links, linkedin: e.target.value } })} />
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Website URL" value={form.links?.website || ''} onChange={e => setForm({ ...form, links: { ...form.links, website: e.target.value } })} />
            <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Bullets per experience (3-6)" type="number" min={3} max={6} value={form.bulletsPerExperience || 5} onChange={e => setForm({ ...form, bulletsPerExperience: Number(e.target.value) })} />
          </div>

          <textarea className={`w-full rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} rows={3} placeholder="Optional: your current summary" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />

          {/* Skills */}
          <div>
            <div className="flex gap-2">
              <input className={`flex-1 rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Add a skill and press +" value={skillInput} onChange={e => setSkillInput(e.target.value)} />
              <button onClick={addSkill} className={`px-3 rounded-lg text-white ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1A202C] hover:bg-[#2D3748]'
              }`}><Plus size={16} /></button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.skills.map((s, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-600/20 text-purple-600">{s}</span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-4">
            {form.experiences.map((e, idx) => (
              <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-xl p-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Company" value={e.company} onChange={ev => updateExperience(idx, 'company', ev.target.value)} />
                <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Role" value={e.role} onChange={ev => updateExperience(idx, 'role', ev.target.value)} />
                <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Start (e.g., Jan 2022)" value={e.start} onChange={ev => updateExperience(idx, 'start', ev.target.value)} />
                <div className="flex gap-2">
                  <input className={`flex-1 rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="End (e.g., Present)" value={e.end} onChange={ev => updateExperience(idx, 'end', ev.target.value)} />
                  {form.experiences.length > 1 && (
                    <button onClick={() => removeExperience(idx)} className={`px-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} aria-label="Remove">
                      <Trash size={16} />
                    </button>
                  )}
                </div>
                <textarea className={`md:col-span-2 rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} rows={2} placeholder="Optional details (projects, stack, impact)" value={e.details} onChange={ev => updateExperience(idx, 'details', ev.target.value)} />
              </div>
            ))}
            <button onClick={addExperience} className="text-sm px-3 py-2 rounded-lg border border-dashed">
              Add experience
            </button>
          </div>

          {/* Projects */}
          <div className="space-y-3">
            <div className="font-medium">Projects</div>
            {(form.projects || []).map((p, i) => (
              <div key={i} className={`grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-xl p-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Project name" value={p.name} onChange={e => setForm(prev => { const arr = [...(prev.projects||[])]; arr[i] = { ...arr[i], name: e.target.value }; return { ...prev, projects: arr }; })} />
                <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Link (optional)" value={p.link || ''} onChange={e => setForm(prev => { const arr = [...(prev.projects||[])]; arr[i] = { ...arr[i], link: e.target.value }; return { ...prev, projects: arr }; })} />
                <textarea className={`md:col-span-2 rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} rows={2} placeholder="Brief description or achievements" value={p.description || ''} onChange={e => setForm(prev => { const arr = [...(prev.projects||[])]; arr[i] = { ...arr[i], description: e.target.value }; return { ...prev, projects: arr }; })} />
              </div>
            ))}
            <button onClick={() => setForm(prev => ({ ...prev, projects: [ ...(prev.projects || []), { name: '' } ] }))} className="text-sm px-3 py-2 rounded-lg border border-dashed">Add project</button>
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <div className="font-medium">Certifications</div>
            {(form.certifications || []).map((c, i) => (
              <div key={i} className={`grid grid-cols-1 md:grid-cols-3 gap-3 border rounded-xl p-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Certification" value={c.name} onChange={e => setForm(prev => { const arr = [...(prev.certifications||[])]; arr[i] = { ...arr[i], name: e.target.value }; return { ...prev, certifications: arr }; })} />
                <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Issuer" value={c.issuer || ''} onChange={e => setForm(prev => { const arr = [...(prev.certifications||[])]; arr[i] = { ...arr[i], issuer: e.target.value }; return { ...prev, certifications: arr }; })} />
                <input className={`rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} placeholder="Year" value={c.year || ''} onChange={e => setForm(prev => { const arr = [...(prev.certifications||[])]; arr[i] = { ...arr[i], year: e.target.value }; return { ...prev, certifications: arr }; })} />
              </div>
            ))}
            <button onClick={() => setForm(prev => ({ ...prev, certifications: [ ...(prev.certifications || []), { name: '' } ] }))} className="text-sm px-3 py-2 rounded-lg border border-dashed">Add certification</button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={generate} disabled={aiLoading} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${aiLoading ? 'opacity-70' : ''} ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1A202C] hover:bg-[#2D3748]'
            } text-white`}>
              <Sparkles size={16} /> {aiLoading ? 'Generating…' : 'Generate with AI'}
            </button>
            <button id="ats-check-button" onClick={checkATS} disabled={atsLoading} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${atsLoading ? 'opacity-70' : ''} ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1A202C] hover:bg-[#2D3748]'
            } text-white`}>
              <CheckCircle2 size={16} /> {atsLoading ? 'Checking…' : 'Check ATS Score'}
            </button>
          </div>
          
          {/* ATS Score Display */}
          {atsScore && (
            <div id="ats-score-section" className={`mt-4 rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">ATS Compatibility Score</h3>
                <div className={`text-3xl font-bold ${atsScore.overallScore >= 80 ? 'text-green-600' : atsScore.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {atsScore.overallScore}%
                </div>
              </div>
              
              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {Object.entries(atsScore.breakdown).map(([key, value]) => (
                  <div key={key} className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    <div className="text-xs opacity-70 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{value}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Strengths */}
              {atsScore.strengths.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="font-semibold text-sm">Strengths</span>
                  </div>
                  <ul className="list-disc pl-6 space-y-1 text-sm opacity-80">
                    {atsScore.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Recommendations */}
              {atsScore.recommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-yellow-600" />
                    <span className="font-semibold text-sm">Recommendations</span>
                  </div>
                  <ul className="list-disc pl-6 space-y-1 text-sm opacity-80">
                    {atsScore.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div
          id="resume-print"
          className={`${
            isDarkMode
              ? 'bg-gray-900 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          } border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Preview</h3>
            <div className="flex gap-2 print:hidden">
              <button onClick={toggleEditingSection} className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
                {isEditingPreview ? 'Disable Editing' : 'Enable Editing'}
              </button>
              <button onClick={printPdf} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white"><Download size={16} /> Download PDF</button>
            </div>
          </div>
          <div className="mt-4">
            {isEditingPreview ? (
              <>
                <input
                  className={`w-full text-2xl font-extrabold tracking-tight outline-none border-b ${
                    isDarkMode
                      ? 'text-white border-gray-700 focus:border-purple-400 bg-transparent'
                      : 'text-gray-900 border-gray-200 focus:border-purple-500 bg-transparent'
                  }`}
                  value={preview.summary ? preview.summary.split('\n')[0] || form.fullName || 'Your Name' : (form.fullName || 'Your Name')}
                  onChange={e => updateEditable(prev => ({ ...prev, summary: `${e.target.value}\n${prev.summary.split('\n').slice(1).join('\n')}` }))}
                />
                <input
                  className={`w-full mt-1 opacity-90 outline-none border-b ${
                    isDarkMode
                      ? 'text-gray-200 border-gray-700 focus:border-purple-400 bg-transparent'
                      : 'text-gray-700 border-gray-200 focus:border-purple-500 bg-transparent'
                  }`}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Professional Title"
                />
              </>
            ) : (
              <>
                <div className="text-2xl font-extrabold tracking-tight">{form.fullName || 'Your Name'}</div>
                <div className="opacity-80">{form.title}</div>
              </>
            )}
            <div className="text-xs opacity-70 mt-1">{[form.location, form.email, form.phone].filter(Boolean).join(' · ')}</div>
            <div className="text-xs opacity-70">{[form.links?.website, form.links?.github, form.links?.linkedin].filter(Boolean).join(' · ')}</div>
            <div className={`h-px w-full my-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <div className="mt-4">
              <div className="font-semibold uppercase text-xs tracking-wide">Summary</div>
              {isEditingPreview ? (
                <textarea
                  className={`w-full mt-1 text-sm ${previewTextareaClass}`}
                  rows={4}
                  value={preview.summary}
                  onChange={e => updateEditable(prev => ({ ...prev, summary: e.target.value }))}
                />
              ) : (
                <div className="mt-1 text-sm whitespace-pre-wrap">{preview.summary || 'A concise professional summary will appear here.'}</div>
              )}
            </div>
            <div className="mt-4">
              <div className="font-semibold uppercase text-xs tracking-wide">Skills</div>
              {isEditingPreview ? (
                <textarea
                  className={`w-full mt-1 text-sm ${previewTextareaClass}`}
                  rows={3}
                  value={preview.skills.join(', ')}
                  onChange={e => updateEditable(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                />
              ) : (
                <div className="mt-1 text-sm flex flex-wrap gap-2">
                  {preview.skills.map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs">{s}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3">
              <div className="font-semibold uppercase text-xs tracking-wide">Experience</div>
              {preview.experiences.map((e, i) => (
                <div key={i} className="space-y-1">
                  {isEditingPreview ? (
                    <>
                      <div className="flex gap-2 text-sm">
                        <input
                          className={`flex-1 ${previewInputClass}`}
                          value={e.role}
                          onChange={ev => updateEditable(prev => {
                          const experiences = [...prev.experiences];
                          experiences[i] = { ...experiences[i], role: ev.target.value };
                          return { ...prev, experiences };
                          })}
                        />
                        <input
                          className={`flex-1 ${previewInputClass}`}
                          value={e.company}
                          onChange={ev => updateEditable(prev => {
                          const experiences = [...prev.experiences];
                          experiences[i] = { ...experiences[i], company: ev.target.value };
                          return { ...prev, experiences };
                          })}
                        />
                      </div>
                      <div className="flex gap-2 text-xs">
                        <input
                          className={`flex-1 ${previewInputClass}`}
                          value={e.start}
                          onChange={ev => updateEditable(prev => {
                          const experiences = [...prev.experiences];
                          experiences[i] = { ...experiences[i], start: ev.target.value };
                          return { ...prev, experiences };
                          })}
                        />
                        <input
                          className={`flex-1 ${previewInputClass}`}
                          value={e.end}
                          onChange={ev => updateEditable(prev => {
                          const experiences = [...prev.experiences];
                          experiences[i] = { ...experiences[i], end: ev.target.value };
                          return { ...prev, experiences };
                          })}
                        />
                      </div>
                      <textarea
                        className={`w-full text-sm ${previewTextareaClass}`}
                        rows={4}
                        value={e.bullets.join('\n')}
                        onChange={ev => updateEditable(prev => {
                        const experiences = [...prev.experiences];
                        experiences[i] = { ...experiences[i], bullets: ev.target.value.split('\n').map(line => line.trim()).filter(Boolean) };
                        return { ...prev, experiences };
                        })}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold">{e.role} · {e.company}</div>
                      <div className="text-xs opacity-70">{e.start} – {e.end}</div>
                      {e.bullets?.length ? (
                        <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                          {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
                        </ul>
                      ) : null}
                    </>
                  )}
                </div>
              ))}
            </div>

            {(section?.projects?.length || form.projects?.length) ? (
              <div className="mt-4 space-y-2">
                <div className="font-semibold uppercase text-xs tracking-wide">Projects</div>
                {(preview.projects && preview.projects.length ? preview.projects : []).map((p, i) => (
                  <div key={i}>
                    {isEditingPreview ? (
                      <>
                        <div className="flex gap-2 text-sm">
                          <input
                            className={`flex-1 ${previewInputClass}`}
                            value={p.name}
                            onChange={ev => updateEditable(prev => {
                            const projects = [...(prev.projects || [])];
                            projects[i] = { ...projects[i], name: ev.target.value };
                            return { ...prev, projects };
                            })}
                          />
                          <input
                            className={`flex-1 ${previewInputClass}`}
                            value={p.link || ''}
                            onChange={ev => updateEditable(prev => {
                            const projects = [...(prev.projects || [])];
                            projects[i] = { ...projects[i], link: ev.target.value };
                            return { ...prev, projects };
                            })}
                          />
                        </div>
                        <textarea
                          className={`w-full text-sm mt-1 ${previewTextareaClass}`}
                          rows={3}
                          value={(p.bullets || []).join('\n')}
                          onChange={ev => updateEditable(prev => {
                          const projects = [...(prev.projects || [])];
                          projects[i] = { ...projects[i], bullets: ev.target.value.split('\n').map(line => line.trim()).filter(Boolean) };
                          return { ...prev, projects };
                          })}
                        />
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-semibold">{p.name} {p.link ? (<a className="text-blue-600" href={p.link} target="_blank" rel="noreferrer">↗</a>) : null}</div>
                        {p.bullets?.length ? (
                          <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                            {p.bullets.map((b, j) => <li key={j}>{b}</li>)}
                          </ul>
                        ) : null}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {(section?.certifications?.length || form.certifications?.length) ? (
              <div className="mt-4 space-y-1">
                <div className="font-semibold uppercase text-xs tracking-wide">Certifications</div>
                {isEditingPreview ? (
                  <div className="space-y-2">
                    {(preview.certifications || []).map((c, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <input
                          className={previewInputClass}
                          value={c.name}
                          onChange={ev => updateEditable(prev => {
                          const certifications = [...(prev.certifications || [])];
                          certifications[i] = { ...certifications[i], name: ev.target.value };
                          return { ...prev, certifications };
                          })}
                        />
                        <input
                          className={previewInputClass}
                          value={c.issuer || ''}
                          onChange={ev => updateEditable(prev => {
                          const certifications = [...(prev.certifications || [])];
                          certifications[i] = { ...certifications[i], issuer: ev.target.value };
                          return { ...prev, certifications };
                          })}
                        />
                        <input
                          className={previewInputClass}
                          value={c.year || ''}
                          onChange={ev => updateEditable(prev => {
                          const certifications = [...(prev.certifications || [])];
                          certifications[i] = { ...certifications[i], year: ev.target.value };
                          return { ...prev, certifications };
                          })}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {(preview.certifications || []).map((c, i) => (
                      <li key={i}>{c.name}{c.issuer ? ` · ${c.issuer}` : ''}{c.year ? `, ${c.year}` : ''}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;


