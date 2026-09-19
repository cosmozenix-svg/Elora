import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench } from 'lucide-react';

export default function UnderDevelopment() {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Service Notice</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Upcoming feature</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 text-center transition-colors">
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 p-1 mb-3 shadow-xs border border-slate-200 dark:border-slate-700">
          <img src="/icon.png" alt="Elora Icon" className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-xs">
            <Wrench className="h-3 w-3" />
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Under Development</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto mb-4">
          This service is being rolled out for Elora Android users in the next update.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
