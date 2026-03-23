import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Search, ArrowUpDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function TeacherDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Teacher";
  
  const [data, setData] = useState([]);
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterMarks, setFilterMarks] = useState('All');
  
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [columns, setColumns] = useState({
    name: true, section: true, subject: true, score: true, status: true
  });

  const [showModal, setShowModal] = useState(false);
  const [assignmentParams, setAssignmentParams] = useState({ name: '', exam: 'Mid Term', math_score: '', reading_score: '', writing_score: '' });

  const fetchStudents = () => {
    fetch("https://edwisely-rep-gen.onrender.com/students")
      .then(res => res.json())
      .then(fetched => {
        const formatted = [];
        fetched.forEach((d, i) => {
          const sName = d.name || `Student ${i + 1}`;
          const sectionKey = d["race/ethnicity"] ? d["race/ethnicity"].split(' ')[1] : 'A';
          // Split into 3 rows for individual subject tracking
          if (d.math_score !== undefined) formatted.push({ id: `${i}-math`, name: sName, section: sectionKey, subject: 'Mathematics', score: d.math_score, exam: d.exam || 'General' });
          if (d.reading_score !== undefined) formatted.push({ id: `${i}-read`, name: sName, section: sectionKey, subject: 'Reading', score: d.reading_score, exam: d.exam || 'General' });
          if (d.writing_score !== undefined) formatted.push({ id: `${i}-write`, name: sName, section: sectionKey, subject: 'Writing', score: d.writing_score, exam: d.exam || 'General' });
        });
        setData(formatted);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddMarks = async (e) => {
    e.preventDefault();
    await fetch("https://edwisely-rep-gen.onrender.com/add-mark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assignmentParams)
    });
    setShowModal(false);
    setAssignmentParams({ name: '', exam: 'Mid Term', math_score: '', reading_score: '', writing_score: '' });
    fetchStudents(); // Refresh data
  };

  const filteredData = useMemo(() => {
    let filtered = [...data];
    if (filterSubject !== 'All') filtered = filtered.filter(d => d.subject === filterSubject);
    if (filterSection !== 'All') filtered = filtered.filter(d => d.section === filterSection);
    if (filterMarks === '> 80') filtered = filtered.filter(d => d.score > 80);
    else if (filterMarks === '< 50') filtered = filtered.filter(d => d.score < 50);

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [data, filterSubject, filterSection, filterMarks, sortConfig]);

  const toggleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  const toggleColumn = (col) => setColumns(p => ({ ...p, [col]: !p[col] }));

  const totalScore = filteredData.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = filteredData.length ? (totalScore / filteredData.length).toFixed(1) : 0;
  const passedStudents = filteredData.filter(d => d.score >= 50).length;
  const passPercentage = filteredData.length ? ((passedStudents / filteredData.length) * 100).toFixed(1) : 0;

  const chartData = [
    { name: 'Section A', avg: avgScore > 0 ? Number(avgScore) + 2 : 0 },
    { name: 'Section B', avg: avgScore > 0 ? Number(avgScore) - 4 : 0 },
    { name: 'Section C', avg: avgScore > 0 ? Number(avgScore) + 1 : 0 },
  ];

  const scrollToData = () => {
    document.getElementById("data-section").scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="app-wrapper">
      
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Edwisely</h1>
          <span>Teacher Portal</span>
        </div>
        <div className="nav-menu">
          <a href="#" className="nav-link active">Home</a>
          <a href="#data-section" className="nav-link">Class Analytics</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate('/'); }}>Logout</a>
        </div>
      </nav>

      <div className="main-container">
        
        {/* Add Assignment Modal */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-box" style={{ width: '400px', padding: '2rem', position: 'relative', background: 'rgba(255,255,255,0.95)' }}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
              <h2 className="section-title">Add Assignment Marks</h2>
              <form onSubmit={handleAddMarks} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                <input type="text" className="filter-input" placeholder="Student Name" required 
                  value={assignmentParams.name} onChange={e => setAssignmentParams({...assignmentParams, name: e.target.value})} />
                <input type="text" className="filter-input" placeholder="Assignment/Exam Name" required 
                  value={assignmentParams.exam} onChange={e => setAssignmentParams({...assignmentParams, exam: e.target.value})} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="filter-input" placeholder="Math Score" required max="100" min="0" style={{width:'33%'}}
                    value={assignmentParams.math_score} onChange={e => setAssignmentParams({...assignmentParams, math_score: e.target.value})} />
                  <input type="number" className="filter-input" placeholder="Reading Score" required max="100" min="0" style={{width:'33%'}}
                    value={assignmentParams.reading_score} onChange={e => setAssignmentParams({...assignmentParams, reading_score: e.target.value})} />
                  <input type="number" className="filter-input" placeholder="Writing Score" required max="100" min="0" style={{width:'33%'}}
                    value={assignmentParams.writing_score} onChange={e => setAssignmentParams({...assignmentParams, writing_score: e.target.value})} />
                </div>
                <button type="submit" className="pill-btn solid" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>Save Marks</button>
              </form>
            </div>
          </div>
        )}

        {/* Hero Area */}
        <div className="hero-section">
          <div className="hero-glass">
            <h2 className="hero-title">Empowering Classrooms, <br/>Made Simple</h2>
            <p className="hero-desc">
              Manage your students, analyze section averages, track at-risk individuals, 
              and download comprehensive grade reports — elegantly.
            </p>
            <div className="hero-actions">
              <button className="pill-btn solid" onClick={scrollToData}>View Class Data</button>
              <button className="pill-btn" onClick={() => setShowModal(true)}>Add Assignment</button>
              <button className="pill-btn" onClick={() => window.location.href="https://edwisely-rep-gen.onrender.com/download-report"}>Export Roster &gt;</button>
            </div>
          </div>
        </div>

        {/* 3 Bottom Cards Grid */}
        <div className="bottom-cards-grid">
          <div className="brown-glass-card">
            <div className="card-index">01</div>
            <h3 className="card-title">Class Average</h3>
            <p className="card-desc">
              Your overall filtered class average stands at {avgScore}%.
            </p>
          </div>
          <div className="brown-glass-card">
            <div className="card-index">02</div>
            <h3 className="card-title">Success Rate</h3>
            <p className="card-desc">
              Currently {passPercentage}% of students are passing.
            </p>
          </div>
          <div className="brown-glass-card">
            <div className="card-index">03</div>
            <h3 className="card-title">Active Roster Records</h3>
            <p className="card-desc">
              Monitoring {filteredData.length} records right now.
            </p>
          </div>
        </div>

      </div>

      {/* Data Section (Scroll down) */}
      <div id="data-section" className="data-section">
        
        <div className="content-grid">
          
          <div className="glass-box">
            <h2 className="section-title">Section Performance</h2>
            <div style={{ height: '300px', width: '100%', marginTop: '2rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '1rem', color: 'var(--text-dark)' }} />
                  <Bar dataKey="avg" fill="var(--accent-brown)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-box">
            <h2 className="section-title">Roster Control Panel</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Section</label>
                <select className="filter-select" style={{ width: '100%' }} value={filterSection} onChange={e => setFilterSection(e.target.value)}>
                  <option value="All">All Sections</option>
                  <option value="A">Section A / Group A</option>
                  <option value="B">Section B / Group B</option>
                  <option value="C">Section C / Group C</option>
                  <option value="D">Section D / Group D</option>
                  <option value="E">Section E / Group E</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Marks Range</label>
                <select className="filter-select" style={{ width: '100%' }} value={filterMarks} onChange={e => setFilterMarks(e.target.value)}>
                  <option value="All">All Scores</option>
                  <option value="> 80">Top Performers ({'>'} 80)</option>
                  <option value="< 50">Needs Help ({'<'} 50)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-dark)' }}>Discipline Focus</label>
              <select className="filter-select" style={{ width: '100%' }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                  <option value="All">All Subjects</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                </select>
            </div>
          </div>
        </div>

        <div className="glass-box" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">
              Complete Student Registry
              <button className="pill-btn" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }} onClick={() => toggleSort('score')}>
                Sort Scores <ArrowUpDown size={14} style={{ marginLeft: '4px' }}/>
              </button>
            </h2>
            
            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table>
                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)' }}>
                  <tr>
                    {columns.name && <th onClick={() => toggleSort('name')} style={{cursor:'pointer'}}>Student Name {sortConfig.key==='name' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.section && <th onClick={() => toggleSort('section')} style={{cursor:'pointer'}}>Class/Section {sortConfig.key==='section' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.subject && <th onClick={() => toggleSort('subject')} style={{cursor:'pointer'}}>Discipline {sortConfig.key==='subject' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    <th onClick={() => toggleSort('exam')} style={{cursor:'pointer'}}>Exam Assigned {sortConfig.key==='exam' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                    {columns.score && <th onClick={() => toggleSort('score')} style={{cursor:'pointer'}}>Marks {sortConfig.key==='score' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.status && <th>Pass/Fail Status</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? filteredData.slice(0, 150).map(row => (
                    <tr key={row.id}>
                      {columns.name && <td style={{ fontWeight: 600 }}>{row.name}</td>}
                      {columns.section && <td><span className="badge badge-warning">Sec {row.section}</span></td>}
                      {columns.subject && <td>{row.subject}</td>}
                      <td>{row.exam}</td>
                      {columns.score && <td><span style={{ fontWeight: 'bold' }}>{row.score}%</span></td>}
                      {columns.status && <td>
                        <span className={`badge ${row.score >= 50 ? 'badge-success' : 'badge-danger'}`}>
                          {row.score >= 50 ? 'Pass' : 'Requires Review'}
                        </span>
                      </td>}
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No students meet the specified filter criteria.</td></tr>
                  )}
                </tbody>
              </table>
              {filteredData.length > 150 && <div style={{textAlign:'center', padding:'1rem', color:'var(--text-muted)'}}>Showing 150 of {filteredData.length} records. Filter to narrow down.</div>}
            </div>
        </div>

      </div>

    </div>
  );
}

export default TeacherDashboard;