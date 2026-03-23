import React, { useState, useMemo } from 'react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const mockKPIs = [
  { id: 'Q1', region: 'North', revenue: 120000, students: 4500, growth: 12, target: 110000 },
  { id: 'Q2', region: 'North', revenue: 135000, students: 4800, growth: 15, target: 125000 },
  { id: 'Q3', region: 'North', revenue: 150000, students: 5200, growth: 18, target: 140000 },
  { id: 'Q1', region: 'South', revenue: 95000, students: 3200, growth: 8, target: 100000 },
  { id: 'Q2', region: 'South', revenue: 105000, students: 3500, growth: 10, target: 100000 },
  { id: 'Q3', region: 'South', revenue: 115000, students: 3800, growth: 12, target: 110000 },
];

const trendData = [
  { month: 'Jan', actual: 4000, forecast: 4100 },
  { month: 'Feb', actual: 4500, forecast: 4600 },
  { month: 'Mar', actual: 4800, forecast: 5000 },
  { month: 'Apr', actual: 5100, forecast: 5300 },
  { month: 'May', actual: 5600, forecast: 5700 },
  { month: 'Jun', actual: null, forecast: 6200 },
];

function BusinessDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Executive";
  
  const [filterRegion, setFilterRegion] = useState('All');
  const [metricType, setMetricType] = useState('revenue');
  
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [columns, setColumns] = useState({
    id: true, region: true, revenue: true, students: true, growth: true, target: true
  });

  const filteredData = useMemo(() => {
    let data = [...mockKPIs];
    if (filterRegion !== 'All') data = data.filter(d => d.region === filterRegion);

    data.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [mockKPIs, filterRegion, sortConfig]);

  const toggleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  const toggleColumn = (col) => setColumns(p => ({ ...p, [col]: !p[col] }));

  const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.revenue, 0);
  const avgGrowth = filteredData.length ? 
    (filteredData.reduce((acc, curr) => acc + curr.growth, 0) / filteredData.length).toFixed(1) : 0;

  const scrollToData = () => {
    document.getElementById("data-section").scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="app-wrapper">
      
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Edwisely Biz</h1>
          <span>Executive Intelligence</span>
        </div>
        <div className="nav-menu">
          <a href="#" className="nav-link active">Overview</a>
          <a href="#data-section" className="nav-link">Market Strategy</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate('/'); }}>Sign Out</a>
        </div>
      </nav>

      <div className="main-container">
        
        {/* Hero Area */}
        <div className="hero-section">
          <div className="hero-glass">
            <h2 className="hero-title">Business Growth, <br/>Made Predictable</h2>
            <p className="hero-desc">
              Understand revenue streams, target acquisition goals, model upcoming quarters, 
              and make data-driven decisions that shape the future.
            </p>
            <div className="hero-actions">
              <button className="pill-btn solid" onClick={scrollToData}>View Financials</button>
              <button className="pill-btn">Market Analysis</button>
              <button className="pill-btn">Strategy Deck &gt;</button>
            </div>
          </div>
        </div>

        {/* 3 Bottom Cards Grid */}
        <div className="bottom-cards-grid">
          <div className="brown-glass-card">
            <div className="card-index">01</div>
            <h3 className="card-title">Accumulated Capital</h3>
            <p className="card-desc">
              Current active filtering shows ${(totalRevenue / 1000).toFixed(1)}k collected across 
              select regional operations.
            </p>
          </div>
          <div className="brown-glass-card">
            <div className="card-index">02</div>
            <h3 className="card-title">Scaling Velocity</h3>
            <p className="card-desc">
              Driving a +{avgGrowth}% consistent acceleration trajectory 
              in core operational sectors compared to previous cycles.
            </p>
          </div>
          <div className="brown-glass-card">
            <div className="card-index">03</div>
            <h3 className="card-title">Goal Adherence</h3>
            <p className="card-desc">
              Target projections are maintaining 94% achievement accuracy 
              against baseline budget constraints.
            </p>
          </div>
        </div>

      </div>

      {/* Data Section (Scroll down) */}
      <div id="data-section" className="data-section">
        
        <div className="content-grid">
          
          <div className="glass-box">
            <h2 className="section-title">Revenue Forecast Modeling</h2>
            <div style={{ height: '300px', width: '100%', marginTop: '2rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '1rem', color: 'var(--text-dark)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="actual" fill="var(--accent-brown)" name="Actual Acquisitions" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="forecast" stroke="var(--accent-light)" strokeWidth={3} strokeDasharray="5 5" name="Predictive Engine" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-box">
            <h2 className="section-title">Macro Data Tuning</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Switch perspectives rapidly. Limit the scope by geographical territory, 
              focus heavily on fiscal or enrollment traits, and construct the precise view you require.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-dark)' }}>Geographical Region</label>
                <select className="filter-select" style={{ width: '100%' }} value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
                  <option value="All">Global Market (All Regions)</option>
                  <option value="North">Northern Hemisphere Sector</option>
                  <option value="South">Southern Hemisphere Sector</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-dark)' }}>Core KPI Focus</label>
                <select className="filter-select" style={{ width: '100%' }} value={metricType} onChange={e => setMetricType(e.target.value)}>
                  <option value="revenue">Financial Tracking</option>
                  <option value="students">Customer/Student Base Expansion</option>
                  <option value="growth">YoY Growth Percentages</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-dark)' }}>Metrics Dashboard Output</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {Object.keys(columns).map(col => (
                    <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-dark)' }}>
                      <input type="checkbox" checked={columns[col]} onChange={() => toggleColumn(col)} style={{ accentColor: 'var(--accent-brown)' }}/>
                      {col.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="glass-box" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">
              Financial Strategy Matrix
            </h2>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {columns.id && <th onClick={() => toggleSort('id')} style={{cursor:'pointer'}}>Fiscal Term {sortConfig.key==='id' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.region && <th onClick={() => toggleSort('region')} style={{cursor:'pointer'}}>Territory {sortConfig.key==='region' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.revenue && <th onClick={() => toggleSort('revenue')} style={{cursor:'pointer'}}>Net Returns {sortConfig.key==='revenue' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.students && <th onClick={() => toggleSort('students')} style={{cursor:'pointer'}}>Total Userbase {sortConfig.key==='students' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.growth && <th onClick={() => toggleSort('growth')} style={{cursor:'pointer'}}>Velocity YoY {sortConfig.key==='growth' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                    {columns.target && <th onClick={() => toggleSort('target')} style={{cursor:'pointer'}}>Goal Benchmark {sortConfig.key==='target' && (sortConfig.direction==='asc'?'↑':'↓')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? filteredData.map((row, i) => {
                    const metTarget = row.revenue >= row.target;
                    return (
                      <tr key={i}>
                        {columns.id && <td><span className="badge badge-warning">{row.id}</span></td>}
                        {columns.region && <td style={{ fontWeight: 600 }}>{row.region}</td>}
                        {columns.revenue && <td><span style={{ color: metTarget ? '#065f46' : '#991b1b', fontWeight: 'bold' }}>${row.revenue.toLocaleString()}</span></td>}
                        {columns.students && <td>{row.students.toLocaleString()} users</td>}
                        {columns.growth && <td><span style={{ fontWeight: 'bold' }}>+{row.growth}%</span></td>}
                        {columns.target && <td>${row.target.toLocaleString()}</td>}
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No financial metrics map to the active filter set.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

      </div>

    </div>
  );
}

export default BusinessDashboard;