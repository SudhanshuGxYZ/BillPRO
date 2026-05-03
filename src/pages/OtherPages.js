// ===================== USERS PAGE =====================
function UsersPage({ users, setUsers, currentUser }) {
  const [showModal,setShowModal]=React.useState(false);
  const [editUser,setEditUser]=React.useState(null);
  const [search,setSearch]=React.useState("");
  const emptyForm={name:"",email:"",password:"",phone:"",role:"user",status:"active"};
  const [form,setForm]=React.useState(emptyForm);
  const bizUsers=users.filter(u=>u.businessId===currentUser.businessId&&u.role!=="superadmin");
  const filtered=bizUsers.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));

  function openAdd(){setEditUser(null);setForm(emptyForm);setShowModal(true);}
  function openEdit(u){setEditUser(u);setForm({...u});setShowModal(true);}
  function save(){
    if(!form.name||!form.email) return alert("Name and email required.");
    if(!editUser&&!form.password) return alert("Password required.");
    if(editUser){setUsers(prev=>prev.map(u=>u.id===editUser.id?{...u,...form}:u));}
    else{setUsers(prev=>[...prev,{...form,id:generateId("u"),businessId:currentUser.businessId,avatar:form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),createdAt:new Date().toISOString().split("T")[0],lastLogin:"Never"}]);}
    setShowModal(false);
  }
  function toggleStatus(id){if(id===currentUser.id) return; setUsers(prev=>prev.map(u=>u.id===id?{...u,status:u.status==="active"?"inactive":"active"}:u));}
  function deleteUser(id){if(id===currentUser.id) return; if(!confirm("Delete user?")) return; setUsers(prev=>prev.filter(u=>u.id!==id));}

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-white w-52"/>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm">➕ Add Staff User</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{l:"Total Staff",v:bizUsers.filter(u=>u.role!=="admin").length,c:"text-gray-800"},{l:"Active",v:bizUsers.filter(u=>u.status==="active").length,c:"text-emerald-600"},{l:"Inactive",v:bizUsers.filter(u=>u.status==="inactive").length,c:"text-red-600"}].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4"><p className={`text-2xl font-black ${s.c}`}>{s.v}</p><p className="text-xs text-gray-500">{s.l}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(u=>(
          <div key={u.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${u.status==="inactive"?"opacity-60":"border-gray-100"} ${u.id===currentUser.id?"border-violet-200 ring-1 ring-violet-100":""}`}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white ${getAvatarColor(u.name)}`}>{u.avatar}</div>
                  <div>
                    <div className="flex items-center gap-1.5"><h3 className="font-bold text-gray-800">{u.name}</h3>{u.id===currentUser.id&&<span className="text-xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-md font-semibold">You</span>}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${u.role==="admin"?"bg-violet-100 text-violet-600":"bg-blue-100 text-blue-600"}`}>{u.role==="admin"?"🛡️ Admin":"👤 Staff"}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getStatusColor(u.status)}`}>{u.status}</span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex gap-2"><span>📧</span><span className="truncate text-xs">{u.email}</span></div>
                <div className="flex gap-2"><span>📱</span><span className="text-xs">{u.phone}</span></div>
                <div className="flex gap-2"><span>📅</span><span className="text-xs">Joined: {formatDate(u.createdAt)}</span></div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-5 py-3 flex gap-2">
              <button onClick={()=>openEdit(u)} className="flex-1 text-xs font-semibold text-violet-600 hover:text-violet-700 py-1.5 hover:bg-violet-50 rounded-lg">✏️ Edit</button>
              {u.id!==currentUser.id&&<button onClick={()=>toggleStatus(u.id)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg ${u.status==="active"?"text-amber-600 hover:bg-amber-50":"text-emerald-600 hover:bg-emerald-50"}`}>{u.status==="active"?"🔒 Deactivate":"✅ Activate"}</button>}
              {u.id!==currentUser.id&&u.role!=="admin"&&<button onClick={()=>deleteUser(u.id)} className="text-xs font-semibold text-red-500 py-1.5 px-2 hover:bg-red-50 rounded-lg">🗑️</button>}
            </div>
          </div>
        ))}
      </div>
      {showModal&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b"><h3 className="text-xl font-bold">{editUser?"✏️ Edit Staff":"➕ Add Staff User"}</h3><button onClick={()=>setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button></div>
            <div className="p-6 space-y-3">
              {[{key:"name",label:"Full Name *"},{key:"email",label:"Email *",type:"email"},{key:"password",label:editUser?"New Password (blank to keep)":"Password *",type:"password"},{key:"phone",label:"Phone"}].map(f=>(
                <div key={f.key}><label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                  <input type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm(ff=>({...ff,[f.key]:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400"/></div>
              ))}
              <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Role</label>
                <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400">
                  <option value="user">👤 Staff User</option><option value="admin">🛡️ Admin</option>
                </select>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Status</label>
                <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400">
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t"><button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90">{editUser?"Save Changes":"Create User"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== PRODUCTS PAGE =====================
function ProductsPage({ products, setProducts, currentUser }) {
  const [search,setSearch]=React.useState("");
  const [showModal,setShowModal]=React.useState(false);
  const [editProduct,setEditProduct]=React.useState(null);
  const emptyForm={name:"",price:"",tax:18,category:"",unit:"piece"};
  const [form,setForm]=React.useState(emptyForm);
  const isAdmin=currentUser.role==="admin";
  const bizProducts=products.filter(p=>p.businessId===currentUser.businessId);
  const filtered=bizProducts.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||(p.category||"").toLowerCase().includes(search.toLowerCase()));
  const categories=[...new Set(bizProducts.map(p=>p.category).filter(Boolean))];

  function openAdd(){setEditProduct(null);setForm(emptyForm);setShowModal(true);}
  function openEdit(p){setEditProduct(p);setForm({...p});setShowModal(true);}
  function save(){
    if(!form.name||!form.price) return alert("Name and price required.");
    if(editProduct){setProducts(prev=>prev.map(p=>p.id===editProduct.id?{...p,...form,price:Number(form.price),tax:Number(form.tax)}:p));}
    else{setProducts(prev=>[...prev,{...form,id:generateId("p"),businessId:currentUser.businessId,price:Number(form.price),tax:Number(form.tax)}]);}
    setShowModal(false);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-white w-52"/>
        </div>
        {isAdmin&&<button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm">➕ Add Product/Service</button>}
      </div>
      {categories.length>0&&<div className="flex gap-2 flex-wrap">{categories.map(c=><span key={c} className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-semibold">{c}</span>)}</div>}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100"><tr>{["#","Name","Category","Price","Tax %","Unit","Actions"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p,i)=>(
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 text-xs">{i+1}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">{p.category||"—"}</span></td>
                <td className="px-4 py-3 font-bold text-gray-800">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3 text-gray-600">{p.tax}%</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{p.unit}</td>
                <td className="px-4 py-3">{isAdmin&&<div className="flex gap-1">
                  <button onClick={()=>openEdit(p)} className="p-1.5 hover:bg-violet-100 rounded-lg text-violet-600 text-xs">✏️</button>
                  <button onClick={()=>setProducts(prev=>prev.filter(x=>x.id!==p.id))} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 text-xs">🗑️</button>
                </div>}</td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={7} className="text-center py-10 text-gray-400">No products found for this business</td></tr>}
          </tbody>
        </table>
      </div>
      {showModal&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b"><h3 className="text-xl font-bold">{editProduct?"✏️ Edit Product":"➕ Add Product/Service"}</h3><button onClick={()=>setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button></div>
            <div className="p-6 space-y-3">
              {[{key:"name",label:"Name *"},{key:"price",label:"Base Price (₹) *",type:"number"},{key:"tax",label:"Tax Rate (%)",type:"number"},{key:"category",label:"Category"},{key:"unit",label:"Unit"}].map(f=>(
                <div key={f.key}><label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                  <input type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm(ff=>({...ff,[f.key]:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400"/></div>
              ))}
            </div>
            <div className="flex gap-3 p-6 border-t"><button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== REPORTS PAGE =====================
function ReportsPage({ invoices, customers, currentUser }) {
  const isAdmin=currentUser.role==="admin";
  const myInvoices=isAdmin?invoices:invoices.filter(i=>i.createdBy===currentUser.id);
  const totalBilled=myInvoices.reduce((s,i)=>s+i.total,0);
  const totalCollected=myInvoices.reduce((s,i)=>s+i.paid,0);
  const totalOutstanding=totalBilled-totalCollected;
  const collectionRate=totalBilled>0?((totalCollected/totalBilled)*100).toFixed(1):0;
  const revenueData=getRevenueByMonth(myInvoices);
  const chartRef=React.useRef(null); const chartInst=React.useRef(null);

  React.useEffect(()=>{
    if(!chartRef.current) return;
    if(chartInst.current) chartInst.current.destroy();
    chartInst.current=new Chart(chartRef.current.getContext("2d"),{
      type:"line",
      data:{labels:Object.keys(revenueData),datasets:[
        {label:"Billed",data:Object.values(revenueData).map(v=>v.billed),borderColor:"#8b5cf6",backgroundColor:"rgba(139,92,246,0.1)",fill:true,tension:0.4,pointBackgroundColor:"#8b5cf6"},
        {label:"Collected",data:Object.values(revenueData).map(v=>v.collected),borderColor:"#10b981",backgroundColor:"rgba(16,185,129,0.1)",fill:true,tension:0.4,pointBackgroundColor:"#10b981"}
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"top"}},scales:{y:{beginAtZero:true,ticks:{callback:v=>`₹${(v/1000).toFixed(0)}k`}},x:{grid:{display:false}}}}
    });
    return ()=>{if(chartInst.current) chartInst.current.destroy();};
  },[invoices]);

  const debtors=customers.map(c=>({...c,outstanding:(c.totalBilled||0)-(c.totalPaid||0)})).filter(c=>c.outstanding>0).sort((a,b)=>b.outstanding-a.outstanding).slice(0,5);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{l:"Total Revenue",v:formatCurrency(totalBilled),i:"💰",c:"from-violet-500 to-indigo-600"},{l:"Collected",v:formatCurrency(totalCollected),i:"✅",c:"from-emerald-500 to-teal-600"},{l:"Outstanding",v:formatCurrency(totalOutstanding),i:"⏳",c:"from-amber-500 to-orange-600"},{l:"Collection Rate",v:`${collectionRate}%`,i:"📈",c:"from-blue-500 to-cyan-600"}].map((s,i)=>(
          <div key={i} className={`bg-gradient-to-r ${s.c} rounded-2xl p-5 text-white`}><div className="flex items-start justify-between"><div><p className="text-white/70 text-xs">{s.l}</p><p className="text-2xl font-black mt-1">{s.v}</p></div><span className="text-3xl">{s.i}</span></div></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-gray-800 font-bold mb-4">📈 Revenue Trend (Last 6 Months)</h3>
        <div style={{height:"280px"}}><canvas ref={chartRef}></canvas></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-gray-800 font-bold mb-4">🧾 Invoice Status Breakdown</h3>
          <div className="space-y-3">
            {["paid","partial","pending","overdue"].map(s=>{
              const cnt=myInvoices.filter(i=>i.status===s).length;
              const amt=myInvoices.filter(i=>i.status===s).reduce((sum,i)=>sum+i.total,0);
              const pct=myInvoices.length>0?(cnt/myInvoices.length*100).toFixed(0):0;
              const cols={paid:"bg-emerald-500",partial:"bg-amber-500",pending:"bg-blue-500",overdue:"bg-red-500"};
              return (<div key={s}><div className="flex justify-between text-sm mb-1"><span className="capitalize font-medium text-gray-700">{s} ({cnt})</span><span className="font-bold text-gray-800">{formatCurrency(amt)}</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${cols[s]}`} style={{width:`${pct}%`}}></div></div></div>);
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-gray-800 font-bold mb-4">⚠️ Top Outstanding Accounts</h3>
          <div className="space-y-3">
            {debtors.length===0&&<p className="text-gray-400 text-sm text-center py-4">🎉 No outstanding dues!</p>}
            {debtors.map((c,i)=>(
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-gray-400 text-xs font-bold">#{i+1}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${getAvatarColor(c.name)}`}>{c.name.charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden"><div className="h-full bg-red-400 rounded-full" style={{width:`${Math.min(100,(c.outstanding/debtors[0].outstanding)*100)}%`}}></div></div>
                </div>
                <span className="font-bold text-red-600 text-sm shrink-0">{formatCurrency(c.outstanding)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-gray-800 font-bold mb-4">📋 Monthly Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{["Month","Billed","Collected","Outstanding","Invoices"].map(h=><th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {Object.entries(revenueData).reverse().map(([month,data])=>{
                const mi=myInvoices.filter(i=>{const d=new Date(i.createdAt);return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`===month;});
                return (<tr key={month} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-700">{month}</td><td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(data.billed)}</td><td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(data.collected)}</td><td className="px-4 py-3 text-red-500 font-medium">{formatCurrency(data.billed-data.collected)}</td><td className="px-4 py-3 text-gray-600">{mi.length}</td></tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===================== NOTIFICATIONS PAGE =====================
function NotificationsPage({ notifications, setNotifications, invoices, customers, business, setPage }) {
  function markAllRead(){setNotifications(prev=>prev.map(n=>({...n,read:true})));}
  function markRead(id){setNotifications(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));}
  function deleteNotif(id){setNotifications(prev=>prev.filter(n=>n.id!==id));}
  const overdueInvoices=invoices.filter(i=>i.status==="overdue"||(i.status!=="paid"&&new Date(i.dueDate)<new Date()));
  const unread=notifications.filter(n=>!n.read);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{unread.length} unread notifications</p>
        {unread.length>0&&<button onClick={markAllRead} className="text-sm text-violet-600 font-semibold hover:text-violet-700">✓ Mark all read</button>}
      </div>
      {overdueInvoices.length>0&&(
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="text-red-700 font-bold mb-3">⚠️ Overdue Invoices ({overdueInvoices.length})</h3>
          <div className="space-y-2">
            {overdueInvoices.map(inv=>{
              const cust=customers.find(c=>c.id===inv.customerId);
              return (
                <div key={inv.id} className="bg-white rounded-xl border border-red-100 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-lg">⚠️</div>
                    <div><p className="font-semibold text-gray-800">{inv.id} — {inv.customerName}</p>
                      <p className="text-xs text-red-500">{daysOverdue(inv.dueDate)} days overdue · Balance: {formatCurrency(inv.total-inv.paid)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {cust&&business&&<a href={`https://wa.me/${cust.phone.replace(/\D/g,"")}?text=${getWhatsAppMessage(cust,inv,business)}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600">📱 WA</a>}
                    {cust&&business&&<button onClick={()=>{navigator.clipboard.writeText(getSMSDraft(cust,inv,business));alert("SMS copied!");}} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600">💬 SMS</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="space-y-2">
        {notifications.length===0&&<div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🔔</div><p>No notifications</p></div>}
        {notifications.map(n=>(
          <div key={n.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-3 transition-all hover:shadow-md ${n.read?"opacity-70 border-gray-100":"border-violet-200"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${n.read?"bg-gray-100":"bg-violet-50"}`}>{getNotificationIcon(n.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div><p className={`font-semibold text-sm ${n.read?"text-gray-600":"text-gray-800"}`}>{n.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{formatDate(n.createdAt)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.read&&<button onClick={()=>markRead(n.id)} className="p-1.5 hover:bg-violet-100 rounded-lg text-violet-600 text-xs">✓</button>}
                  <button onClick={()=>deleteNotif(n.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 text-xs">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== SETTINGS PAGE =====================
function SettingsPage({ business, setBusiness, currentUser }) {
  const isAdmin=currentUser.role==="admin";
  const [form,setForm]=React.useState({...business});
  const [saved,setSaved]=React.useState(false);

  React.useEffect(()=>{ setForm({...business}); },[business]);

  function save(){setBusiness(form);setSaved(true);setTimeout(()=>setSaved(false),2500);}

  if(!isAdmin) return <div className="flex-1 flex items-center justify-center text-gray-400"><div className="text-center"><div className="text-5xl mb-3">🔒</div><p>Settings accessible by Admin only.</p></div></div>;

  const sections=[
    {title:"Business Information",icon:"🏢",fields:[{key:"name",label:"Business Name"},{key:"email",label:"Business Email",type:"email"},{key:"phone",label:"Phone"},{key:"address",label:"Address"},{key:"gstin",label:"GSTIN"}]},
    {title:"Invoice Settings",icon:"🧾",fields:[{key:"invoicePrefix",label:"Invoice Prefix"},{key:"currency",label:"Currency Code"},{key:"currencySymbol",label:"Currency Symbol"},{key:"taxLabel",label:"Tax Label"},{key:"defaultTax",label:"Default Tax %",type:"number"},{key:"paymentTerms",label:"Payment Terms (days)",type:"number"},{key:"invoiceFooter",label:"Invoice Footer"}]},
    {title:"Payment Details",icon:"💳",fields:[{key:"bankName",label:"Bank Name"},{key:"accountNumber",label:"Account Number"},{key:"ifscCode",label:"IFSC Code"},{key:"upiId",label:"UPI ID"}]}
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
      {saved&&<div className="fixed top-4 right-4 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-lg font-semibold z-50 flex items-center gap-2">✅ Settings saved!</div>}
      {sections.map(section=>(
        <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2"><span className="text-xl">{section.icon}</span><h3 className="font-bold text-gray-800">{section.title}</h3></div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map(f=>(
              <div key={f.key}><label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.label}</label>
                <input type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm(ff=>({...ff,[f.key]:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400"/>
              </div>
            ))}
            <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Brand Color</label>
              <div className="flex gap-2 items-center"><input type="color" value={form.logoColor||"#6366f1"} onChange={e=>setForm(f=>({...f,logoColor:e.target.value}))} className="h-10 w-20 rounded-xl border border-gray-200 cursor-pointer p-1"/>
                <span className="text-sm text-gray-600">{form.logoColor}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-end"><button onClick={save} className="px-8 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-bold hover:opacity-90 shadow-sm">💾 Save Settings</button></div>
    </div>
  );
}
