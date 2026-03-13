import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import api, { formatDate, formatCurrency, formatDateTime } from '../api';
import { Search, Plus, User, ArrowLeft, Briefcase, IndianRupee, CalendarDays, Phone, MapPin, MessageSquare, Send } from 'lucide-react';

const PeopleList = () => {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const fetchPeople = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/people${searchQuery ? `?search=${searchQuery}` : ''}`);
      if (res.data.success) {
        setPeople(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPeople(search);
  };

  // Timeline Grouping Logic
  const groupedPeople = people.reduce((acc, person) => {
    const rawDate = person.joined_at || person.created_at || new Date().toISOString();
    const dateKey = formatDate(rawDate);
    
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(person);
    return acc;
  }, {});

  const sortedGroups = Object.entries(groupedPeople)
    .map(([dateString, groupPeople]) => {
        const latestTime = Math.max(...groupPeople.map(p => new Date(p.joined_at || p.created_at || new Date()).getTime()));
        return { dateString, people: groupPeople, timestamp: latestTime };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const isToday = (timestamp) => {
    const today = new Date();
    const date = new Date(timestamp);
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  
  const isYesterday = (timestamp) => {
    const yt = new Date();
    yt.setDate(yt.getDate() - 1);
    const date = new Date(timestamp);
    return date.getDate() === yt.getDate() && date.getMonth() === yt.getMonth() && date.getFullYear() === yt.getFullYear();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">H Cloud</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage all registered individuals in the central registry.</p>
        </div>
      </div>

      <div className="card-container p-0 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20 shadow-inner">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20 shadow-sm">
          <form onSubmit={handleSearch} className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-zinc-500" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm dark:shadow-inner"
              placeholder="Search by name, ID, or area..."
            />
            <button type="submit" className="absolute right-2 top-1.5 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs rounded-md text-zinc-700 dark:text-zinc-300 transition-colors">
              Search
            </button>
          </form>
        </div>

        <div className="p-4 sm:p-6 space-y-10">
          {loading ? (
             <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : people.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="font-bold text-lg text-zinc-800 dark:text-zinc-300">{search ? 'No clients found matching your search.' : 'No clients found.'}</p>
              <p className="text-sm font-semibold text-zinc-500 mt-2">Try adjusting your filters or add a new person.</p>
            </div>
          ) : (
            sortedGroups.map((group, idx) => (
              <div key={idx} className="space-y-5 animate-in slide-in-from-bottom-4 relative" style={{ animationDelay: `${idx * 50}ms` }}>
                
                {/* Visual Timeline Line Connector */}
                {idx !== sortedGroups.length - 1 && (
                  <div className="absolute left-[26px] top-12 bottom-[-40px] w-[2px] bg-indigo-200 dark:bg-indigo-900/50 z-0 hidden sm:block" />
                )}

                {/* Group Header (Date & Count) */}
                <div className="flex items-center justify-between sticky top-[72px] bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-xl z-10 py-3 border-y border-zinc-200 dark:border-zinc-800 shadow-sm -mx-4 sm:mx-0 px-4 sm:px-0 sm:border-y-0 sm:border-b-2 sm:border-indigo-500/30 sm:bg-transparent dark:sm:bg-transparent sm:backdrop-blur-none sm:shadow-none sm:py-2">
                  <h2 className="text-xl font-black text-black dark:text-white flex items-center tracking-tight">
                    <span className="bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white p-2 rounded-lg mr-3 shadow-md shadow-indigo-500/30 hidden sm:flex border border-indigo-400">
                      <CalendarDays size={20} />
                    </span>
                    {isToday(group.timestamp) ? 'Today' : isYesterday(group.timestamp) ? 'Yesterday' : group.dateString}
                    {isToday(group.timestamp) && <span className="ml-3 text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-300 dark:border-emerald-800/50 shadow-sm">Active</span>}
                  </h2>
                  <span className="text-sm font-bold bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 px-3.5 py-1.5 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700">
                    {group.people.length} {group.people.length === 1 ? 'Client' : 'Clients'}
                  </span>
                </div>

                {/* Client Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:pl-16 relative z-10">
                  {group.people.map(person => (
                    <div 
                      key={person.id} 
                      onClick={() => navigate(`/hcloud/${person.id}`)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-5 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                    >
                      {/* Decorative Background Glow */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-2xl"></div>
                      
                      {/* Card Header (Name & Status) */}
                      <div className="flex justify-between items-start mb-5 relative z-10 gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-black dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate">{person.name}</h3>
                          <p className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-500 mt-0.5">{person.id}</p>
                        </div>
                        <span className={`shrink-0 ${person.status === 'active' ? 'badge-active shadow-md' : 'badge-closed opacity-80'}`}>{person.status}</span>
                      </div>
                      
                      {/* Card Details (Phone & Area) */}
                      <div className="space-y-3 mt-auto relative z-10 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center text-sm font-bold text-zinc-800 dark:text-zinc-300 truncate">
                          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mr-3 shrink-0">
                            <Phone size={14} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          {person.phone}
                        </div>
                        <div className="flex items-center text-sm font-bold text-zinc-800 dark:text-zinc-300 truncate">
                           <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mr-3 shrink-0">
                            <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                          {person.area || <span className="text-zinc-500 italic font-medium">No area specified</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const AddPersonModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', area: '', aadhaar: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/people', formData);
      if (res.data.success) {
        onAdd();
        onClose();
      }
    } catch (error) {
      console.error('Error adding person:', error);
      alert('Failed to add person');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 dark:bg-zinc-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Add New Person</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label-text">Full Name *</label>
            <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="label-text">Phone Number *</label>
            <input required type="tel" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label className="label-text">Email Address (for Emergency/Updates)</label>
            <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="client@example.com" />
          </div>
          <div>
            <label className="label-text">Area / Ward</label>
            <input type="text" className="input-field" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
          </div>
          <div>
            <label className="label-text">Aadhaar (Masked internally)</label>
            <input type="text" className="input-field" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} />
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

const PersonProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timelineServiceId, setTimelineServiceId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/people/${id}`);
        if (res.data.success) setData(res.data.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>;
  if (!data) return <div className="text-zinc-500">Person not found.</div>;

  const { person, services, cashflows } = data;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Link to="/hcloud" className="inline-flex items-center text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back to Directory
      </Link>

      <div className="card-container flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-5 shadow-sm dark:shadow-inner">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center">
              {person.name} <span className={person.status === 'active' ? 'badge-active ml-3' : 'badge-closed ml-3'}>{person.status}</span>
            </h1>
            <p className="text-sm font-mono text-zinc-500 mt-1">{person.id}</p>
          </div>
        </div>
        <div className="text-sm grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto flex-1">
          <div className="text-zinc-900 dark:text-zinc-300"><span className="text-zinc-500 text-xs uppercase tracking-wider block mb-0.5">Phone</span> <a href={`tel:${person.phone}`} className="hover:text-indigo-600 transition-colors font-semibold">{person.phone}</a></div>
          <div className="text-zinc-900 dark:text-zinc-300"><span className="text-zinc-500 text-xs uppercase tracking-wider block mb-0.5">Email</span> {person.email ? <a href={`mailto:${person.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{person.email}</a> : '-'}</div>
          <div className="text-zinc-900 dark:text-zinc-300"><span className="text-zinc-500 text-xs uppercase tracking-wider block mb-0.5">Area</span> {person.area || '-'}</div>
          <div className="text-zinc-900 dark:text-zinc-300"><span className="text-zinc-500 text-xs uppercase tracking-wider block mb-0.5">Joined</span> {formatDate(person.joined_at || person.created_at)}</div>
          <div className="text-zinc-900 dark:text-zinc-300"><span className="text-zinc-500 text-xs uppercase tracking-wider block mb-0.5">Aadhaar</span> {person.aadhaar ? `XXXX-XXXX-${person.aadhaar.slice(-4)}` : '-'}</div>
        </div>
      </div>

      {/* Financial Summary */}
      {(() => {
        const totalAdvance = cashflows.filter(cf => cf.type === 'advance').reduce((sum, cf) => sum + cf.amount, 0);
        const totalComplete = cashflows.filter(cf => cf.type === 'complete').reduce((sum, cf) => sum + cf.amount, 0);
        const totalPaid = totalAdvance + totalComplete;

        return (
          <div className="card-container grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-500/20 shadow-sm">
              <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Advance</h4>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{formatCurrency(totalAdvance)}</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
              <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Complete Clearance</h4>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{formatCurrency(totalComplete)}</p>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-500/20 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-200/50 dark:bg-indigo-500/20 blur-xl rounded-full"></div>
              <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Total Yield from Client</h4>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-container p-0 overflow-hidden flex flex-col h-96">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center">
            <Briefcase size={18} className="text-emerald-600 dark:text-emerald-400 mr-2" />
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">Linked Services</h2>
            <span className="ml-auto bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-sm text-xs px-2 py-1 rounded">{services.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {services.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">No services linked.</div>
            ) : (
              <div className="space-y-2">
                {services.map(srv => (
                  <div key={srv.id} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 flex justify-between items-center hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400">{srv.id}</span>
                        <span className={
                          srv.status === 'Work Initiated' ? 'badge-initiated' : 
                          srv.status === 'Reviewing' ? 'badge-reviewing' : 
                          'badge-closed'
                        }>{srv.status}</span>
                      </div>
                      <div className="text-sm font-bold text-zinc-950 dark:text-zinc-100">{srv.type}</div>
                      <div className="text-xs font-medium text-zinc-600 dark:text-zinc-500 mt-2 space-y-1">
                        <div>📋 Filed: {formatDateTime(srv.filed_at)}</div>
                        {srv.reviewed_at && (
                          <div className="text-blue-600 dark:text-blue-400">📤 Sent for Review: {formatDateTime(srv.reviewed_at)}</div>
                        )}
                        {srv.closed_at && (
                          <div className="text-emerald-600 dark:text-emerald-400">✅ Closed: {formatDateTime(srv.closed_at)}</div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setTimelineServiceId(srv.id)}
                      className="ml-4 shrink-0 p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition"
                      title="View Timeline"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card-container p-0 overflow-hidden flex flex-col h-96">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center">
            <IndianRupee size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">Cash Flows</h2>
            <span className="ml-auto bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-sm text-xs px-2 py-1 rounded">{cashflows.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {cashflows.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">No cash flows recorded.</div>
            ) : (
              <div className="space-y-2">
                {cashflows.map(cf => (
                  <div key={cf.id} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 flex justify-between items-center hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400">{cf.id}</span>
                        <span className={cf.type === 'advance' ? 'badge-advance' : 'badge-complete'}>{cf.type}</span>
                      </div>
                      <div className="text-xs font-medium text-zinc-700 dark:text-zinc-400">Service: {cf.service_id}</div>
                      <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-500 mt-1">{formatDate(cf.date)}</div>
                    </div>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(cf.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {timelineServiceId && <ServiceTimelineModal serviceId={timelineServiceId} onClose={() => setTimelineServiceId(null)} />}
    </div>
  );
};

const ServiceTimelineModal = ({ serviceId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/services/${serviceId}/activity`);
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/services/${serviceId}/activity`, {
        message,
        created_by: 'Agent', // Replace with auth user later
      });
      if (res.data.success) {
        setMessage('');
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to post update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 dark:bg-zinc-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col h-[600px] max-h-[90vh]">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white flex items-center">
            <MessageSquare size={18} className="mr-2 text-indigo-500" />
            File Timeline
            <span className="ml-3 text-xs font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">{serviceId}</span>
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-950/30">
          {loading ? (
             <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-zinc-400">No activity logged yet.</div>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">{log.created_by || 'System'}</span>
                    <span className="text-xs text-zinc-500">{formatDateTime(log.created_at)}</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Type an update or note..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={submitting || !message.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-indigo-900/20 disabled:opacity-50"
            >
              {submitting ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function HCloud() {
  return (
    <Routes>
      <Route path="/" element={<PeopleList />} />
      <Route path="/:id" element={<PersonProfile />} />
    </Routes>
  );
}
