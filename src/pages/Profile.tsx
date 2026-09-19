import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, CheckCircle2, Dices, Sparkles, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  CARTOON_AVATARS, 
  CARTOON_CATEGORIES, 
  getRandomCartoonAvatar,
  generateCustomCartoonAvatar 
} from '../data/avatars';

export default function Profile() {
  const { currentUser, updateUser, theme, setTheme } = useAppStore();
  const navigate = useNavigate();

  // If user had a realistic photo or empty, default to a cartoon avatar
  const initialAvatar = currentUser?.profilePic && !currentUser.profilePic.includes('unsplash.com')
    ? currentUser.profilePic
    : CARTOON_AVATARS[0].url;

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [profilePic, setProfilePic] = useState(initialAvatar);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!currentUser) return null;

  const filteredAvatars = selectedCategory === 'all'
    ? CARTOON_AVATARS
    : CARTOON_AVATARS.filter(a => a.category === selectedCategory);

  const handleShuffle = () => {
    // Generate a fresh, random cartoon avatar
    const randomSeed = `hero-${Math.random().toString(36).substring(2, 8)}`;
    const styles: Array<'adventurer' | 'bottts' | 'avataaars' | 'fun-emoji' | 'micah'> = [
      'adventurer', 'bottts', 'avataaars', 'fun-emoji', 'micah'
    ];
    const pickedStyle = styles[Math.floor(Math.random() * styles.length)];
    const generated = generateCustomCartoonAvatar(randomSeed, pickedStyle);
    setProfilePic(generated);
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const updates: any = {};
    if (fullName !== currentUser.fullName) updates.fullName = fullName;
    if (profilePic !== currentUser.profilePic) updates.profilePic = profilePic;

    if (newPassword) {
      if (oldPassword !== currentUser.password) {
        return setError('Old password is incorrect.');
      }
      updates.password = newPassword;
    }

    try {
      updateUser(currentUser.id, updates);
      setSuccess('Profile updated successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">My Profile</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Cartoon avatar & account settings</p>
        </div>
      </div>

      {/* Global Appearance / Theme Switcher Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight mb-1">
          Interface Theme
        </h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">
          Switch between crisp light mode and eye-comfort dark mode.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
              theme === 'light'
                ? "bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-400/20 shadow-xs"
                : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              theme === 'light' ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            )}>
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Light Theme</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Clean bright view</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
              theme === 'dark'
                ? "bg-slate-800 border-indigo-500 text-white ring-2 ring-indigo-500/20 shadow-xs"
                : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              theme === 'dark' ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            )}>
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Theme</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Eye-comfort dark</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-xs font-semibold">{error}</div>}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-xl text-xs font-semibold flex gap-2 items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}
          
          {/* Active Profile Avatar Preview */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-500 shadow-xs p-1 flex items-center justify-center shrink-0">
              <img 
                src={profilePic} 
                alt="Selected Avatar" 
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.fullName}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Pick from our avatar collection below</p>
              <button
                type="button"
                onClick={handleShuffle}
                className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 active:scale-95 transition-transform"
              >
                <Dices className="w-3 h-3" />
                <span>Shuffle New Avatar</span>
              </button>
            </div>
          </div>

          {/* Avatar Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Select Avatar</label>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{filteredAvatars.length} available</span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1.5 no-scrollbar">
              {CARTOON_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all",
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Cartoon Avatars Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800">
              {filteredAvatars.map((avatar) => {
                const isSelected = profilePic === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setProfilePic(avatar.url)}
                    className={cn(
                      "relative aspect-square rounded-xl p-1 transition-all bg-white dark:bg-slate-800 flex flex-col items-center justify-center group",
                      isSelected
                        ? "border-2 border-blue-600 ring-2 ring-blue-500/20 scale-95 shadow-xs"
                        : "border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xs"
                    )}
                  >
                    <img 
                      src={avatar.url} 
                      alt={avatar.name} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 truncate w-full text-center mt-0.5">
                      {avatar.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User ID & Username */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">User ID</label>
              <input 
                type="text" 
                readOnly 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl py-2 px-3 text-xs outline-none font-mono" 
                value={currentUser.id} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Username</label>
              <input 
                type="text" 
                readOnly 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl py-2 px-3 text-xs outline-none" 
                value={currentUser.username} 
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              required
              type="text"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          {/* Password Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Security / Password</h4>
            <div>
              <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">Old Password</label>
              <input
                type="password"
                placeholder="Current password"
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-1.5 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                minLength={6}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-1.5 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-[0.98] transition-all shadow-sm"
          >
            Save Profile & Avatar
          </button>
        </form>
      </div>
    </div>
  );
}
