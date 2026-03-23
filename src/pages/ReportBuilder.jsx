import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';
import { 
  Settings, Filter, Layers, Activity, Calculator, Download, 
  Trash2, Plus, RefreshCw, Table as TableIcon, LayoutDashboard,
  ChevronRight, AlertCircle, Info, Database
} from 'lucide-react';
import '../App.css';

const ReportBuilder = ({ studentData }) => {
  const [filters, setFilters] = useState([{ field: 'math_score', operator: '>', value: '70' }]);
  const [groupBy, setGroupBy] = useState('');
  const [metrics, setMetrics] = useState(['avg']);
  const [customFormula, setCustomFormula] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasStarted, setHasStarted] = useState(false);

  const fields = [
    { label: 'Math Score', value: 'math_score', type: 'numeric' },
    { label: 'Reading Score', value: 'reading_score', type: 'numeric' },
    { label: 'Writing Score', value: 'writing_score', type: 'numeric' },
    { label: 'Gender', value: 'gender', type: 'categorical' },
    { label: 'Race/Ethnicity', value: 'race/ethnicity', type: 'categorical' },
    { label: 'Parental Education', value: 'parental_level_of_education', type: 'categorical' },
    { label: 'Lunch', value: 'lunch', type: 'categorical' },
    { label: 'Test Prep', value: 'test_preparation_course', type: 'categorical' }
  ];

  const generateReport = async () => {
    setLoading(true);
    setHasStarted(true);
    try {
      const response = await fetch('http://localhost:5000/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters,
          groupBy,
          metrics,
          customFormula,
          sortConfig
        })
      });
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFilter = () => setFilters([...filters, { field: 'math_score', operator: '>', value: '' }]);
  const removeFilter = (index) => setFilters(filters.filter((_, i) => i !== index));
  const updateFilter = (index, key, val) => {
    const newFilters = [...filters];
    newFilters[index][key] = val;
    setFilters(newFilters);
  };

  const toggleMetric = (metric) => {
    setMetrics(prev => prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]);
  };

  const COLORS = ['#5d463b', '#9c8a80', '#c4b5ac', '#d9d2cc', '#e6e2db'];

  return (
    <div className="report-builder-canvas">
      
      {/* Sidebar Configuration */}
      <aside className="builder-sidebar">
        <div className="sidebar-header">
          <Settings className="sidebar-icon" size={20} />
          <span>Configurator</span>
        </div>

        <div className="sidebar-scrollable">
          
          {/* Filters Section */}
          <section className="sidebar-section">
            <div className="section-label">
              <Filter size={14} />
              <span>Data Filters</span>
            </div>
            <div className="filter-list">
              {filters.map((f, i) => (
                <div key={i} className="premium-filter-pill">
                  <div className="filter-controls">
                    <select value={f.field} onChange={(e) => updateFilter(i, 'field', e.target.value)}>
                      {fields.map(field => <option key={field.value} value={field.value}>{field.label}</option>)}
                    </select>
                    <select value={f.operator} onChange={(e) => updateFilter(i, 'operator', e.target.value)}>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value="==">=</option>
                      <option value="!=">≠</option>
                      <option value=">=">≥</option>
                      <option value="<=">≤</option>
                    </select>
                  </div>
                  <div className="filter-val-row">
                    <input 
                      type="text" 
                      placeholder="Enter value..." 
                      value={f.value} 
                      onChange={(e) => updateFilter(i, 'value', e.target.value)} 
                    />
                    <button className="icon-btn danger" onClick={() => removeFilter(i)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button className="text-btn primary" onClick={addFilter}>
                <Plus size={14} /> Add Condition
              </button>
            </div>
          </section>

          {/* Grouping */}
          <section className="sidebar-section">
            <div className="section-label">
              <Layers size={14} />
              <span>Group Aggregation</span>
            </div>
            <select className="premium-select" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
              <option value="">No Grouping</option>
              {fields.filter(f => f.type === 'categorical').map(field => (
                <option key={field.value} value={field.value}>{field.label}</option>
              ))}
            </select>
          </section>

          {/* Metrics */}
          <section className="sidebar-section">
            <div className="section-label">
              <Activity size={14} />
              <span>Key Metrics</span>
            </div>
            <div className="premium-checkbox-list">
              <label className={`checkbox-pill ${metrics.includes('avg') ? 'active' : ''}`}>
                <input type="checkbox" checked={metrics.includes('avg')} onChange={() => toggleMetric('avg')} />
                <span>Average</span>
              </label>
              <label className={`checkbox-pill ${metrics.includes('sum') ? 'active' : ''}`}>
                <input type="checkbox" checked={metrics.includes('sum')} onChange={() => toggleMetric('sum')} />
                <span>Total Sum</span>
              </label>
              {!groupBy && (
                <label className={`checkbox-pill ${metrics.includes('growth') ? 'active' : ''}`}>
                  <input type="checkbox" checked={metrics.includes('growth')} onChange={() => toggleMetric('growth')} />
                  <span>Growth/Diff</span>
                </label>
              )}
            </div>
          </section>

          {/* Formula */}
          <section className="sidebar-section">
            <div className="section-label">
              <Calculator size={14} />
              <span>Custom Logic</span>
            </div>
            <div className="formula-box">
              <textarea 
                placeholder="e.g. math_score * 1.5" 
                value={customFormula} 
                onChange={(e) => setCustomFormula(e.target.value)}
              />
              <div className="formula-hint">Use field keys like <code>math_score</code></div>
            </div>
          </section>

        </div>

        <div className="sidebar-footer">
          <button className="run-button" onClick={generateReport} disabled={loading}>
            {loading ? <RefreshCw className="spin" size={18} /> : <ChevronRight size={18} />}
            <span>{loading ? 'Processing' : 'Execute Report'}</span>
          </button>
        </div>
      </aside>

      {/* Main Results View */}
      <main className="report-workspace">
        
        {/* Workspace Toolbar */}
        <div className="workspace-toolbar">
          <div className="tab-group">
            <button 
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} />
              <span>Visual Dashboard</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              <TableIcon size={16} />
              <span>Data Matrix</span>
            </button>
          </div>
          
          <div className="toolbar-actions">
            <button className="icon-btn-text" onClick={() => window.print()}>
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="workspace-content">
          {!hasStarted ? (
            <div className="welcome-state">
              <div className="welcome-glass">
                <Database size={48} color="var(--accent-brown)" strokeWidth={1} />
                <h3>Ready to analyzed?</h3>
                <p>Configure your dimensions and filters on the left, then click Execute to generate your dynamic academic report.</p>
                <button className="pill-btn solid" onClick={generateReport}>Generate Initial View</button>
              </div>
            </div>
          ) : loading ? (
            <div className="loading-state">
               <div className="loader"></div>
               <p>Compiling dataset and computing derived metrics...</p>
            </div>
          ) : reportData.length > 0 ? (
            <div className="results-container animate-fade-in">
              
              {activeTab === 'dashboard' ? (
                <div className="dashboard-layout">
                  <div className="glass-card full-width">
                     <div className="card-header">
                       <LayoutDashboard size={18} />
                       <h4>Performance Overview {groupBy && `by ${groupBy}`}</h4>
                     </div>
                     <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey={groupBy || 'index'} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip 
                              cursor={{fill: 'rgba(0,0,0,0.02)'}}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            {Object.keys(reportData[0])
                              .filter(k => k !== groupBy && k !== 'index' && typeof reportData[0][k] === 'number')
                              .slice(0, 4)
                              .map((key, i) => (
                                <Bar 
                                  key={key} 
                                  dataKey={key} 
                                  fill={COLORS[i % COLORS.length]} 
                                  radius={[4, 4, 0, 0]} 
                                  barSize={24}
                                />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="summary-grid">
                    <div className="mini-glass-card">
                       <Info size={16} />
                       <div className="mini-val">{reportData.length}</div>
                       <div className="mini-label">Total Segments</div>
                    </div>
                    {groupBy && (
                      <div className="mini-glass-card">
                        <AlertCircle size={16} stroke="#9c8a80" />
                        <div className="mini-val">{groupBy.toUpperCase()}</div>
                        <div className="mini-label">Aggregation Key</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="table-layout animate-fade-in">
                  <div className="glass-card table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(reportData[0]).map(key => <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val, j) => (
                              <td key={j}>{typeof val === 'number' ? (val % 1 === 0 ? val : val.toFixed(2)) : val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="empty-state">
              <AlertCircle size={32} color="#991b1b" />
              <p>No data found matching your current filter criteria.</p>
              <button className="text-btn primary" onClick={() => setFilters([])}>Clear All Filters</button>
            </div>
          )}
        </div>

      </main>

    </div>
  );
};

export default ReportBuilder;
