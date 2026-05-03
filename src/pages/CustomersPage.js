function CustomersPage({ customers, setCustomers, invoices, users, currentUser }) {
  const isAdmin = currentUser.role==="admin";
  const myCustomers = isAdmin ? customers : customers.filter(c=>c.assignedTo===currentUser.id);
  const [search,setSearch]=React.useState("");
  const [statusFilter,setStatusFilter]=React.useState("all");
  const [showModal,setShowModal]=React.useState(false);
  const [showView,setShowView]=React.useState(false);
  const [editCustomer,setEditCustomer]=React.useState(null);
  const [selectedCustomer,setSelectedCustomer]=React.useState(null);
  const emptyForm={name:"",email:"",phone:"",address:"",gstin:"",businessName:"",creditLimit:"",assignedTo:"",status:"active",notes:""};
  const [form,setForm]=React.useState(emptyForm);

  const filtered=myCustomers.filter(c=>{
    const ms=c.name.toLowerCase().includes(search.toLowerCase())||c.email.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search)||(c.businessName||"").toLowerCase().includes(search.toLowerCase());
    return ms&&(statusFilter==="all"||c.status===statusFilter);
  });

  function openAdd(){setEditCustomer(null);setForm(emptyForm);setShowModal(true);}
  function openEdit(c){setEditCustomer(c);setForm({...c,creditLimit:c.creditLimit||""});setShowModal(true);}

  function saveCustomer(){
    if(!form.name||!form.phone) return alert("Name and phone required.");
    if(editCustomer){
      setCustomers(prev=>prev.map(c=>c.id===editCustomer.id?{...c,...form,creditLimit:Number(form.creditLimit)||0}:c));
    } else {
      setCustomers(prev=>[{...form,id:generateId("c"),businessId:currentUser.businessId,creditLimit:Number(form.creditLimit)||0,totalBilled:0,totalPaid:0,createdAt:new Date().toISOString().split("T")[0]},...prev]);
    }
    setShowModal(false);
  }

  function deleteCustomer(id){if(!confirm("Delete customer?")) return; setCustomers(prev=>prev.filter(c=>c.id!==id));}
  function toggleFlag(id){setCustomers(prev=>prev.map(c=>c.id===id?{...c,status:c.status==="flagged"?"active":"flagged"}:c));}
  function viewCustomer(c){setSelectedCustomer(c);setShowView(true);}
  function getCInvoices(cid){return invoices.filter(i=>i.customerId===cid);}
  const staffUsers=users.filter(u=>u.role==="user"&&u.businessId===currentUser.businessId);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {["all","active","flagged"].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${statusFilter===s?"bg-violet-600 text-white border-violet-600":"bg-white text-gray-600 border-gray-200 hover:border-violet-300"}`}>
              {s==="all"?"All Customers":s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-white w-48"/>
          </div>
          {isAdmin&&<button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm whitespace-nowrap">➕ Add Customer</button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Total",v:myCustomers.length,c:"text-gray-800"},{l:"Active",v:myCustomers.filter(c=>c.status==="active").length,c:"text-emerald-600"},{l:"Flagged",v:myCustomers.filter(c=>c.status==="flagged").length,c:"text-red-600"},{l:"Outstanding",v:formatCurrency(myCustomers.reduce((s,c)=>s+(c.totalBilled||0)-(c.totalPaid||0),0)),c:"text-amber-600"}].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3"><p className={`text-xl font-black ${s.c}`}>{s.v}</p><p className="text-xs text-gray-500">{s.l}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length===0&&<div className="col-span-3 text-center py-16 text-gray-400"><div className="text-5xl mb-3">👥</div><p>No customers found</p></div>}
        {filtered.map(c=>{
          const outstanding=(c.totalBilled||0)-(c.totalPaid||0);
          const assignedUser=users.find(u=>u.id===c.assignedTo);
          const cInvs=getCInvoices(c.id);
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white ${getAvatarColor(c.name)}`}>{c.name.charAt(0)}</div>
                    <div><h3 className="font-bold text-gray-800">{c.name}</h3>{c.businessName&&<p className="text-xs text-gray-500">{c.businessName}</p>}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getStatusColor(c.status)}`}>{c.status}</span>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2"><span>📱</span><span>{c.phone}</span></div>
                  {c.email&&<div className="flex items-center gap-2"><span>📧</span><span className="truncate text-xs">{c.email}</span></div>}
                  {c.address&&<div className="flex items-center gap-2"><span>📍</span><span className="text-xs">{c.address}</span></div>}
                  {assignedUser&&<div className="flex items-center gap-2"><span>👤</span><span className="text-xs">Assigned: {assignedUser.name}</span></div>}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center"><p className="text-xs text-gray-500">Total Billed</p><p className="font-bold text-gray-800">{formatCurrency(c.totalBilled||0)}</p></div>
                  <div className="bg-red-50 rounded-xl p-2.5 text-center"><p className="text-xs text-gray-500">Outstanding</p><p className={`font-bold ${outstanding>0?"text-red-600":"text-emerald-600"}`}>{formatCurrency(outstanding)}</p></div>
                </div>
                <div className="flex gap-1 flex-wrap mb-3">
                  {["paid","partial","pending","overdue"].map(s=>{const cnt=cInvs.filter(i=>i.status===s).length;return cnt?<span key={s} className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(s)}`}>{cnt} {s}</span>:null;})}
                </div>
              </div>
              <div className="border-t border-gray-100 px-5 py-3 flex gap-2">
                <button onClick={()=>viewCustomer(c)} className="flex-1 text-xs font-semibold text-violet-600 hover:text-violet-700 py-1.5 hover:bg-violet-50 rounded-lg transition-colors">View</button>
                {isAdmin&&<button onClick={()=>openEdit(c)} className="flex-1 text-xs font-semibold text-gray-600 py-1.5 hover:bg-gray-50 rounded-lg transition-colors">✏️ Edit</button>}
                {isAdmin&&<button onClick={()=>toggleFlag(c.id)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${c.status==="flagged"?"text-emerald-600 hover:bg-emerald-50":"text-amber-600 hover:bg-amber-50"}`}>{c.status==="flagged"?"✅ Unflag":"🚩 Flag"}</button>}
                {isAdmin&&<button onClick={()=>deleteCustomer(c.id)} className="text-xs font-semibold text-red-500 py-1.5 px-2 hover:bg-red-50 rounded-lg">🗑️</button>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h3 className="text-xl font-bold">{editCustomer?"✏️ Edit Customer":"➕ Add Customer"}</h3><button onClick={()=>setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button></div>
            <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
              {[{key:"name",label:"Full Name *",placeholder:"Customer name"},{key:"businessName",label:"Business Name",placeholder:"Company name"},{key:"phone",label:"Phone *",placeholder:"+91 98765 43210"},{key:"email",label:"Email",placeholder:"customer@email.com",type:"email"},{key:"address",label:"Address",placeholder:"Full address"},{key:"gstin",label:"GSTIN",placeholder:"Optional"},{key:"creditLimit",label:"Credit Limit (₹)",placeholder:"0",type:"number"},{key:"notes",label:"Notes",placeholder:"Any notes..."}].map(f=>(
                <div key={f.key}><label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                  <input type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm(ff=>({...ff,[f.key]:e.target.value}))} placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400"/>
                </div>
              ))}
              {isAdmin&&(
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Assign To Staff</label>
                  <select value={form.assignedTo||""} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400">
                    <option value="">No assignment</option>
                    {staffUsers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
              <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Status</label>
                <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400">
                  <option value="active">Active</option><option value="flagged">Flagged</option><option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={saveCustomer} className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90">{editCustomer?"Save Changes":"Add Customer"}</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showView&&selectedCustomer&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white ${getAvatarColor(selectedCustomer.name)}`}>{selectedCustomer.name.charAt(0)}</div>
                <div><h3 className="text-xl font-bold text-gray-800">{selectedCustomer.name}</h3>{selectedCustomer.businessName&&<p className="text-sm text-gray-500">{selectedCustomer.businessName}</p>}</div>
              </div>
              <button onClick={()=>setShowView(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[{l:"Phone",v:selectedCustomer.phone,i:"📱"},{l:"Email",v:selectedCustomer.email||"N/A",i:"📧"},{l:"GSTIN",v:selectedCustomer.gstin||"N/A",i:"📄"},{l:"Credit Limit",v:formatCurrency(selectedCustomer.creditLimit||0),i:"💳"},{l:"Since",v:formatDate(selectedCustomer.createdAt),i:"📅"},{l:"Status",v:selectedCustomer.status,i:"🔖"}].map((f,i)=>(
                  <div key={i} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">{f.i} {f.l}</p><p className="font-semibold text-gray-800 text-sm mt-0.5 capitalize">{f.v}</p></div>
                ))}
              </div>
              {selectedCustomer.address&&<div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">📍 Address</p><p className="font-medium text-gray-800 text-sm mt-0.5">{selectedCustomer.address}</p></div>}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center"><p className="text-xs text-blue-500">Total Billed</p><p className="font-bold text-blue-700">{formatCurrency(selectedCustomer.totalBilled||0)}</p></div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center"><p className="text-xs text-emerald-500">Total Paid</p><p className="font-bold text-emerald-700">{formatCurrency(selectedCustomer.totalPaid||0)}</p></div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center"><p className="text-xs text-red-500">Outstanding</p><p className="font-bold text-red-700">{formatCurrency((selectedCustomer.totalBilled||0)-(selectedCustomer.totalPaid||0))}</p></div>
              </div>
              <div><h4 className="font-semibold text-gray-700 mb-2">Invoice History</h4>
                <div className="space-y-2">
                  {getCInvoices(selectedCustomer.id).map(inv=>(
                    <div key={inv.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                      <div><p className="text-sm font-semibold text-violet-700">{inv.id}</p><p className="text-xs text-gray-500">{formatDate(inv.createdAt)} · Due {formatDate(inv.dueDate)}</p></div>
                      <div className="text-right"><p className="font-bold text-gray-800 text-sm">{formatCurrency(inv.total)}</p><span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getStatusColor(inv.status)}`}>{inv.status}</span></div>
                    </div>
                  ))}
                  {getCInvoices(selectedCustomer.id).length===0&&<p className="text-sm text-gray-400 text-center py-4">No invoices yet</p>}
                </div>
              </div>
              {selectedCustomer.notes&&<div className="bg-amber-50 border border-amber-100 rounded-xl p-3"><p className="text-xs text-amber-600 font-semibold mb-1">NOTES</p><p className="text-sm text-amber-800">{selectedCustomer.notes}</p></div>}
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              {isAdmin&&<button onClick={()=>{setShowView(false);openEdit(selectedCustomer);}} className="flex-1 py-2.5 bg-violet-100 text-violet-700 rounded-xl font-semibold text-sm hover:bg-violet-200">✏️ Edit</button>}
              <button onClick={()=>setShowView(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
