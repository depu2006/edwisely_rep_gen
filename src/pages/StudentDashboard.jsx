import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import ReportBuilder from './ReportBuilder';
import '../App.css';

function StudentDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Student";
  
  const [data, setData] = useState([]);
  const [filterSubject, setFilterSubject] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [columns, setColumns] = useState({
    subject: true, exam: true, score: true, date: true
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetch("https://edwisely-rep-gen.onrender.com/students")
      .then(res => res.json())
      .then(fetched => {
        // Filter purely for the logged-in student if they have records, otherwise show all data as fallback for demo
        const personalRecords = fetched.filter(d => d.name === name);
        const dataSource = personalRecords.length > 0 ? personalRecords : fetched;

        const formatted = [];
        dataSource.forEach((d, i) => {
          // Split MongoDB single row into 3 subjects
          if (d.math_score !== undefined) formatted.push({ id: `${i}-math`, subject: 'Mathematics', score: d.math_score, exam: d.exam || 'General Exam', date: '2024-03-01' });
          if (d.reading_score !== undefined) formatted.push({ id: `${i}-read`, subject: 'Reading', score: d.reading_score, exam: d.exam || 'General Exam', date: '2024-03-02' });
          if (d.writing_score !== undefined) formatted.push({ id: `${i}-write`, subject: 'Writing', score: d.writing_score, exam: d.exam || 'General Exam', date: '2024-03-03' });
        });
        
        setData(formatted);
      });
  }, [name]);

  const filteredData = useMemo(() => {
    let filtered = [...data];
    if (filterSubject !== 'All') {
      filtered = filtered.filter(d => d.subject === filterSubject);
    }
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [data, filterSubject, sortConfig]);

  const progressData = filteredData.slice(0, 15).map((d, i) => ({
    name: "Test " + (i+1),
    score: d.score
  }));

  const toggleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const toggleColumn = (col) => setColumns(p => ({ ...p, [col]: !p[col] }));

  // Generate Report Feature
  const downloadReport = () => {
    if (filteredData.length === 0) return alert("No data to download!");
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Subject,Exam,Score,Date\n";
    filteredData.forEach(row => {
      csvContent += `${row.subject},${row.exam},${row.score},${row.date}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Report_${name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalScore = filteredData.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = filteredData.length ? (totalScore / filteredData.length).toFixed(1) : 0;
  
  const scrollToData = () => {
    document.getElementById("data-section").scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="app-wrapper">
      
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Edwisely</h1>
          <span>Academic Companion</span>
        </div>
        <div className="nav-menu">
          <a href="#" className={`nav-link ${!showAdvanced ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setShowAdvanced(false); }}>Home</a>
          <a href="#" className={`nav-link ${showAdvanced ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setShowAdvanced(true); }}>Report Builder</a>
          <a href="#data-section" className="nav-link" onClick={() => setShowAdvanced(false)}>Analytics</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate('/'); }}>Logout</a>
        </div>
      </nav>

      <div className="main-container">
        
        {/* Hero Area */}
        {!showAdvanced ? (
          <div className="hero-section">
            <div className="hero-glass">
              <h2 className="hero-title">Your Academic <br/>Journey, <br/>Made Simple</h2>
              <p className="hero-desc">
                Track grades, monitor progressive learning, manage assignments, and 
                prioritize your intellectual wellness — all in one place.
              </p>
              <div className="hero-actions">
                <button className="pill-btn solid" onClick={scrollToData}>View Performance</button>
                <button className="pill-btn" onClick={() => setShowAdvanced(true)}>Advanced Reports &gt;</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="advanced-report-section" style={{ width: '100%' }}>
             <ReportBuilder studentData={data} />
          </div>
        )}

        {!showAdvanced && (
          <>
            {/* 3 Bottom Cards Grid */}
            <div className="bottom-cards-grid">
              <div className="brown-glass-card">
                <div className="card-index">01</div>
                <h3 className="card-title">Current Standing</h3>
                <p className="card-desc">
                  Your overall average score sits solidly at {avgScore}%.
                  Keep pushing forward!
                </p>
              </div>
              <div className="brown-glass-card">
                <div className="card-index">02</div>
                <h3 className="card-title">Subject Mastery</h3>
                <p className="card-desc">
                  Your data spans {data.length} recorded grading checkpoints across reading, writing, and math.
                </p>
              </div>
              <div className="brown-glass-card">
                <div className="card-index">03</div>
                <h3 className="card-title">Latest Highlight</h3>
                <p className="card-desc">
                  Scores are recorded and synced directly from your teachers. 
                  Always up to date.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Data Section (Scroll down) */}
      {!showAdvanced && (
        <div id="data-section" className="data-section">
          <div className="content-grid">
            <div className="glass-box">
              <h2 className="section-title">Aggregated Progress Over Time</h2>
              <div style={{ height: '300px', width: '100%', marginTop: '2rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '1rem', color: 'var(--text-dark)' }} />
                    <Line type="monotone" dataKey="score" stroke="var(--accent-brown)" strokeWidth={4} dot={{ r: 6, fill: 'var(--accent-light)' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-box">
              <h2 className="section-title">Focus Area Metrics</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Isolate performance by subject track. View precise test marks across specific disciplines directly below.
              </p>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Discipline Highlight</label>
              <select className="filter-select" style={{ width: '100%' }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                <option value="All">Complete Overview (All Subjects)</option>
                <option value="Mathematics">Mathematics Core</option>
                <option value="Reading">Reading / Comprehension</option>
                <option value="Writing">Writing / Composition</option>
              </select>
            </div>
          </div>

          <div className="glass-box" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Academic Record List</h2>
            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table>
                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)' }}>
                  <tr>
                    {columns.subject && <th onClick={() => toggleSort('subject')} style={{cursor:'pointer'}}>Track/Subject {sortConfig.key==='subject' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.exam && <th onClick={() => toggleSort('exam')} style={{cursor:'pointer'}}>Assessment {sortConfig.key==='exam' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.score && <th onClick={() => toggleSort('score')} style={{cursor:'pointer'}}>Points Attained {sortConfig.key==='score' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.date && <th onClick={() => toggleSort('date')} style={{cursor:'pointer'}}>Publish Date {sortConfig.key==='date' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? filteredData.slice(0, 150).map((row, idx) => (
                    <tr key={idx}>
                      {columns.subject && <td style={{ fontWeight: 600 }}>{row.subject}</td>}
                      {columns.exam && <td>{row.exam}</td>}
                      {columns.score && <td><span style={{ fontWeight: 'bold' }}>{row.score}%</span></td>}
                      {columns.date && <td>{row.date}</td>}
                    </tr>
                  )) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records strictly match this filter scope.</td></tr>
                  )}
                </tbody>
              </table>
              {filteredData.length > 150 && <div style={{textAlign:'center', padding:'1rem', color:'var(--text-muted)'}}>Showing 150 of {filteredData.length} checkpoints. Use filters to query.</div>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentDashboard;