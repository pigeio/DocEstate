import React, { useState, useEffect } from 'react';
import api, { formatDate } from '../api';
import { Plus, Filter } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Work Initiated');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEpidModal, setShowEpidModal] = useState(false);
  const [selectedServiceForReview, setSelectedServiceForReview] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/services?status=${activeTab}${filterType ? `&type=${filterType}` : ''}`);
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const res = await api.get('/people');
      if (res.data.success) setPeople(res.data.data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [activeTab, filterType]);

  useEffect(() => {
    fetchPeople();
  }, []);

  const updateStatus = async (id, currentStatus, epid = null) => {
    let newStatus = '';
    if (currentStatus === 'Work Initiated') {
      if (!epid) {
        setSelectedServiceForReview(id);
        setShowEpidModal(true);
        return;
      }
      newStatus = 'Reviewing';
    }
    else if (currentStatus === 'Reviewing') newStatus = 'Closed';
    else if (currentStatus === 'Closed') newStatus = 'Work Initiated'; // Reopen

    setErrorMsg('');
    try {
      const payload = { status: newStatus };
      if (epid) payload.epid = epid;

      const res = await api.put(`/services/${id}`, payload);
      if (res.data.success) {
        fetchServices();
        setShowEpidModal(false);
        setSelectedServiceForReview(null);
      } else {
        setErrorMsg(res.data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update failed:', error);
      setErrorMsg(error.response?.data?.error || 'Failed to update status. Check payment requirements.');
    }
  };

  const getDaysInReview = (dateString) => {
    if (!dateString) return 0;
    const updatedDate = new Date(dateString);
    const currentDate = new Date();
    // Calculate the difference in time
    const diffTime = Math.max(0, currentDate.getTime() - updatedDate.getTime());
    // Calculate the difference in days
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24)); 
    return diffDays;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Services</h1>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Track and manage all property service requests.</p>
        </div>
      </div>

      <div className="card-container p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex">
            <button 
              className={`px-6 py-4 text-sm transition-colors relative ${activeTab === 'Work Initiated' ? 'text-indigo-700 font-bold dark:text-indigo-400' : 'text-zinc-600 font-semibold hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
              onClick={() => setActiveTab('Work Initiated')}
            >
              Work Initiated
              {activeTab === 'Work Initiated' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 shadow-[0_-2px_8px_rgba(79,70,229,0.5)]" />}
            </button>
            <button 
              className={`px-6 py-4 text-sm transition-colors relative ${activeTab === 'Reviewing' ? 'text-indigo-700 font-bold dark:text-indigo-400' : 'text-zinc-600 font-semibold hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
              onClick={() => setActiveTab('Reviewing')}
            >
              Reviewing
              {activeTab === 'Reviewing' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 shadow-[0_-2px_8px_rgba(79,70,229,0.5)]" />}
            </button>
            <button 
              className={`px-6 py-4 text-sm transition-colors relative ${activeTab === 'Closed' ? 'text-indigo-700 font-bold dark:text-indigo-400' : 'text-zinc-600 font-semibold hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
              onClick={() => setActiveTab('Closed')}
            >
              Closed
              {activeTab === 'Closed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 shadow-[0_-2px_8px_rgba(79,70,229,0.5)]" />}
            </button>
          </div>
          <div className="ml-auto px-4 py-3 flex items-center border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800">
            <Filter size={16} className="text-zinc-800 dark:text-zinc-500 mr-2" />
            <select 
              className="bg-white font-semibold dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-300 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-1.5"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Khata">Khata</option>
              <option value="e-Khata">e-Khata</option>
              <option value="Khata Transfer">Khata Transfer</option>
              <option value="EC">EC</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-3 mx-4 mt-4 rounded text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-900/80">
              <tr>
                <th className="table-header">Service ID</th>
                <th className="table-header">Person</th>
                <th className="table-header">Type & EPID</th>
                <th className="table-header">Agent</th>
                <th className="table-header">Filed Date</th>
                {activeTab === 'Reviewing' && <th className="table-header">Time in Review</th>}
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12"><div className="animate-spin inline-block rounded-full h-6 w-6 border-b-2 border-indigo-500"></div></td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 font-bold text-zinc-800 dark:text-zinc-500">No services found in this category.</td></tr>
              ) : (
                services.map(srv => (
                  <tr key={srv.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="table-cell font-mono font-bold text-xs text-indigo-700 dark:text-indigo-400">{srv.id}</td>
                    <td className="table-cell font-bold text-black dark:text-zinc-200">
                      {srv.Person?.name} <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-500 ml-1">({srv.person_id})</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-zinc-100 font-bold text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-1 rounded text-xs border dark:border-zinc-700">{srv.type}</span>
                        {srv.epid && <span className="bg-blue-100 font-mono text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] border dark:border-blue-800">EPID: {srv.epid}</span>}
                      </div>
                    </td>
                    <td className="table-cell font-semibold text-zinc-900 dark:text-zinc-400">{srv.agent || '-'}</td>
                    <td className="table-cell font-medium text-zinc-800 dark:text-zinc-400">{formatDate(srv.filed_at || srv.created_at)}</td>
                    {activeTab === 'Reviewing' && (
                      <td className="table-cell">
                        {(() => {
                          const days = getDaysInReview(srv.updated_at);
                          const isExceeded = days >= 20;
                          return (
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${isExceeded ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-500 dark:border-red-800/50' : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}`}>
                              {days} {days === 1 ? 'day' : 'days'} {isExceeded && '(Limit Exceeded)'}
                            </span>
                          );
                        })()}
                      </td>
                    )}
                    <td className="table-cell text-right">
                      <button 
                        onClick={() => updateStatus(srv.id, srv.status)}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors border ${
                          srv.status === 'Work Initiated' 
                            ? 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-800 dark:hover:text-white' 
                            : srv.status === 'Reviewing'
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-800 dark:hover:text-white'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                      >
                        {srv.status === 'Work Initiated' ? 'Send for Review' : srv.status === 'Reviewing' ? 'Mark Closed' : 'Reopen'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showEpidModal && selectedServiceForReview && (
        <EpidPromptModal 
          onClose={() => {
            setShowEpidModal(false);
            setSelectedServiceForReview(null);
          }} 
          onSubmit={(epid) => updateStatus(selectedServiceForReview, 'Work Initiated', epid)} 
        />
      )}
    </div>
  );
};

const AddServiceModal = ({ onClose, onAdd, people }) => {
  const [formData, setFormData] = useState({ person_id: '', type: 'Khata', total_fee: '', agent: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/services', formData);
      if (res.data.success) {
        onAdd();
        onClose();
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h3 className="text-lg font-medium text-white">Add New Service</h3>
          <button onClick={onClose} className="text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label-text">Select Person *</label>
            <select 
              required 
              className="input-field" 
              value={formData.person_id} 
              onChange={e => setFormData({...formData, person_id: e.target.value})}
            >
              <option value="" disabled>Choose a person (BPS-XXX)</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Service Type *</label>
            <select 
              required 
              className="input-field" 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="Khata">Khata</option>
              <option value="e-Khata">e-Khata</option>
              <option value="Khata Transfer">Khata Transfer</option>
              <option value="EC">EC</option>
            </select>
          </div>
          <div className="relative">
            <label className="label-text">Agreed Total Fee (₹) *</label>
            <span className="absolute left-3 top-[38px] text-zinc-500 font-bold">₹</span>
            <input 
              required
              type="number" 
              min="0"
              className="input-field pl-8" 
              value={formData.total_fee} 
              onChange={e => setFormData({...formData, total_fee: Number(e.target.value) || e.target.value})} 
            />
          </div>
          <div>
            <label className="label-text">Assigned Agent</label>
            <input type="text" className="input-field" value={formData.agent} onChange={e => setFormData({...formData, agent: e.target.value})} />
          </div>
          <div>
            <label className="label-text">Notes / Remarks</label>
            <textarea className="input-field resize-none h-24" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary w-24 flex justify-center">
              {loading ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EpidPromptModal = ({ onClose, onSubmit }) => {
  const [epid, setEpid] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!epid.trim()) return;
    onSubmit(epid.trim());
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h3 className="text-lg font-medium text-white">Enter Government EPID</h3>
          <button onClick={onClose} className="text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-zinc-400">An EPID is mandatory before sending this file for review. Please provide the EPID assigned by the government.</p>
          <div>
            <label className="label-text">EPID Number *</label>
            <input 
              type="text" 
              required 
              autoFocus
              className="input-field font-mono" 
              placeholder="Ex: EPID-2026-XYZ"
              value={epid} 
              onChange={e => setEpid(e.target.value)}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={!epid.trim()} className="btn-primary w-24">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Services;
