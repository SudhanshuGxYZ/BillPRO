function Navbar({ title, user, setPage, unreadCount, actions }) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0 sticky top-0 z-20 shadow-sm">
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {user.role !== "superadmin" && (
          <button onClick={()=>setPage("notifications")} className="relative p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
            <span className="text-xl">🔔</span>
            {unreadCount>0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount}</span>}
          </button>
        )}
        {actions && actions.map((a,i)=>(
          <button key={i} onClick={a.onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${a.primary?"bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90 shadow-sm":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            {a.icon && <span>{a.icon}</span>}{a.label}
          </button>
        ))}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${user.role==="superadmin"?"from-purple-600 to-pink-600":user.role==="admin"?"from-violet-500 to-indigo-600":"from-blue-500 to-cyan-600"}`}>
          {user.avatar}
        </div>
      </div>
    </div>
  );
}
