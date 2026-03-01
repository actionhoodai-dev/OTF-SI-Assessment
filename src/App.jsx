import React, { useState, useEffect, useRef } from 'react';
import { ASSESSMENT_STRUCTURE } from './data/assessmentData';
import { saveAssessment } from './services/api';
import { downloadPDF } from './services/pdfGenerator';
import { ChevronDown, ChevronRight, Save, FileText, CheckCircle, Search, PlusCircle, Activity } from 'lucide-react';

const Header = () => (
    <header className="app-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Activity size={28} />
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>OTF SI Inventory Assessment</h1>
        </div>
    </header>
);

const PatientManagement = ({ onSelectPatient, onNewPatient }) => {
    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div className="card text-center animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
                <h2 className="section-title text-center" style={{ borderBottom: 'none', marginBottom: '2rem' }}>Patient Dashboard</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={onNewPatient} style={{ fontSize: '1.2rem', padding: '1rem' }}>
                        <PlusCircle style={{ marginRight: '0.5rem' }} /> Start New Assessment
                    </button>

                    <div style={{ margin: '1.5rem 0', position: 'relative' }}>
                        <hr style={{ borderTop: '1px solid var(--border)', borderBottom: 'none' }} />
                        <span style={{
                            position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                            background: 'white', padding: '0 10px', color: 'var(--text-muted)'
                        }}>OR</span>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input
                            type="text"
                            placeholder="Search existing patients..."
                            style={{ paddingLeft: '3rem', fontSize: '1.1rem' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const PatientIntakeForm = ({ patientInfo, setPatientInfo, onNext }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPatientInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <h2 className="section-title">Demographic Data</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label className="text-bold text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                        <input required type="text" name="name" value={patientInfo.name || ''} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-bold text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Date of Assessment</label>
                        <input required type="date" name="assessmentDate" value={patientInfo.assessmentDate || ''} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-bold text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Date of Birth</label>
                        <input required type="date" name="dob" value={patientInfo.dob || ''} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-bold text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Age & Sex</label>
                        <input required type="text" name="ageSex" value={patientInfo.ageSex || ''} onChange={handleChange} placeholder="e.g. 5 M" />
                    </div>
                    <div>
                        <label className="text-bold text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Informant</label>
                        <input type="text" name="informant" value={patientInfo.informant || ''} onChange={handleChange} />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="text-bold text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Address</label>
                    <textarea name="address" rows="2" value={patientInfo.address || ''} onChange={handleChange}></textarea>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label className="text-bold text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Chief Complaints</label>
                    <textarea style={{ minHeight: '100px' }} required name="chiefComplaints" rows="3" value={patientInfo.chiefComplaints || ''} onChange={handleChange}></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>
                        Start Assessment <ChevronRight size={18} style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </form>
        </div>
    );
};

const ToggleQuestion = ({ question, sectionId, subId, value, onChange }) => {
    return (
        <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
            <div style={{ flex: '1', paddingRight: '2rem', fontSize: '0.95rem' }}>
                {question.text}
            </div>
            <div style={{ width: '160px', flexShrink: 0 }}>
                <div className="toggle-group">
                    <button
                        type="button"
                        className={`toggle-btn ${value === 'YES' ? 'selected-yes' : ''}`}
                        onClick={() => onChange('YES')}
                    >
                        YES
                    </button>
                    <button
                        type="button"
                        className={`toggle-btn ${value === 'NO' ? 'selected-no' : ''}`}
                        onClick={() => onChange('NO')}
                    >
                        NO
                    </button>
                </div>
            </div>
        </div>
    );
};

const SubsectionCard = ({ section, sub, assessmentData, handleQuestionChange }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="card" style={{ marginBottom: '1rem', padding: '1rem 1.5rem' }}>
            <div
                className="subsection-title"
                onClick={() => setIsOpen(!isOpen)}
                style={{ margin: 0 }}
            >
                <span>{sub.title}</span>
                {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>

            {isOpen && (
                <div className="animate-fade-in" style={{ marginTop: '1.5rem' }}>
                    {sub.questions.map(q => {
                        const key = `${section.id}_${sub.id}_${q.id}`;
                        return (
                            <ToggleQuestion
                                key={key}
                                question={q}
                                value={assessmentData[key]}
                                onChange={(val) => handleQuestionChange(key, val)}
                            />
                        );
                    })}

                    <div style={{ marginTop: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <label className="text-bold text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Section Comments
                        </label>
                        <textarea
                            rows="3"
                            placeholder="Add observations..."
                            style={{ background: 'white' }}
                            value={assessmentData[`${section.id}_${sub.id}_Comments`] || ''}
                            onChange={(e) => handleQuestionChange(`${section.id}_${sub.id}_Comments`, e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
    const [view, setView] = useState('dashboard'); // dashboard, intake, assessment, success
    const [patientInfo, setPatientInfo] = useState({});
    const [assessmentData, setAssessmentData] = useState({});
    const [activeSection, setActiveSection] = useState(ASSESSMENT_STRUCTURE[0].id);
    const [isSaving, setIsSaving] = useState(false);

    const sectionRefs = useRef({});

    // Auto-save logic
    useEffect(() => {
        if (view === 'assessment' && Object.keys(assessmentData).length > 0) {
            const timer = setTimeout(() => {
                console.log("Auto-saving data locally...");
                localStorage.setItem('otf_draft_assessment', JSON.stringify({ patientInfo, assessmentData }));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [assessmentData, patientInfo, view]);

    // Load draft on mount
    useEffect(() => {
        const draft = localStorage.getItem('otf_draft_assessment');
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                if (parsed.patientInfo) setPatientInfo(parsed.patientInfo);
                if (parsed.assessmentData) setAssessmentData(parsed.assessmentData);
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    const handleStartNew = () => {
        const today = new Date().toISOString().split('T')[0];
        setPatientInfo({ assessmentDate: today });
        setAssessmentData({});
        setView('intake');
    };

    const handleQuestionChange = (key, val) => {
        setAssessmentData(prev => ({ ...prev, [key]: val }));
    };

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = sectionRefs.current[id];
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handleSubmitFinal = async () => {
        if (window.confirm("Are you sure you want to finalize this assessment?")) {
            setIsSaving(true);
            try {
                const payload = {
                    patientInfo,
                    assessmentData
                };
                await saveAssessment(payload);
                localStorage.removeItem('otf_draft_assessment');
                setView('success');
            } catch (error) {
                alert("Failed to save to database. Please check connection.");
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleDownloadPDF = () => {
        downloadPDF(patientInfo, assessmentData);
    };

    return (
        <div className="app-container">
            <Header />

            {view === 'dashboard' && (
                <PatientManagement onNewPatient={handleStartNew} />
            )}

            {view === 'intake' && (
                <div className="container" style={{ padding: '2rem 1rem' }}>
                    <button className="btn btn-secondary" style={{ marginBottom: '1rem' }} onClick={() => setView('dashboard')}>
                        ← Back to Dashboard
                    </button>
                    <PatientIntakeForm
                        patientInfo={patientInfo}
                        setPatientInfo={setPatientInfo}
                        onNext={() => setView('assessment')}
                    />
                </div>
            )}

            {view === 'assessment' && (
                <div style={{ paddingBottom: '100px' }}>
                    {/* Sticky Navigation */}
                    <div className="nav-tabs glass-header">
                        {ASSESSMENT_STRUCTURE.map(section => (
                            <div
                                key={section.id}
                                className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => scrollToSection(section.id)}
                            >
                                {section.title}
                            </div>
                        ))}
                    </div>

                    <div className="container" style={{ marginTop: '2rem', maxWidth: '900px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{patientInfo.name} - Clinical Assessment</h2>
                                <p className="text-muted" style={{ margin: 0 }}>Auto-saving initialized.</p>
                            </div>
                            <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={18} /> Preview PDF
                            </button>
                        </div>

                        {ASSESSMENT_STRUCTURE.map(section => (
                            <div
                                key={section.id}
                                id={section.id}
                                ref={(el) => (sectionRefs.current[section.id] = el)}
                                style={{ marginBottom: '4rem', scrollMarginTop: '100px' }}
                            >
                                <h2 className="section-title text-center" style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>
                                    {section.title}
                                </h2>

                                {section.subsections.map(sub => (
                                    <SubsectionCard
                                        key={`${section.id}_${sub.id}`}
                                        section={section}
                                        sub={sub}
                                        assessmentData={assessmentData}
                                        handleQuestionChange={handleQuestionChange}
                                    />
                                ))}
                            </div>
                        ))}

                        <div className="card text-center" style={{ marginTop: '4rem', padding: '3rem', background: 'var(--primary-color)', color: 'white' }}>
                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Assessment Complete</h3>
                            <p style={{ opacity: 0.9, marginBottom: '2rem' }}>Please review all sections before final submission.</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button
                                    className="btn"
                                    style={{ background: 'white', color: 'var(--primary-color)' }}
                                    onClick={handleDownloadPDF}
                                >
                                    <FileText size={18} style={{ marginRight: '0.5rem' }} /> Download PDF
                                </button>
                                <button
                                    className="btn"
                                    style={{ background: 'var(--success)', color: 'white' }}
                                    onClick={handleSubmitFinal}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Submit to Database</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'success' && (
                <div className="container" style={{ marginTop: '4rem' }}>
                    <div className="card text-center animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem' }}>
                        <CheckCircle size={80} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
                        <h2 className="section-title" style={{ borderBottom: 'none' }}>Successfully Submitted</h2>
                        <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                            The assessment for <strong>{patientInfo.name}</strong> has been saved to the database.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
                            <button className="btn btn-primary" onClick={handleDownloadPDF}>
                                <FileText size={18} style={{ marginRight: '0.5rem' }} /> Download Final PDF
                            </button>
                            <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
