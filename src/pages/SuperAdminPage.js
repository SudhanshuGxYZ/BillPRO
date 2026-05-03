// ===================== SUPER ADMIN OVERVIEW =====================
function SuperAdminDashboard({ businesses, users, invoices, customers }) {
  const totalRevenue = invoices.reduce((s,i)=>s+i.total,0);
  const totalCollected = invoices.reduce((s,i)=>s+i.paid,0);
  const totalCustomers = customers.length;
  const totalAdmins = users.filter(u=>u.role==="admin").length;

  const chartRef = React.useRef(null);
  const chartInst = React.useRef(null);

  React.useEffect(()=>{
    if(!chartRef.current) return;
    if(chartInst.current) chartInst.current.destroy();
    const ctx = chartRef.current.getContext("2d");
    chartInst.current = new Chart(ctx, {
      type:"bar",
      data:{
        labels: businesses.map(b=>b.name.length>14?b.name.slice(0,14)+"…":b.name),
        datasets:[
          { label:"Billed", data:businesses.map(b=>invoices.filter(i=>i.businessId===b.id).reduce((s,i)=>s+i.total,0)), backgroundColor:"rgba(139,92,246,0.8)", borderRadius:6 },
          { label:"Collected", data:businesses.map(b=>invoices.filter(i=>i.businessId===b.id).reduce((s,i)=>s+i.paid,0)), backgroundColor:"rgba(16,185,129,0.8)", borderRadius:6 }
        ]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:"top"}}, scales:{y:{beginAtZero:true,ticks:{callback:v=>`₹${(v/1000).toFixed(0)}k`}},x:{grid:{display:false}}} }
    });
    return ()=>{ if(chartInst.current) chartInst.current.destroy(); };
  },[businesses, invoices]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">👑</span>
          <div>
            <h1 className="text-2xl font-black">Super Admin Control Centre</h1>
            <p className="text-purple-200 text-sm">Complete platform overview — all businesses, admins & billing activity</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total Businesses", value:businesses.length, icon:"🏢", color:"from-purple-500 to-pink-600" },
          { label:"Total Admins", value:totalAdmins, icon:"🛡️", color:"from-violet-500 to-indigo-600" },
          { label:"Total Revenue", value:formatCurrency(totalRevenue), icon:"💰", color:"from-emerald-500 to-teal-600" },
          { label:"Total Customers", value:totalCustomers, icon:"👥", color:"from-amber-500 to-orange-600" }
        ].map((s,i)=>(
          <div key={i} className={`bg-gradient-to-r ${s.color} rounded-2xl p-5 text-white`}>
            <div className="flex items-start justify-between"><div><p className="text-white/70 text-xs">{s.label}</p><p className="text-2xl font-black mt-1">{s.value}</p></div><span className="text-3xl">{s.icon}</span></div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4">📊 Revenue by Business</h3>
        <div style={{height:"240px"}}><canvas ref={chartRef}></canvas></div>
      </div>

      {/* Business cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {businesses.map(biz=>{
          const bizInvoices=invoices.filter(i=>i.businessId===biz.id);
          const bizCustomers=customers.filter(c=>c.businessId===biz.id);
          const bizAdmins=users.filter(u=>u.businessId===biz.id&&u.role==="admin");
          const bizStaff=users.filter(u=>u.businessId===biz.id&&u.role==="user");
          const billed=bizInvoices.reduce((s,i)=>s+i.total,0);
          const collected=bizInvoices.reduce((s,i)=>s+i.paid,0);
          const outstanding=billed-collected;
          return (
            <div key={biz.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="h-2" style={{background:biz.logoColor}}></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black text-white" style={{background:biz.logoColor}}>
                      {biz.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{biz.name}</h3>
                      <p className="text-xs text-gray-500">{biz.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${biz.plan==="premium"?"bg-violet-100 text-violet-700":"bg-gray-100 text-gray-600"}`}>{biz.plan}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[["Billed",formatCurrency(billed),"text-gray-800"],["Collected",formatCurrency(collected),"text-emerald-600"],["Outstanding",formatCurrency(outstanding),"text-red-600"],["Invoices",bizInvoices.length,"text-indigo-600"]].map(([l,v,c])=>(
                    <div key={l} className="bg-gray-50 rounded-xl p-2.5"><p className="text-xs text-gray-500">{l}</p><p className={`font-bold text-sm ${c}`}>{v}</p></div>
                  ))}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-violet-50 text-violet-700 px-2 py-1 rounded-lg font-medium">👥 {bizCustomers.length} customers</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">🛡️ {bizAdmins.length} admin</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-medium">👤 {bizStaff.length} staff</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== SUPER ADMIN — BUSINESS MANAGEMENT =====================
function SuperAdminBusinesses({ businesses, setBusinesses }) {
  const [showModal, setShowModal] = React.useState(false);
  const [editBiz, setEditBiz] = React.useState(null);
  const emptyForm = { name:"", email:"", phone:"", address:"", gstin:"", invoicePrefix:"INV", currency:"INR", currencySymbol:"₹", taxLabel:"GST", defaultTax:18, paymentTerms:30, invoiceFooter:"Thank you for your business!", bankName:"", accountNumber:"", ifscCode:"", upiId:"", logoColor:"#6366f1", plan:"basic" };
  const [form, setForm] = React.useState(emptyForm);

  function openAdd() { setEditBiz(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(b) { setEditBiz(b); setForm({...b}); setShowModal(true); }
  function save() {
    if(!form.name||!form.email) return alert("Name and email required.");
    if(editBiz) setBusinesses(prev=>prev.map(b=>b.id===editBiz.id?{...b,...form}:b));
    else setBusinesses(prev=>[...prev,{...form,id:generateId("b"),createdAt:new Date().toISOString().split("T")[0]}]);
    setShowModal(false);
  }
  function deleteBiz(id) { if(!confirm("Delete this business? All related data may be affected.")) return; setBusinesses(prev=>prev.filter(b=>b.id!==id)); }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">{businesses.length} registered businesses</p>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm">➕ Add Business</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businesses.map(biz=>(
          <div key={biz.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="h-1.5" style={{background:biz.logoColor}}></div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-md" style={{background:biz.logoColor}}>{biz.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{biz.name}</h3>
                    <p className="text-sm text-gray-500">{biz.email}</p>
                    <p className="text-xs text-gray-400">Since {formatDate(biz.createdAt)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${biz.plan==="premium"?"bg-violet-100 text-violet-700":"bg-gray-100 text-gray-600"}`}>{biz.plan}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                <div className="flex items-center gap-1"><span>📱</span>{biz.phone}</div>
                <div className="flex items-center gap-1"><span>🧾</span>Prefix: {biz.invoicePrefix}</div>
                <div className="flex items-center gap-1"><span>💳</span>UPI: {biz.upiId||"—"}</div>
                <div className="flex items-center gap-1"><span>🏦</span>{biz.bankName||"—"}</div>
                <div className="flex items-center gap-1 col-span-2"><span>📍</span>{biz.address}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>openEdit(biz)} className="flex-1 py-2 bg-violet-50 text-violet-700 rounded-xl text-xs font-semibold hover:bg-violet-100 transition-colors">✏️ Edit</button>
                <button onClick={()=>deleteBiz(biz.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b"><h3 className="text-xl font-bold">{editBiz?"✏️ Edit Business":"➕ Add New Business"}</h3><button onClick={()=>setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button></div>
            <div className="p-6 overflow-y-auto grid grid-cols-2 gap-4">
              {[
                {key:"name",label:"Business Name *"},{key:"email",label:"Email *",type:"email"},{key:"phone",label:"Phone"},{key:"address",label:"Address"},
                {key:"gstin",label:"GSTIN"},{key:"invoicePrefix",label:"Invoice Prefix"},{key:"currency",label:"Currency Code"},{key:"currencySymbol",label:"Currency Symbol"},
                {key:"taxLabel",label:"Tax Label"},{key:"defaultTax",label:"Default Tax %",type:"number"},{key:"paymentTerms",label:"Payment Terms (days)",type:"number"},
                {key:"bankName",label:"Bank Name"},{key:"accountNumber",label:"Account Number"},{key:"ifscCode",label:"IFSC Code"},{key:"upiId",label:"UPI ID"},
              ].map(f=>(
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                  <input type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm(ff=>({...ff,[f.key]:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Brand Color</label>
                <input type="color" value={form.logoColor||"#6366f1"} onChange={e=>setForm(f=>({...f,logoColor:e.target.value}))} className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer p-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Plan</label>
                <select value={form.plan||"basic"} onChange={e=>setForm(f=>({...f,plan:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400">
                  <option value="basic">Basic</option><option value="premium">Premium</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Invoice Footer</label>
                <input value={form.invoiceFooter||""} onChange={e=>setForm(f=>({...f,invoiceFooter:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90">{editBiz?"Save Changes":"Add Business"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== SUPER ADMIN — ADMINS & USERS =====================
function SuperAdminAdmins({ users, setUsers, businesses }) {
  const [showModal, setShowModal] = React.useState(false);
  const [editUser, setEditUser] = React.useState(null);
  const [filterBiz, setFilterBiz] = React.useState("all");
  const emptyForm = { name:"", email:"", password:"", phone:"", role:"admin", status:"active", businessId:"" };
  const [form, setForm] = React.useState(emptyForm);

  const managedUsers = users.filter(u=>u.role!=="superadmin");
  const filtered = filterBiz==="all" ? managedUsers : managedUsers.filter(u=>u.businessId===filterBiz);

  function openAdd() { setEditUser(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(u) { setEditUser(u); setForm({...u}); setShowModal(true); }
  function save() {
    if(!form.name||!form.email) return alert("Name and email required.");
    if(!editUser&&!form.password) return alert("Password required.");
    if(editUser) {
      setUsers(prev=>prev.map(u=>u.id===editUser.id?{...u,...form}:u));
    } else {
      setUsers(prev=>[...prev,{...form,id:generateId("u"),avatar:form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),createdAt:new Date().toISOString().split("T")[0],lastLogin:"Never"}]);
    }
    setShowModal(false);
  }
  function toggleStatus(id) { setUsers(prev=>prev.map(u=>u.id===id?{...u,status:u.status==="active"?"inactive":"active"}:u)); }
  function deleteUser(id) { if(!confirm("Delete user?")) return; setUsers(prev=>prev.filter(u=>u.id!==id)); }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button onClick={()=>setFilterBiz("all")} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filterBiz==="all"?"bg-purple-600 text-white border-purple-600":"bg-white text-gray-600 border-gray-200 hover:border-purple-300"}`}>All Businesses</button>
          {businesses.map(b=>(
            <button key={b.id} onClick={()=>setFilterBiz(b.id)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filterBiz===b.id?"text-white border-transparent":"bg-white text-gray-600 border-gray-200 hover:border-purple-300"}`} style={filterBiz===b.id?{background:b.logoColor}:{}}>{b.name.split(" ")[0]}</button>
          ))}
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm">➕ Add Admin/User</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {label:"Total Admins",value:managedUsers.filter(u=>u.role==="admin").length,color:"text-violet-700"},
          {label:"Total Staff",value:managedUsers.filter(u=>u.role==="user").length,color:"text-blue-700"},
          {label:"Active",value:managedUsers.filter(u=>u.status==="active").length,color:"text-emerald-700"},
          {label:"Inactive",value:managedUsers.filter(u=>u.status==="inactive").length,color:"text-red-600"}
        ].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3"><p className={`text-2xl font-black ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(u=>{
          const biz=businesses.find(b=>b.id===u.businessId);
          return (
            <div key={u.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${u.status==="inactive"?"opacity-60":"border-gray-100"}`}>
              <div className="h-1" style={{background:biz?.logoColor||"#e5e7eb"}}></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br ${u.role==="admin"?"from-violet-500 to-indigo-600":"from-blue-500 to-cyan-600"}`}>{u.avatar}</div>
                    <div>
                      <p className="font-bold text-gray-800">{u.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${u.role==="admin"?"bg-violet-100 text-violet-700":"bg-blue-100 text-blue-700"}`}>{u.role==="admin"?"🛡️ Admin":"👤 Staff"}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getStatusColor(u.status)}`}>{u.status}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2"><span>📧</span><span className="truncate text-xs">{u.email}</span></div>
                  <div className="flex items-center gap-2"><span>📱</span><span className="text-xs">{u.phone}</span></div>
                  {biz && <div className="flex items-center gap-2"><span>🏢</span><span className="text-xs font-medium" style={{color:biz.logoColor}}>{biz.name}</span></div>}
                  <div className="flex items-center gap-2"><span>📅</span><span className="text-xs">Joined: {formatDate(u.createdAt)}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>openEdit(u)} className="flex-1 text-xs font-semibold text-violet-600 hover:text-violet-700 py-1.5 hover:bg-violet-50 rounded-lg transition-colors">✏️ Edit</button>
                  <button onClick={()=>toggleStatus(u.id)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${u.status==="active"?"text-amber-600 hover:bg-amber-50":"text-emerald-600 hover:bg-emerald-50"}`}>{u.status==="active"?"🔒 Deactivate":"✅ Activate"}</button>
                  <button onClick={()=>deleteUser(u.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 py-1.5 px-2 hover:bg-red-50 rounded-lg">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length===0&&<div className="col-span-3 text-center py-16 text-gray-400"><div className="text-5xl mb-3">👤</div><p>No users found</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b"><h3 className="text-xl font-bold">{editUser?"✏️ Edit User":"➕ Add Admin/User"}</h3><button onClick={()=>setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button></div>
            <div className="p-6 space-y-3">
              {[{key:"name",label:"Full Name *"},{key:"email",label:"Email *",type:"email"},{key:"password",label:editUser?"New Password (leave blank to keep)":"Password *",type:"password"},{key:"phone",label:"Phone"}].map(f=>(
                <div key={f.key}><label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                  <input type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm(ff=>({...ff,[f.key]:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400" /></div>
              ))}
              <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Role</label>
                <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400">
                  <option value="admin">🛡️ Admin</option><option value="user">👤 Staff User</option>
                </select>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Assign to Business *</label>
                <select value={form.businessId||""} onChange={e=>setForm(f=>({...f,businessId:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400">
                  <option value="">Select business...</option>
                  {businesses.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Status</label>
                <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400">
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90">{editUser?"Save Changes":"Create User"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
