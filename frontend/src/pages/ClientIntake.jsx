import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { User, Briefcase, BadgeInfo, CheckCircle2, ChevronRight, ChevronLeft, Building, MapPin, Search } from 'lucide-react';

const ClientIntake = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    society_name: '',
    flat_number: '',
    type: '',
    total_fee: '',
    area: '', // maps to Add Society visually
    notes: '',
    source_agent: '' // maps to Sales Person
  });

  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    let newErrors = {};
    if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be exactly 10 digits';
    if (formData.society_name.length < 3) newErrors.society_name = 'Society name must be at least 3 characters';
    if (!formData.flat_number) newErrors.flat_number = 'Flat number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    if (!formData.type) newErrors.type = 'Please select a service type';
    if (!formData.total_fee || isNaN(formData.total_fee) || Number(formData.total_fee) < 0) newErrors.total_fee = 'Please enter a valid total fee';
    if (formData.area.length < 10) newErrors.area = 'Address details must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    let newErrors = {};
    if (formData.source_agent.length < 2) newErrors.source_agent = 'Agent name must be at least 2 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-capitalize name fields
    const formattedValue = (name === 'name' || name === 'source_agent') 
      ? value.replace(/\b\w/g, l => l.toUpperCase()) 
      : value;
    
    // Numbers only for phone
    if (name === 'phone' && !/^\d*$/.test(value)) return;
    
    // Numbers only for total_fee
    if (name === 'total_fee' && !/^\d*$/.test(value)) return;

    setFormData({ ...formData, [name]: formattedValue });
    // Clear error on type
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const setServiceType = (type) => {
    setFormData({ ...formData, type });
    if (errors.type) setErrors({ ...errors, type: null });
  };

  const submitForm = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    try {
      const res = await api.post('/intake', formData);
      if (res.data.success) {
        setSuccessData(res.data.data);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.response?.data?.error || 'Failed to register client');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-in zoom-in duration-500 pt-10 px-4 pb-24">
        <div className="card-container text-center py-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mb-6 border-4 border-emerald-500/30">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Registration Complete</h2>
          <p className="text-zinc-400 mb-8">The client and service form have been linked.</p>
          
          <div className="space-y-4 text-left">
            <div className="bg-zinc-100 dark:bg-zinc-950/80 p-4 rounded-xl border border-zinc-300 dark:border-zinc-800 flex justify-between items-center shadow-inner">
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-400 uppercase tracking-wider mb-1">Person ID</p>
                <p className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{successData.person_id}</p>
                <p className="text-sm font-bold text-black dark:text-white mt-1">{successData.name}</p>
              </div>
            </div>
            
            <div className="bg-zinc-100 dark:bg-zinc-950/80 p-4 rounded-xl border border-zinc-300 dark:border-zinc-800 flex justify-between items-center shadow-inner">
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-400 uppercase tracking-wider mb-1">Service ID</p>
                <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{successData.service_id}</p>
                <p className="text-sm font-bold text-black dark:text-white mt-1">{successData.service_type} - {successData.agent}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              setFormData({ name: '', email: '', phone: '', society_name: '', flat_number: '', type: '', total_fee: '', area: '', notes: '', source_agent: '' });
              setSuccessData(null);
              setStep(1);
            }} 
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition duration-200 font-medium shadow-lg shadow-indigo-900/30 text-lg flex items-center justify-center"
          >
            Register Another Client
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl transition duration-200 font-medium border border-zinc-200 dark:border-zinc-700 text-lg flex items-center justify-center"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Common Input Component
  const renderInput = ({ label, name, type = 'text', placeholder, required, textArea }) => (
    <div className="mb-4">
      <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-300 mb-1.5 ml-1">
        {label} {required && <span className="text-indigo-600 dark:text-indigo-400">*</span>}
      </label>
      {textArea ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-white dark:bg-zinc-900 border ${errors[name] ? 'border-red-500/50 focus:ring-red-500' : 'border-zinc-200 dark:border-zinc-700/80 focus:ring-indigo-500'} rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all min-h-[120px] resize-none shadow-sm dark:shadow-inner`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          inputMode={type === 'tel' ? 'numeric' : 'text'}
          className={`w-full bg-white dark:bg-zinc-900 border ${errors[name] ? 'border-red-500/50 focus:ring-red-500' : 'border-zinc-200 dark:border-zinc-700/80 focus:ring-indigo-500'} rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm dark:shadow-inner`}
        />
      )}
      {errors[name] && <p className="text-red-400 text-xs mt-1.5 ml-1 animate-in slide-in-from-top-1">{errors[name]}</p>}
    </div>
  );

  const renderServiceTypeBtn = ({ type }) => {
    const isSelected = formData.type === type;
    return (
      <button
        onClick={() => setServiceType(type)}
        className={`w-full py-5 px-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
          isSelected 
            ? 'bg-indigo-600/10 dark:bg-indigo-600/20 border-indigo-600 text-indigo-700 dark:text-white shadow-[0_0_15px_rgba(99,102,241,0.1)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
            : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
        }`}
      >
        <div className={`w-3 h-3 rounded-full mb-2 ${isSelected ? 'bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'bg-zinc-500'}`} />
        <span className="font-bold text-[15px]">{type}</span>
      </button>
    );
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-in fade-in relative min-h-[calc(100vh-8rem)]">
      
      {/* Header & Progress Indicator */}
      <div className="mb-6 sticky top-0 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md pt-2 pb-4 z-10 border-b border-zinc-200 dark:border-zinc-900">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">Client Intake</h1>
        
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded z-0 transition-all duration-300" 
            style={{ width: `${((step - 1) / 2) * 100}%` }} 
          />
          
          {[
            { s: 1, icon: User, label: 'Client' },
            { s: 2, icon: Briefcase, label: 'Service' },
            { s: 3, icon: BadgeInfo, label: 'Agent' }
          ].map(({ s, icon: Icon, label }) => (
            <div key={s} className="relative z-10 flex flex-col items-center bg-white dark:bg-zinc-950 px-2 cursor-pointer transition" onClick={() => (s < step) ? setStep(s) : null}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step === s ? 'bg-indigo-600 border-4 border-indigo-900 text-white shadow-lg shadow-indigo-500/20' : 
                step > s ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-400 dark:border-indigo-500/30' : 
                'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 border border-zinc-300 dark:border-zinc-700'
              }`}>
                {step > s ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </div>
              <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${step >= s ? 'text-indigo-700 dark:text-indigo-400' : 'text-zinc-500'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="card-container border-t-4 border-t-indigo-500 p-5 sm:p-8">
        {step === 1 && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center mb-6">
              <User className="text-indigo-600 dark:text-indigo-400 mr-2" size={20} />
              <h2 className="text-lg font-bold text-black dark:text-white">Client Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <div className="md:col-span-2">{renderInput({ label: "Full Name", name: "name", required: true, placeholder: "Ex. Sunil Shetty" })}</div>
              <div className="md:col-span-1">{renderInput({ label: "Email Address", name: "email", type: "email", required: true, placeholder: "client@example.com" })}</div>
              <div className="md:col-span-1">{renderInput({ label: "Phone Number", name: "phone", type: "tel", required: true, placeholder: "10 digit number" })}</div>
              <div className="md:col-span-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center mb-4 text-zinc-900 dark:text-zinc-300 font-bold">
                  <Building className="mr-2 text-zinc-600 dark:text-zinc-500" size={16} /> Location
                </div>
              </div>
              <div className="md:col-span-1">{renderInput({ label: "Society Name", name: "society_name", required: true, placeholder: "Prestige Falcon City" })}</div>
              <div className="md:col-span-1">{renderInput({ label: "Flat Number", name: "flat_number", required: true, placeholder: "B-1402" })}</div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center mb-6">
              <Briefcase className="text-indigo-600 dark:text-indigo-400 mr-2" size={20} />
              <h2 className="text-lg font-bold text-black dark:text-white">Service Requirements</h2>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-400 mb-3 ml-1">
                Select Service Type <span className="text-indigo-600 dark:text-indigo-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {renderServiceTypeBtn({ type: "Khata" })}
                {renderServiceTypeBtn({ type: "e-Khata" })}
                {renderServiceTypeBtn({ type: "Khata Transfer" })}
                {renderServiceTypeBtn({ type: "EC" })}
              </div>
              {errors.type && <p className="text-red-400 text-xs mt-2 ml-1 animate-in slide-in-from-top-1">{errors.type}</p>}
            </div>

            {/* Financials section */}
            <div className="mb-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center mb-4 text-zinc-900 dark:text-zinc-300 font-bold">
                 💰 Financials
              </div>
              <div className="relative">
                <span className="absolute left-4 top-[42px] text-zinc-500 font-bold">₹</span>
                {renderInput({ label: "Agreed Total Fee", name: "total_fee", type: "tel", required: true, placeholder: "5000" })}
                <style>{`input[name="total_fee"] { padding-left: 2rem; }`}</style>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
               <div className="flex items-center mb-4 text-zinc-900 dark:text-zinc-300 font-bold">
                  <MapPin className="mr-2 text-zinc-600 dark:text-zinc-500" size={16} /> Full Address
                </div>
              {renderInput({ label: "Add Society Details", name: "area", textArea: true, required: true, placeholder: "Complete address with landmarks..." })}
            </div>
            
            <div className="mt-2">
              {renderInput({ label: "Internal Notes (Optional)", name: "notes", textArea: true, placeholder: "Any specific requirements from the client..." })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center mb-6">
              <BadgeInfo className="text-indigo-600 dark:text-indigo-400 mr-2" size={20} />
              <h2 className="text-lg font-bold text-black dark:text-white">Agent Assignment</h2>
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-300 mb-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-500/20 shadow-sm">
              Please declare the sales agent making this intake. This maps the client origin source.
            </p>
            {renderInput({ label: "Sales Person Name", name: "source_agent", required: true, placeholder: "Your Name or Agent Name" })}
          </div>
        )}
      </div>

      {/* Floating Bottom Navigation Bar (Mobile Form Sticky) */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800/60 flex justify-between gap-4 z-50">
        {step > 1 ? (
          <button 
            type="button" 
            onClick={prevStep}
            disabled={loading}
            className="w-1/3 py-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl transition duration-200 font-medium border border-zinc-200 dark:border-zinc-700 flex items-center justify-center disabled:opacity-50"
          >
            <ChevronLeft size={20} className="mr-1" /> Back
          </button>
        ) : <div className="w-1/3"></div>}

        {step < 3 ? (
          <button 
            type="button" 
            onClick={nextStep}
            className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition duration-200 font-medium shadow-lg shadow-indigo-900/30 text-lg flex items-center justify-center transform active:scale-95"
          >
            Continue <ChevronRight size={20} className="ml-1" />
          </button>
        ) : (
          <button 
            type="button" 
            onClick={submitForm}
            disabled={loading}
            className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition duration-200 font-bold shadow-lg shadow-emerald-900/30 text-lg flex items-center justify-center transform active:scale-95 disabled:opacity-50"
          >
            {loading ? <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full"></div> : 'Register Client'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ClientIntake;
