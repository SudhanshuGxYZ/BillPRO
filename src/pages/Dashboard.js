function Dashboard({ invoices, customers, users, currentUser, business, setPage, notifications }) {
  const isAdmin = currentUser.role==="admin";
  const myInvoices = isAdmin ? invoices : invoices.filter(i=>i.createdBy===currentUser.id);
  const myCustomers = isAdmin ? customers : customers.filter(c=>c.assignedTo===currentUser.id);

  const totalBilled = myInvoices.reduce((s,i)=>s+i.total,0);
  const totalCollected = myInvoices.reduce((s,i)=>s+i.paid,0);
  const totalPending = totalBilled-totalCollected;
  const overdueInvoices = myInvoices.filter(i=>i.status==="overdue");
  const pendingInvoices = myInvoices.filter(i=>["pending","partial"].includes(i.status));
  const unreadNotifs = notifications.filter(n=>!n.read);

  // Statement download state
  const [showStatement, setShowStatement] = React.useState(false);
  const [stFrom, setStFrom] = React.useState(new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString().split("T")[0]);
  const [stTo, setStTo] = React.useState(new Date().toISOString().split("T")[0]);

  // Charts
  const barRef = React.useRef(null); const barInst = React.useRef(null);
  const donutRef = React.useRef(null); const donutInst = React.useRef(null);
  const revenueData = getRevenueByMonth(myInvoices);

  React.useEffect(()=>{
    if(barRef.current){
      if(barInst.current) barInst.current.destroy();
      barInst.current = new Chart(barRef.current.getContext("2d"),{
        type:"bar", data:{ labels:Object.keys(revenueData),
          datasets:[{label:"Billed",data:Object.values(revenueData).map(v=>v.billed),backgroundColor:"rgba(139,92,246,0.8)",borderRadius:8,borderSkipped:false},{label:"Collected",data:Object.values(revenueData).map(v=>v.collected),backgroundColor:"rgba(99,102,241,0.8)",borderRadius:8,borderSkipped:false}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"top"},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${formatCurrency(c.raw)}`}}},scales:{y:{beginAtZero:true,grid:{color:"rgba(0,0,0,0.05)"},ticks:{callback:v=>`₹${(v/1000).toFixed(0)}k`}},x:{grid:{display:false}}}}
      });
    }
    return ()=>{ if(barInst.current) barInst.current.destroy(); };
  },[invoices]);

  React.useEffect(()=>{
    if(donutRef.current){
      if(donutInst.current) donutInst.current.destroy();
      const sc={paid:0,partial:0,pending:0,overdue:0};
      myInvoices.forEach(i=>{if(sc[i.status]!==undefined)sc[i.status]++;});
      donutInst.current = new Chart(donutRef.current.getContext("2d"),{
        type:"doughnut", data:{labels:["Paid","Partial","Pending","Overdue"],datasets:[{data:Object.values(sc),backgroundColor:["#10b981","#f59e0b","#3b82f6","#ef4444"],borderWidth:0,hoverOffset:8}]},
        options:{responsive:true,maintainAspectRatio:false,cutout:"70%",plugins:{legend:{position:"bottom"}}}
      });
    }
    return ()=>{ if(donutInst.current) donutInst.current.destroy(); };
  },[invoices]);

  const stats = [
    {label:"Total Billed",value:formatCurrency(totalBilled),icon:"🧾",color:"from-violet-500 to-indigo-600",sub:"+12% this month"},
    {label:"Collected",value:formatCurrency(totalCollected),icon:"✅",color:"from-emerald-500 to-teal-600",sub:`${myInvoices.filter(i=>i.status==="paid").length} paid`},
    {label:"Outstanding",value:formatCurrency(totalPending),icon:"⏳",color:"from-amber-500 to-orange-600",sub:`${pendingInvoices.length} invoices`},
    {label:"Overdue",value:formatCurrency(overdueInvoices.reduce((s,i)=>s+i.total-i.paid,0)),icon:"⚠️",color:"from-red-500 to-rose-600",sub:`${overdueInvoices.length} invoices`}
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Good {new Date().getHours()<12?"Morning":new Date().getHours()<17?"Afternoon":"Evening"}, {currentUser.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {unreadNotifs.length>0&&(
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-red-100 transition-colors" onClick={()=>setPage("notifications")}>
              <span className="text-red-500 text-lg">🔔</span><span className="text-red-700 text-sm font-semibold">{unreadNotifs.length} alerts</span>
            </div>
          )}
          {/* Statement Download — Admin only */}
          {isAdmin && (
            <button onClick={()=>setShowStatement(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm">
              📥 Download Statement
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s,i)=>(
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className={`bg-gradient-to-r ${s.color} p-4 flex items-start justify-between`}>
              <div><p className="text-white/80 text-xs font-medium">{s.label}</p><p className="text-white text-2xl font-black mt-0.5">{s.value}</p></div>
              <span className="text-3xl opacity-80">{s.icon}</span>
            </div>
            <div className="px-4 py-2"><span className="text-gray-500 text-xs">{s.sub}</span></div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-gray-800 font-bold mb-4">Revenue Overview (Last 6 Months)</h3>
          <div style={{height:"240px"}}><canvas ref={barRef}></canvas></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-gray-800 font-bold mb-4">Invoice Status</h3>
          <div style={{height:"240px"}}><canvas ref={donutRef}></canvas></div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Invoices</h3>
            <button onClick={()=>setPage("invoices")} className="text-violet-600 text-sm font-semibold hover:text-violet-700">View All →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {myInvoices.slice(0,5).map(inv=>(
              <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div><p className="text-sm font-semibold text-gray-800">{inv.id}</p><p className="text-xs text-gray-500">{inv.customerName} · {formatDate(inv.createdAt)}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-gray-800">{formatCurrency(inv.total)}</p><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(inv.status)}`}>{inv.status}</span></div>
              </div>
            ))}
            {myInvoices.length===0&&<div className="px-5 py-10 text-center text-gray-400 text-sm">No invoices yet</div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">⚠️ Pending Dues</h3>
            <button onClick={()=>setPage("customers")} className="text-violet-600 text-sm font-semibold hover:text-violet-700">View All →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {myCustomers.map(c=>({...c,outstanding:(c.totalBilled||0)-(c.totalPaid||0)})).filter(c=>c.outstanding>0).sort((a,b)=>b.outstanding-a.outstanding).slice(0,5).map(c=>(
              <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(c.name)}`}>{c.name.charAt(0)}</div>
                  <div><p className="text-sm font-semibold text-gray-800">{c.name}</p><p className="text-xs text-gray-500">{c.businessName||c.phone}</p></div>
                </div>
                <div className="text-right"><p className="text-sm font-bold text-red-600">{formatCurrency(c.outstanding)}</p><p className="text-xs text-gray-400">outstanding</p></div>
              </div>
            ))}
            {myCustomers.filter(c=>(c.totalBilled||0)-(c.totalPaid||0)>0).length===0&&<div className="px-5 py-8 text-center text-gray-400 text-sm">🎉 All customers paid up!</div>}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {label:"Total Customers",value:customers.length,icon:"👥",color:"bg-blue-50 text-blue-700 border-blue-100"},
            {label:"Active Staff",value:users.filter(u=>u.role==="user"&&u.status==="active").length,icon:"👤",color:"bg-violet-50 text-violet-700 border-violet-100"},
            {label:"Total Invoices",value:invoices.length,icon:"🧾",color:"bg-emerald-50 text-emerald-700 border-emerald-100"},
            {label:"Overdue Alerts",value:overdueInvoices.length,icon:"⚠️",color:"bg-red-50 text-red-700 border-red-100"}
          ].map((s,i)=>(
            <div key={i} className={`rounded-2xl border p-4 ${s.color}`}>
              <div className="flex items-center gap-3"><span className="text-2xl">{s.icon}</span><div><p className="text-2xl font-black">{s.value}</p><p className="text-xs font-medium opacity-80">{s.label}</p></div></div>
            </div>
          ))}
        </div>
      )}

      {/* Statement Download Modal */}
      {showStatement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">📥 Download Statement</h3>
              <button onClick={()=>setShowStatement(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-700">
                📊 Generate a full invoice statement PDF for any date range.
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">From Date</label>
                <input type="date" value={stFrom} onChange={e=>setStFrom(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">To Date</label>
                <input type="date" value={stTo} onChange={e=>setStTo(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                📋 {invoices.filter(i=>{ const d=new Date(i.createdAt); return d>=new Date(stFrom)&&d<=new Date(stTo); }).length} invoices in selected range
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={()=>setShowStatement(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={()=>{ generateStatementPDF(business, invoices, customers, stFrom, stTo); setShowStatement(false); }}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90">
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
