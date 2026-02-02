import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download, Printer, Edit3, Sparkles } from 'lucide-react';
import api from '../../services/api';
import useDashboardStore from '../../store/dashboardStore';

const ResumeBuilder = () => {
    const resumeRef = useRef();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const { user } = useDashboardStore();

    // Mock Resume Data (Aggregated)
    const [resumeData, setResumeData] = useState({
        name: user.name || "Om Singh",
        role: "Full Stack Developer",
        email: "omsin@dev.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        summary: "Passionate developer with a knack for building scalable web applications. Proven track record in full-stack development, with a focus on modern React ecosystems and Node.js microservices. Active open-source contributor.",
        skills: ["React", "Node.js", "TypeScript", "MongoDB", "Tailwind CSS", "AWS", "Docker", "Svelte"],
        experience: [
            {
                role: "Senior Frontend Engineer",
                company: "TechNova Inc.",
                date: "2023 - Present",
                points: [
                    "Led the migration of legacy dashboard to Next.js, improving load items by 40%.",
                    "Mentored 3 junior developers and established code review protocols."
                ]
            },
            {
                role: "Software Developer",
                company: "Creativ Studios",
                date: "2021 - 2023",
                points: [
                    "Built 15+ client websites using React and Gatsby.",
                    "Implemented CI/CD pipelines reducing deployment time by 50%."
                ]
            }
        ],
        projects: [
            {
                name: "Dev Companion OS",
                tech: "MERN Stack",
                desc: "A comprehensive developer productivity platform featuring GitHub integration, LeetCode tracking, and daily goal management."
            },
            {
                name: "AI Resume Builder",
                tech: "OpenAI + React",
                desc: "Automated resume generator that parses user profiles and creates professional PDF resumes."
            }
        ]
    });

    const handleDownload = async () => {
        setIsGenerating(true);
        const element = resumeRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const data = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('resume.pdf');
        setIsGenerating(false);
    };

    const handleEnhance = async () => {
        setIsEnhancing(true);
        try {
            // Enhancing Summary
            // In prod: pass actual text. Here mock endpoint ignores it anyway for specific responses.
            const resSummary = await api.post('/ai/resume-enhance', {
                text: resumeData.summary,
                type: 'summary'
            });

            // Enhancing First Experience Point (Mock demo)
            const resExp = await api.post('/ai/resume-enhance', {
                text: resumeData.experience[0].points[0],
                type: 'experience'
            });

            setResumeData(prev => ({ // setResumeData function was missing from local state, need to fix that too!
                ...prev,
                summary: resSummary.data.enhanced,
                experience: prev.experience.map((exp, i) =>
                    i === 0 ? { ...exp, points: [resExp.data.enhanced, exp.points[1]] } : exp
                )
            }));

        } catch (err) {
            console.error("AI Enhancement failed", err);
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Resume Forge</h1>
                    <p className="text-text-muted mt-1">Craft your career story.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost"><Edit3 className="w-4 h-4 mr-2" /> Edit Data</Button>
                    <Button onClick={handleDownload} disabled={isGenerating}>
                        {isGenerating ? <Printer className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor / Controls (Placeholder) */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="font-bold mb-4">Content Source</h3>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm p-3 bg-surfaceHighlight rounded border border-primary/20">
                                <input type="radio" name="source" defaultChecked className="text-primary" />
                                <span>Auto-Sync (GitHub + Profile)</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm p-3 bg-surfaceHighlight rounded border border-border">
                                <input type="radio" name="source" className="text-primary" />
                                <span>Manual Entry</span>
                            </label>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold mb-4">AI Enhancements</h3>
                        <p className="text-xs text-text-muted mb-4">Use AI to rewrite your bullet points for maximum impact.</p>
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={handleEnhance}
                            disabled={isEnhancing}
                        >
                            {isEnhancing ? <Sparkles className="w-4 h-4 mr-2 animate-spin" /> : "✨ Enhance with AI"}
                        </Button>
                    </Card>
                </div>

                {/* Resume Preview */}
                <div className="lg:col-span-2 overflow-auto bg-[#525659] p-8 rounded-xl flex justify-center shadow-inner">
                    <div
                        ref={resumeRef}
                        className="bg-white text-black w-[210mm] min-h-[297mm] p-10 shadow-2xl origin-top"
                        style={{ fontFamily: 'Times New Roman' }} // Using standard font for classic resume look, or switch to Sans
                    >
                        {/* Resume Content */}
                        <header className="border-b-2 border-gray-800 pb-6 mb-6">
                            <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{resumeData.name}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-sans">
                                <span>{resumeData.role}</span>
                                <span>•</span>
                                <span>{resumeData.email}</span>
                                <span>•</span>
                                <span>{resumeData.location}</span>
                            </div>
                        </header>

                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Professional Summary</h2>
                            <p className="text-sm leading-relaxed text-gray-700">{resumeData.summary}</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Technical Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {resumeData.skills.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-gray-100 text-xs font-bold rounded-md border border-gray-200">{skill}</span>
                                ))}
                            </div>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Experience</h2>
                            <div className="space-y-4">
                                {resumeData.experience.map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-gray-800">{exp.role}</h3>
                                            <span className="text-sm text-gray-600 italic">{exp.date}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-700 mb-2">{exp.company}</div>
                                        <ul className="list-disc list-outside ml-4 space-y-1 text-sm text-gray-600">
                                            {exp.points.map((pt, j) => (
                                                <li key={j}>{pt}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Key Projects</h2>
                            <div className="space-y-4">
                                {resumeData.projects.map((proj, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-gray-800">{proj.name}</h3>
                                            <span className="text-xs px-2 py-0.5 bg-black text-white rounded-full">{proj.tech}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{proj.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
