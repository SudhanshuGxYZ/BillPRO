function Sidebar({ currentPage, setPage, user, business, onLogout, collapsed, setCollapsed, unreadCount }) {
  const superAdminNav = [
    { id:"sa-dashboard", icon:"🏠", label:"Overview" },
    { id:"sa-businesses", icon:"🏢", label:"Businesses" },
    { id:"sa-admins", icon:"🛡️", label:"Admins & Users" },
  ];
  const adminNav = [
    { id:"dashboard", icon:"🏠", label:"Dashboard" },
    { id:"invoices", icon:"🧾", label:"Invoices" },
    { id:"customers", icon:"👥", label:"Customers" },
    { id:"users", icon:"🛡️", label:"Staff Users" },
    { id:"products", icon:"📦", label:"Products / Services" },
    { id:"reports", icon:"📊", label:"Reports" },
    { id:"notifications", icon:"🔔", label:"Notifications", badge: unreadCount },
    { id:"settings", icon:"⚙️", label:"Settings" }
  ];
  const userNav = [
    { id:"dashboard", icon:"🏠", label:"Dashboard" },
    { id:"invoices", icon:"🧾", label:"Invoices" },
    { id:"customers", icon:"👥", label:"Customers" },
    { id:"products", icon:"📦", label:"Products" },
    { id:"notifications", icon:"🔔", label:"Notifications", badge: unreadCount },
  ];

  const nav = user.role==="superadmin" ? superAdminNav : user.role==="admin" ? adminNav : userNav;
  const roleColor = user.role==="superadmin" ? "from-purple-600 to-pink-600" : user.role==="admin" ? "from-violet-500 to-indigo-600" : "from-blue-500 to-cyan-600";
  const roleLabel = user.role==="superadmin" ? "👑 Super Admin" : user.role==="admin" ? "🛡️ Admin" : "👤 Staff";

  return (
    <div className={`h-screen bg-gray-900 flex flex-col transition-all duration-300 ${collapsed?"w-16":"w-64"} shrink-0 relative z-30 shadow-xl`}>
      {/* Logo */}
      <div className={`flex items-center ${collapsed?"justify-center px-2":"px-5"} py-5 border-b border-gray-700/50`}>
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-lg shrink-0">💼</div>
        {!collapsed && <div className="ml-3"><div className="text-white font-bold text-lg leading-none">BillPro</div><div className="text-gray-400 text-xs mt-0.5">Billing Platform</div></div>}
      </div>

      {/* Collapse btn */}
      <button onClick={()=>setCollapsed(!collapsed)} className="absolute -right-3 top-7 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 z-50 text-xs">{collapsed?"›":"‹"}</button>

      {/* Business badge (admin/user only) */}
      {!collapsed && business && user.role!=="superadmin" && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl text-xs font-semibold truncate" style={{background:business.logoColor+"22",color:business.logoColor,border:`1px solid ${business.logoColor}44`}}>
          🏢 {business.name}
        </div>
      )}

      {/* User info */}
      <div className={`${collapsed?"px-2 py-3":"px-4 py-3"} border-b border-gray-700/50 mt-2`}>
        <div className={`flex items-center ${collapsed?"justify-center":""} gap-3`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br ${roleColor}`}>{user.avatar}</div>
          {!collapsed && <div className="overflow-hidden"><div className="text-white text-sm font-semibold truncate">{user.name}</div><div className="text-xs text-gray-400">{roleLabel}</div></div>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {nav.map(item=>(
          <button key={item.id} onClick={()=>setPage(item.id)} title={collapsed?item.label:""}
            className={`w-full flex items-center ${collapsed?"justify-center px-2":"px-3"} py-2.5 rounded-xl text-sm transition-all relative group ${currentPage===item.id?"bg-violet-600 text-white shadow-lg shadow-violet-500/20":"text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
            <span className="text-lg shrink-0">{item.icon}</span>
            {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
            {item.badge>0 && <span className={`${collapsed?"absolute -top-1 -right-1":"ml-auto"} bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold`}>{item.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700/50">
        <button onClick={onLogout} title={collapsed?"Logout":""} className={`w-full flex items-center ${collapsed?"justify-center px-2":"px-3"} py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all`}>
          <span className="text-lg">🚪</span>
          {!collapsed && <span className="ml-3 font-medium">Log Out</span>}
        </button>
      </div>
    </div>
  );
}
