import React, { useState, useEffect } from 'react';
import api, { formatCurrency, formatDate, formatDateTime } from '../api';
import { Search, IndianRupee, User, Briefcase, CheckCircle2, Clock, Send } from 'lucide-react';

const CFlow = () => {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personServices, setPersonServices] = useState([]);
  const [personCashFlows, setPersonCashFlows] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payType, setPayType] = useState('advance');
  const [payNote, setPayNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPeople = async (q = '') => {
    setLoadingPeople(true);
    try {
      const res = await api.get(`/people${q ? `?search=${q}` : ''}`);
      if (res.data.success) setPeople(res.data.data);
    } catch (err) {
      console.error('Error fetching people:', err);
    } finally {
      setLoadingPeople(false);
    }
  };

  const selectPerson = async (person) => {
    setSelectedPerson(person);
    setSelectedService(null);
    setSuccessMsg('');
    setLoadingProfile(true);
    try {
      const res = await api.get(`/people/${person.id}`);
      if (res.data.success) {
        setPersonServices(res.data.data.services || []);
        setPersonCashFlows(res.data.data.cashflows || []);
      }
    } catch (err) {
      console.error('Error fetching person profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => { fetchPeople(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPeople(search);
  };

  const handlePayment = async () => {
    if (!payAmount || !selectedService) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const payload = {
        person_id: selectedPerson.id,
        service_id: selectedService.id,
        type: payType,
        amount: parseFloat(payAmount),
        note: payNote
      };
      const res = await api.post('/cashflows', payload);
      if (res.data.success) {
        setSuccessMsg(`✅ ${payType === 'advance' ? 'Advance' : 'Complete'} payment of ₹${payAmount} recorded! Receipt email sent.`);
        setPayAmount('');
        setPayNote('');
        // Refresh the profile data
        await selectPerson(selectedPerson);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to record payment';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Get cash flows for a specific service
  const getServiceCashFlows = (serviceId) => personCashFlows.filter(cf => cf.service_id === serviceId);

  // Calculate payment status for a service
  const getPaymentStatus = (serviceId) => {
    const cfs = getServiceCashFlows(serviceId);
    const service = personServices.find(s => s.id === serviceId);
    const totalFee = service ? service.total_fee : 0;
    
    const hasAdvance = cfs.some(cf => cf.type === 'advance');
    const hasComplete = cfs.some(cf => cf.type === 'complete');
    const totalAdvance = cfs.filter(cf => cf.type === 'advance').reduce((s, cf) => s + cf.amount, 0);
    const totalComplete = cfs.filter(cf => cf.type === 'complete').reduce((s, cf) => s + cf.amount, 0);
    const totalPaid = totalAdvance + totalComplete;
    const balance = Math.max(0, totalFee - totalPaid);
    
    return { hasAdvance, hasComplete, totalAdvance, totalComplete, totalPaid, totalFee, balance };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">C Flow</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Search a client, select a service, record payments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>

        {/* ─── LEFT: Client Search Panel ─── */}
        <div className="lg:col-span-3 card-container p-0 overflow-hidden flex flex-col" style={{ maxHeight: '75vh' }}>
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <form onSubmit={handleSearch} className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-zinc-400" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                placeholder="Search clients..."
              />
            </form>
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingPeople ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div></div>
            ) : people.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">No clients found.</div>
            ) : (
              people.map(p => (
                <div
                  key={p.id}
                  onClick={() => selectPerson(p)}
                  className={`px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer transition-all ${
                    selectedPerson?.id === p.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-200">{p.name}</div>
                  <div className="text-xs text-zinc-500 font-mono">{p.id}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{p.phone}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── CENTER: Client Info + Services ─── */}
        <div className="lg:col-span-5 space-y-4 overflow-y-auto" style={{ maxHeight: '75vh' }}>
          {!selectedPerson ? (
            <div className="card-container flex flex-col items-center justify-center py-20 text-center">
              <User size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-400 dark:text-zinc-600">Select a Client</h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-1">Search and click on a client from the left panel to begin.</p>
            </div>
          ) : loadingProfile ? (
            <div className="card-container flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>
          ) : (
            <>
              {/* Client Info Card */}
              <div className="card-container">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{selectedPerson.name}</h2>
                    <p className="text-xs font-mono text-zinc-500">{selectedPerson.id}</p>
                  </div>
                  <span className={selectedPerson.status === 'active' ? 'badge-active ml-auto' : 'badge-closed ml-auto'}>{selectedPerson.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-zinc-800 dark:text-zinc-300">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-0.5">Phone</span>
                    <a href={`tel:${selectedPerson.phone}`} className="font-semibold hover:text-indigo-600 transition-colors">{selectedPerson.phone}</a>
                  </div>
                  <div className="text-zinc-800 dark:text-zinc-300">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-0.5">Email</span>
                    {selectedPerson.email
                      ? <a href={`mailto:${selectedPerson.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm break-all">{selectedPerson.email}</a>
                      : <span className="text-zinc-400">-</span>
                    }
                  </div>
                  <div className="text-zinc-800 dark:text-zinc-300">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-0.5">Area</span>
                    {selectedPerson.area || '-'}
                  </div>
                  <div className="text-zinc-800 dark:text-zinc-300">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-0.5">Joined</span>
                    {formatDate(selectedPerson.joined_at || selectedPerson.created_at)}
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="card-container p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center">
                  <Briefcase size={16} className="text-emerald-600 dark:text-emerald-400 mr-2" />
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Active Services</h3>
                  <span className="ml-auto bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-sm text-xs px-2 py-0.5 rounded">{personServices.length}</span>
                </div>
                <div className="p-3 space-y-2">
                  {personServices.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">No services linked.</div>
                  ) : (
                    personServices.map(srv => {
                      const ps = getPaymentStatus(srv.id);
                      const isSelected = selectedService?.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => { setSelectedService(srv); setSuccessMsg(''); setPayAmount(''); setPayNote(''); }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-md ring-1 ring-indigo-200 dark:ring-indigo-500/30'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400">{srv.id}</span>
                            <span className={
                              srv.status === 'Work Initiated' ? 'badge-initiated' :
                              srv.status === 'Reviewing' ? 'badge-reviewing' :
                              'badge-closed'
                            }>{srv.status}</span>
                          </div>
                          <div className="text-sm font-bold text-zinc-950 dark:text-zinc-100 mb-2">{srv.type}</div>

                          {/* Payment Status Indicators */}
                          <div className="flex gap-3 text-xs">
                            <div className={`flex items-center gap-1 ${ps.hasAdvance ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                              {ps.hasAdvance ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                              Advance {ps.hasAdvance ? formatCurrency(ps.totalAdvance) : 'Pending'}
                            </div>
                            <div className={`flex items-center gap-1 ${ps.hasComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                              {ps.hasComplete ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                              Complete {ps.hasComplete ? formatCurrency(ps.totalComplete) : 'Pending'}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-col gap-1.5 border-t border-zinc-100 dark:border-zinc-800/50 pt-3">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Total Fee:</span>
                              <span className="font-bold text-zinc-900 dark:text-zinc-200">{formatCurrency(ps.totalFee)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Total Paid:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(ps.totalPaid)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Outstanding:</span>
                              <span className={`font-bold ${ps.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-200'}`}>
                                {formatCurrency(ps.balance)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Outstanding Balance Flag for Reviewing/Closed Services */}
                          {ps.balance > 0 && ['Reviewing', 'Closed'].includes(srv.status) && (
                            <div className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded inline-flex items-center border border-red-200 dark:border-red-800/50">
                              ⚠️ Payment Pending
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Inline Payment Form (shown when a service is selected) */}
              {selectedService && (
                <div className="card-container border-t-4 border-t-emerald-500 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center mb-4">
                    <IndianRupee size={18} className="text-emerald-600 dark:text-emerald-400 mr-2" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Record Payment</h3>
                    <span className="ml-2 text-xs text-zinc-400">for {selectedService.type} ({selectedService.id})</span>
                  </div>

                  {successMsg && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-sm text-emerald-700 dark:text-emerald-400 font-medium animate-in fade-in">
                      {successMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="label-text">Payment Type</label>
                      <select className="input-field" value={payType} onChange={e => setPayType(e.target.value)}>
                        <option value="advance">💰 Advance</option>
                        <option value="complete">💰 Complete Clearance</option>
                      </select>
                    </div>
                    <div>
                      <label className="label-text">Amount (₹)</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="input-field"
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                        placeholder="e.g. 5000"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="label-text">Note / Remarks (optional)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={payNote}
                      onChange={e => setPayNote(e.target.value)}
                      placeholder="e.g. Cash received in office"
                    />
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={submitting || !payAmount}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition duration-200 font-bold shadow-lg shadow-emerald-900/30 text-base flex items-center justify-center active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
                    ) : (
                      <><Send size={18} className="mr-2" /> Done — Record Payment</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── RIGHT: Payment History ─── */}
        <div className="lg:col-span-4 card-container p-0 overflow-hidden flex flex-col" style={{ maxHeight: '75vh' }}>
          <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center">
            <IndianRupee size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {selectedService ? `Payments for ${selectedService.id}` : selectedPerson ? 'All Payments' : 'Payment History'}
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 p-3">
            {!selectedPerson ? (
              <div className="text-center py-16 text-zinc-400 text-sm">Select a client to view payment history.</div>
            ) : (() => {
              const displayCFs = selectedService
                ? personCashFlows.filter(cf => cf.service_id === selectedService.id)
                : personCashFlows;

              if (displayCFs.length === 0) {
                return <div className="text-center py-16 text-zinc-400 text-sm">No payments recorded yet.</div>;
              }

              return (
                <div className="space-y-2">
                  {/* Summary bar */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3 text-center">
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Advance</div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(displayCFs.filter(cf => cf.type === 'advance').reduce((s,cf) => s + cf.amount, 0))}
                      </div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-3 text-center">
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Complete</div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(displayCFs.filter(cf => cf.type === 'complete').reduce((s,cf) => s + cf.amount, 0))}
                      </div>
                    </div>
                  </div>

                  {/* Payment entries */}
                  {displayCFs.map(cf => (
                    <div key={cf.id} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400">{cf.id}</span>
                        <span className={cf.type === 'advance' ? 'badge-advance' : 'badge-complete'}>{cf.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-zinc-500 font-medium">Service: {cf.service_id}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{formatDateTime(cf.date || cf.created_at)}</div>
                          {cf.note && <div className="text-xs text-zinc-400 mt-0.5 italic">"{cf.note}"</div>}
                        </div>
                        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(cf.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CFlow;
