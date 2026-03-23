import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const mockReports = [
  { id: 101, dept: 'Computer Science', students: 120, avgScore: 82, passRate: 95, date: '2023-11-20' },
  { id: 102, dept: 'Mechanical', students: 85, avgScore: 75, passRate: 88, date: '2023-11-21' },
  { id: 103, dept: 'Electrical', students: 90, avgScore: 78, passRate: 90, date: '2023-11-22' },
  { id: 104, dept: 'Civil', students: 78, avgScore: 71, passRate: 85, date: '2023-11-25' },
  { id: 105, dept: 'Computer Science', students: 125, avgScore: 85, passRate: 97, date: '2024-03-10' },
  { id: 106, dept: 'Mechanical', students: 85, avgScore: 77, passRate: 89, date: '2024-03-12' },
];

const performanceData = [
  { name: 'Jan', CSE: 80, ME: 72, EE: 75 },
  { name: 'Feb', actual: 82, ME: 74, EE: 76 },
  { name: 'Mar', actual: 85, ME: 77, EE: 78 },
  { name: 'Apr', actual: 81, ME: 75, EE: 74 },
  { name: 'May', actual: 86, ME: 78, EE: 79 },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Admin";
  
  const [filterDept, setFilterDept] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [minPassRate, setMinPassRate] = useState(0);
  
  const [columns, setColumns] = useState({
    id: true, dept: true, students: true, avgScore: true, passRate: true, date: true
  });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const filteredData = useMemo(() => {
    let data = [...mockReports];
    if (filterDept !== 'All') data = data.filter(d => d.dept === filterDept);
    if (dateRange.start) data = data.filter(d => d.date >= dateRange.start);
    if (dateRange.end) data = data.filter(d => d.date <= dateRange.end);
    if (minPassRate > 0) data = data.filter(d => d.passRate >= minPassRate);

    data.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [mockReports, filterDept, dateRange, minPassRate, sortConfig]);

  const toggleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  const toggleColumn = (col) => setColumns(p => ({ ...p, [col]: !p[col] }));

  const totalStudents = filteredData.reduce((acc, curr) => acc + curr.students, 0);
  const avgInstitutionScore = filteredData.length ? 
    (filteredData.reduce((acc, curr) => acc + curr.avgScore, 0) / filteredData.length).toFixed(1) : 0;

  const scrollToData = () => {
    document.getElementById("data-section").scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="app-wrapper">
      
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Edwisely</h1>
          <span>Central Administration</span>
        </div>
        <div className="nav-menu">
          <a href="#" className="nav-link active">Home</a>
          <a href="#data-section" className="nav-link">System Reports</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate('/'); }}>Logout</a>
        </div>
      </nav>

      <div className="main-container">
        
        {/* Hero Area */}
        <div className="hero-section">
          <div className="hero-glass">
            <h2 className="hero-title">Master Control, <br/>Perfect Visibility</h2>
            <p className="hero-desc">
              Monitor institutional performance, manage departmental success metrics, 
              run customized global reports, and oversee overall student growth.
            </p>
            <div className="hero-actions">
              <button className="pill-btn solid" onClick={scrollToData}>Custom Report Builder</button>
              <button className="pill-btn">System Settings</button>
              <button className="pill-btn">Export Directory &gt;</button>
            </div>
          </div>
        </div>

        {/* 3 Bottom Cards Grid */}
        <div className="bottom-cards-grid">
          <div className="brown-glass-card">
            <div className="card-index">01</div>
            <h3 className="card-title">Global Reach</h3>
            <p className="card-desc">
              Tracking a total of {totalStudents} active students currently matching 
              your departmental filters.
            </p>
          </div>
          <div className="brown-glass-card">
            <div className="card-index">02</div>
            <h3 className="card-title">Performance Benchmark</h3>
            <p className="card-desc">
              The aggregate institutional average stands at {avgInstitutionScore}%. 
              This metric dynamically recalculates upon filtering.
            </p>
          </div>
          <div className="brown-glass-card">
            <div className="card-index">03</div>
            <h3 className="card-title">Report Integrity</h3>
            <p className="card-desc">
              {filteredData.length} valid report records have securely pulled into 
              your active query environment.
            </p>
          </div>
        </div>

      </div>

      {/* Data Section (Scroll down) */}
      <div id="data-section" className="data-section">
        
        <div className="content-grid">
          
          <div className="glass-box">
            <h2 className="section-title">Institutional Growth Vectors</h2>
            <div style={{ height: '300px', width: '100%', marginTop: '2rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorCSE" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-brown)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent-brown)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorME" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-light)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent-light)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '1rem', color: 'var(--text-dark)' }} />
                  <Area type="monotone" dataKey="CSE" stroke="var(--accent-brown)" fillOpacity={1} fill="url(#colorCSE)" />
                  <Area type="monotone" dataKey="ME" stroke="var(--accent-light)" fillOpacity={1} fill="url(#colorME)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-box">
            <h2 className="section-title">Central Report Engine</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Configure precision filters directly. Lock in Date ranges, target specific Departments, 
              and impose minimum pass ratios below.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Department Parameter</label>
                <select className="filter-select" style={{ width: '100%' }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                  <option value="All">Institution Wide (All Units)</option>
                  <option value="Computer Science">School of Computer Science</option>
                  <option value="Mechanical">School of Mechanical Eng.</option>
                  <option value="Electrical">School of Electrical Eng.</option>
                  <option value="Civil">School of Civil Eng.</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Start Timeline</label>
                  <input type="date" className="filter-input" style={{ width: '100%' }} value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>End Timeline</label>
                  <input type="date" className="filter-input" style={{ width: '100%' }} value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Threshold: Min Pass Rate (%)</label>
                <input type="number" className="filter-input" style={{ width: '100%' }} min="0" max="100" value={minPassRate} onChange={e => setMinPassRate(Number(e.target.value))} />
              </div>

            </div>
          </div>
        </div>

        <div className="glass-box" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">
              Dynamic Repository Extract
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Configure Columns:</span>
                <select className="filter-select" style={{ padding: '0.5rem 1rem' }} onChange={e => toggleColumn(e.target.value)}>
                  <option value="">-- Toggle Visibility --</option>
                  {Object.keys(columns).map(col => <option key={col} value={col}>{col.toUpperCase()} ({columns[col]?'Visible':'Hidden'})</option>)}
                </select>
              </div>
            </h2>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {columns.id && <th onClick={() => toggleSort('id')} style={{cursor:'pointer'}}>Entry ID {sortConfig.key==='id' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.dept && <th onClick={() => toggleSort('dept')} style={{cursor:'pointer'}}>Department Entity {sortConfig.key==='dept' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.students && <th onClick={() => toggleSort('students')} style={{cursor:'pointer'}}>Headcount {sortConfig.key==='students' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.avgScore && <th onClick={() => toggleSort('avgScore')} style={{cursor:'pointer'}}>Global Avg. {sortConfig.key==='avgScore' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.passRate && <th onClick={() => toggleSort('passRate')} style={{cursor:'pointer'}}>Graduation Index {sortConfig.key==='passRate' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.date && <th onClick={() => toggleSort('date')} style={{cursor:'pointer'}}>Verification Date {sortConfig.key==='date' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? filteredData.map(row => (
                    <tr key={row.id}>
                      {columns.id && <td><span className="badge badge-success">IDX-{row.id}</span></td>}
                      {columns.dept && <td style={{ fontWeight: 600 }}>{row.dept}</td>}
                      {columns.students && <td>{row.students} enrolled</td>}
                      {columns.avgScore && <td>{row.avgScore}%</td>}
                      {columns.passRate && <td>
                        <span style={{ color: row.passRate >= 90 ? '#065f46' : '#92400e', fontWeight: 'bold' }}>
                          {row.passRate}%
                        </span>
                      </td>}
                      {columns.date && <td>{row.date}</td>}
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Current constraints yielded no valid institutional records.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;