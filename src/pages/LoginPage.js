function LoginPage({ onLogin }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [activeDemo, setActiveDemo] = React.useState(null);

  const demos = [
    { role:"superadmin", label:"Super Admin", icon:"👑", color:"from-purple-600 to-pink-600",
      email:"raj@billpro.com", password:"super123", desc:"Full platform control" },
    { role:"admin", label:"Business Admin", icon:"🛡️", color:"from-violet-500 to-indigo-600",
      email:"admin@techsoft.com", password:"admin123", desc:"Manage one business" },
    { role:"user", label:"Staff User", icon:"👤", color:"from-blue-500 to-cyan-600",
      email:"ravi@techsoft.com", password:"user123", desc:"Day-to-day billing" }
  ];

  function handleDemoLogin(demo) {
    setEmail(demo.email);
    setPassword(demo.password);
    setActiveDemo(demo.role);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    setTimeout(()=>{ const ok=onLogin(email,password); if(!ok) setError("Invalid credentials."); setLoading(false); },700);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* BG orbs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-violet-600 rounded-full opacity-10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay:"1.5s"}}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl shadow-2xl mb-4">
            <span className="text-4xl">💼</span>
          </div>
          <h1 className="text-4xl font-black text-white">BillPro</h1>
          <p className="text-purple-300 text-sm mt-1">Smart Multi-Business Billing Platform</p>
        </div>

        {/* Demo selector */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 mb-4">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-widest text-center mb-3">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            {demos.map(d=>(
              <button key={d.role} onClick={()=>handleDemoLogin(d)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${activeDemo===d.role?"border-white/40 bg-white/10":"border-transparent bg-white/5 hover:bg-white/10"}`}>
                <div className={`w-8 h-8 bg-gradient-to-br ${d.color} rounded-lg flex items-center justify-center text-base mx-auto mb-1`}>{d.icon}</div>
                <p className="text-white text-xs font-bold">{d.label}</p>
                <p className="text-purple-400 text-xs leading-tight">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
          <p className="text-purple-300 text-sm mb-5">Access your billing dashboard</p>
          {error && <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 mb-4 text-red-300 text-sm">⚠️ {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-purple-200 text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400">📧</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Enter email"
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-11 pr-4 text-white placeholder-purple-400 focus:outline-none focus:border-violet-400 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-purple-200 text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400">🔒</span>
                <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter password"
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-11 pr-11 text-white placeholder-purple-400 focus:outline-none focus:border-violet-400 transition-all" />
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white">{showPass?"🙈":"👁️"}</button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading?<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Signing in...</>:<>🚀 Sign In</>}
            </button>
          </form>
          <p className="text-purple-400 text-xs text-center mt-5">New accounts are created by Admin or Super Admin only.</p>
        </div>
      </div>
    </div>
  );
}
