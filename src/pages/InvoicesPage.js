function InvoicesPage({ invoices, setInvoices, customers, products, currentUser, business }) {
  const isAdmin = currentUser.role==="admin";
  const myInvoices = isAdmin ? invoices : invoices.filter(i=>i.createdBy===currentUser.id);
  const [search,setSearch]=React.useState("");
  const [statusFilter,setStatusFilter]=React.useState("all");
  const [showModal,setShowModal]=React.useState(false);
  const [showView,setShowView]=React.useState(false);
  const [showPayment,setShowPayment]=React.useState(false);
  const [showReminder,setShowReminder]=React.useState(false);
  const [sel,setSel]=React.useState(null);
  const [payAmount,setPayAmount]=React.useState("");
  const [payMethod,setPayMethod]=React.useState("UPI");
  const [payNote,setPayNote]=React.useState("");
  const [reminderType,setReminderType]=React.useState("whatsapp");
  const [form,setForm]=React.useState({customerId:"",items:[{id:generateId(),name:"",qty:1,rate:0,tax:business?.defaultTax||18}],discount:0,dueDate:"",notes:""});

  const filtered=myInvoices.filter(inv=>{
    const ms=inv.id.toLowerCase().includes(search.toLowerCase())||inv.customerName.toLowerCase().includes(search.toLowerCase());
    return ms&&(statusFilter==="all"||inv.status===statusFilter);
  });

  function addItem(){setForm(f=>({...f,items:[...f.items,{id:generateId(),name:"",qty:1,rate:0,tax:business?.defaultTax||18}]}));}
  function removeItem(id){setForm(f=>({...f,items:f.items.filter(i=>i.id!==id)}));}
  function updateItem(id,field,value){setForm(f=>({...f,items:f.items.map(i=>i.id===id?{...i,[field]:value}:i)}));}
  function loadProduct(itemId,pid){const p=products.find(p=>p.id===pid);if(p){updateItem(itemId,"name",p.name);updateItem(itemId,"rate",p.price);updateItem(itemId,"tax",p.tax);}}

  function createInvoice(){
    if(!form.customerId||form.items.some(i=>!i.name)) return alert("Fill all required fields.");
    const cust=customers.find(c=>c.id===form.customerId);
    const {subtotal,taxAmount,total}=calculateTotals(form.items,Number(form.discount));
    const newInv={
      id:generateInvoiceId(invoices,business?.invoicePrefix||"INV",currentUser.businessId),
      businessId:currentUser.businessId,
      customerId:form.customerId,customerName:cust.name,
      items:form.items,subtotal,taxAmount,discount:Number(form.discount),total,
      paid:0,status:"pending",dueDate:form.dueDate,
      createdAt:new Date().toISOString().split("T")[0],createdBy:currentUser.id,
      notes:form.notes,paymentHistory:[]
    };
    setInvoices(prev=>[newInv,...prev]);
    setShowModal(false);
    setForm({customerId:"",items:[{id:generateId(),name:"",qty:1,rate:0,tax:business?.defaultTax||18}],discount:0,dueDate:"",notes:""});
  }

  function recordPayment(){
    const amount=parseFloat(payAmount);
    if(!amount||amount<=0) return alert("Enter valid amount.");
    const balance=sel.total-sel.paid;
    if(amount>balance) return alert("Exceeds balance.");
    setInvoices(prev=>prev.map(inv=>{
      if(inv.id!==sel.id) return inv;
      const newPaid=inv.paid+amount;
      return {...inv,paid:newPaid,status:newPaid>=inv.total?"paid":"partial",paymentHistory:[...inv.paymentHistory,{amount,method:payMethod,date:new Date().toISOString().split("T")[0],note:payNote}]};
    }));
    setShowPayment(false);setPayAmount("");setPayNote("");
  }

  function deleteInvoice(id){if(!confirm("Delete invoice?")) return; setInvoices(prev=>prev.filter(i=>i.id!==id));}

  function handleDownloadPDF(inv){
    const cust=customers.find(c=>c.id===inv.customerId);
    if(!cust||!business) return alert("Customer or business data missing.");
    generateInvoicePDF(inv,cust,business);
  }

  const totals=calculateTotals(form.items,Number(form.discount));

  function getReminderContent(){
    if(!sel) return "";
    const cust=customers.find(c=>c.id===sel.customerId);
    if(!cust||!business) return "";
    if(reminderType==="whatsapp") return decodeURIComponent(getWhatsAppMessage(cust,sel,business));
    if(reminderType==="sms") return getSMSDraft(cust,sel,business);
    const d=getEmailDraft(cust,sel,business);
    return `To: ${d.to}\nSubject: ${d.subject}\n\n${d.body}`;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all","pending","partial","paid","overdue"].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${statusFilter===s?"bg-violet-600 text-white border-violet-600":"bg-white text-gray-600 border-gray-200 hover:border-violet-300"}`}>
              {s==="all"?"All":s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-white w-44"/>
          </div>
          <button onClick={()=>setShowModal(true)} className="flex items-center gap-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm whitespace-nowrap">➕ New Invoice</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Total",v:myInvoices.length,c:"text-gray-800"},{l:"Pending/Partial",v:myInvoices.filter(i=>["pending","partial"].includes(i.status)).length,c:"text-amber-600"},{l:"Paid",v:myInvoices.filter(i=>i.status==="paid").length,c:"text-emerald-600"},{l:"Overdue",v:myInvoices.filter(i=>i.status==="overdue").length,c:"text-red-600"}].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3"><span className={`text-2xl font-black ${s.c}`}>{s.v}</span><span className="text-xs text-gray-500">{s.l}</span></div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Invoice #","Customer","Date","Due Date","Total","Paid","Balance","Status","Actions"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length===0&&<tr><td colSpan={9} className="text-center py-12 text-gray-400">No invoices found</td></tr>}
              {filtered.map(inv=>{
                const balance=inv.total-inv.paid;
                const isOverdue=inv.status!=="paid"&&new Date(inv.dueDate)<new Date();
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3"><span className="font-bold text-violet-700 cursor-pointer hover:underline" onClick={()=>{setSel(inv);setShowView(true);}}>{inv.id}</span></td>
                    <td className="px-4 py-3 font-medium text-gray-800">{inv.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><span className={isOverdue&&inv.status!=="paid"?"text-red-600 font-semibold":"text-gray-500"}>{formatDate(inv.dueDate)}{isOverdue&&inv.status!=="paid"&&" ⚠️"}</span></td>
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium whitespace-nowrap">{formatCurrency(inv.paid)}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{color:balance>0?"#dc2626":"#059669"}}>{formatCurrency(balance)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-semibold border capitalize ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button title="View" onClick={()=>{setSel(inv);setShowView(true);}} className="p-1.5 hover:bg-violet-100 rounded-lg text-violet-600 transition-colors">👁️</button>
                        <button title="Download PDF" onClick={()=>handleDownloadPDF(inv)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors">📄</button>
                        {inv.status!=="paid"&&<button title="Record Payment" onClick={()=>{setSel(inv);setShowPayment(true);}} className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors">💳</button>}
                        <button title="Send Reminder" onClick={()=>{setSel(inv);setShowReminder(true);}} className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-600 transition-colors">🔔</button>
                        {isAdmin&&<button title="Delete" onClick={()=>deleteInvoice(inv.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors">🗑️</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW INVOICE MODAL */}
      {showModal&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">➕ Create New Invoice</h3>
              <button onClick={()=>setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button>
            </div>
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold text-gray-700 mb-1.5 block">Customer *</label>
                  <select value={form.customerId} onChange={e=>setForm(f=>({...f,customerId:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400">
                    <option value="">Select Customer</option>
                    {customers.map(c=><option key={c.id} value={c.id}>{c.name}{c.businessName?` (${c.businessName})`:""}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-semibold text-gray-700 mb-1.5 block">Due Date *</label>
                  <input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400"/>
                </div>
              </div>
              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">Line Items *</label>
                  <button onClick={addItem} className="text-sm text-violet-600 font-semibold hover:text-violet-700">➕ Add Item</button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                    <div className="col-span-4">Item Name</div><div className="col-span-2">Quick Pick</div>
                    <div className="col-span-1">Qty</div><div className="col-span-2">Rate (₹)</div>
                    <div className="col-span-1">Tax%</div><div className="col-span-1">Amount</div><div className="col-span-1"></div>
                  </div>
                  {form.items.map(item=>(
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-xl">
                      <div className="col-span-4"><input value={item.name} onChange={e=>updateItem(item.id,"name",e.target.value)} placeholder="Description" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-violet-400 bg-white"/></div>
                      <div className="col-span-2"><select onChange={e=>loadProduct(item.id,e.target.value)} defaultValue="" className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-violet-400 bg-white"><option value="">Load…</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                      <div className="col-span-1"><input type="number" value={item.qty} onChange={e=>updateItem(item.id,"qty",parseFloat(e.target.value)||0)} min="0" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-violet-400 bg-white"/></div>
                      <div className="col-span-2"><input type="number" value={item.rate} onChange={e=>updateItem(item.id,"rate",parseFloat(e.target.value)||0)} min="0" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-violet-400 bg-white"/></div>
                      <div className="col-span-1"><input type="number" value={item.tax} onChange={e=>updateItem(item.id,"tax",parseFloat(e.target.value)||0)} min="0" max="100" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-violet-400 bg-white"/></div>
                      <div className="col-span-1 text-sm font-semibold text-gray-700">{formatCurrency(item.qty*item.rate)}</div>
                      <div className="col-span-1 flex justify-center">{form.items.length>1&&<button onClick={()=>removeItem(item.id)} className="text-red-400 hover:text-red-600">✕</button>}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Totals */}
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex-1"><label className="text-sm font-semibold text-gray-700 mb-1.5 block">Notes</label>
                  <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={3} placeholder="Notes…" className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-violet-400 resize-none"/>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 min-w-52 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span className="font-medium">{formatCurrency(totals.subtotal)}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Tax</span><span className="font-medium">{formatCurrency(totals.taxAmount)}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Discount</span>
                    <input type="number" value={form.discount} onChange={e=>setForm(f=>({...f,discount:e.target.value}))} className="w-24 border border-gray-200 rounded-lg p-1 text-sm text-right focus:outline-none bg-white" placeholder="0"/>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-200 pt-2 mt-2"><span>Total</span><span className="text-violet-700">{formatCurrency(totals.total)}</span></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={()=>setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={createInvoice} className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90">Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showView&&sel&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div><h3 className="text-xl font-bold text-gray-800">{sel.id}</h3><span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getStatusColor(sel.status)}`}>{sel.status}</span></div>
              <button onClick={()=>setShowView(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                {[["Customer",sel.customerName],["Invoice Date",formatDate(sel.createdAt)],["Due Date",formatDate(sel.dueDate)],["Balance Due",formatCurrency(sel.total-sel.paid)]].map(([l,v],i)=>(
                  <div key={i}><p className="text-xs text-gray-500">{l}</p><p className={`font-semibold ${l==="Balance Due"?"text-red-600 text-lg":""}`}>{v}</p></div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Line Items</h4>
                <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{["Item","Qty","Rate","Tax","Amount"].map(h=><th key={h} className="text-left px-3 py-2 text-xs text-gray-500 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>{sel.items.map((item,i)=><tr key={i} className="border-t border-gray-100"><td className="px-3 py-2">{item.name}</td><td className="px-3 py-2">{item.qty}</td><td className="px-3 py-2">{formatCurrency(item.rate)}</td><td className="px-3 py-2">{item.tax}%</td><td className="px-3 py-2 font-medium">{formatCurrency(item.qty*item.rate*(1+item.tax/100))}</td></tr>)}</tbody>
                </table>
                <div className="mt-2 bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(sel.subtotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatCurrency(sel.taxAmount)}</span></div>
                  {sel.discount>0&&<div className="flex justify-between text-gray-600"><span>Discount</span><span>-{formatCurrency(sel.discount)}</span></div>}
                  <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-1"><span>Total</span><span>{formatCurrency(sel.total)}</span></div>
                  <div className="flex justify-between text-emerald-600"><span>Paid</span><span>{formatCurrency(sel.paid)}</span></div>
                  <div className="flex justify-between font-bold text-red-600"><span>Balance</span><span>{formatCurrency(sel.total-sel.paid)}</span></div>
                </div>
              </div>
              {sel.paymentHistory.length>0&&(
                <div><h4 className="font-semibold text-gray-700 mb-2">Payment History</h4>
                  <div className="space-y-2">{sel.paymentHistory.map((p,i)=>(
                    <div key={i} className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                      <div><span className="text-sm font-medium text-emerald-700">{p.method}</span>{p.note&&<span className="text-xs text-gray-500 ml-2">— {p.note}</span>}</div>
                      <div className="text-right"><div className="font-bold text-emerald-700">{formatCurrency(p.amount)}</div><div className="text-xs text-gray-500">{formatDate(p.date)}</div></div>
                    </div>
                  ))}</div>
                </div>
              )}
              {sel.notes&&<div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-500 font-semibold mb-1">NOTES</p><p className="text-sm text-blue-800">{sel.notes}</p></div>}
            </div>
            <div className="flex gap-2 p-4 border-t border-gray-100 flex-wrap">
              <button onClick={()=>handleDownloadPDF(sel)} className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold text-sm hover:opacity-90">📄 Download PDF</button>
              {sel.status!=="paid"&&<button onClick={()=>{setShowView(false);setShowPayment(true);}} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600">💳 Record Payment</button>}
              <button onClick={()=>{setShowView(false);setShowReminder(true);}} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600">🔔 Reminder</button>
              <button onClick={()=>setShowView(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPayment&&sel&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h3 className="text-xl font-bold">💳 Record Payment</h3><button onClick={()=>setShowPayment(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button></div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Invoice</span><span className="font-semibold">{sel.id}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total</span><span className="font-semibold">{formatCurrency(sel.total)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Paid</span><span className="font-semibold text-emerald-600">{formatCurrency(sel.paid)}</span></div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-1"><span>Balance Due</span><span className="text-red-600">{formatCurrency(sel.total-sel.paid)}</span></div>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1.5 block">Payment Amount *</label>
                <input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} placeholder={`Max: ${formatCurrency(sel.total-sel.paid)}`} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-violet-400"/>
                <button onClick={()=>setPayAmount(String(sel.total-sel.paid))} className="text-xs text-violet-600 font-semibold mt-1 hover:underline">Pay full balance</button>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1.5 block">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">{["Cash","UPI","Cheque","Card","Bank Transfer","Other"].map(m=>(
                  <button key={m} onClick={()=>setPayMethod(m)} className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${payMethod===m?"bg-violet-600 text-white border-violet-600":"bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300"}`}>{m}</button>
                ))}</div>
              </div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1.5 block">Note</label>
                <input value={payNote} onChange={e=>setPayNote(e.target.value)} placeholder="Optional note…" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-violet-400"/>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={()=>setShowPayment(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={recordPayment} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600">✅ Record</button>
            </div>
          </div>
        </div>
      )}

      {/* REMINDER MODAL */}
      {showReminder&&sel&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100"><h3 className="text-xl font-bold">🔔 Send Reminder</h3><button onClick={()=>setShowReminder(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[{id:"whatsapp",icon:"📱",label:"WhatsApp"},{id:"email",icon:"📧",label:"Email"},{id:"sms",icon:"💬",label:"SMS"}].map(r=>(
                  <button key={r.id} onClick={()=>setReminderType(r.id)} className={`py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-1.5 transition-all ${reminderType===r.id?"bg-violet-600 text-white border-violet-600":"bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300"}`}>{r.icon} {r.label}</button>
                ))}
              </div>
              <textarea readOnly value={getReminderContent()} rows={10} className="w-full border border-gray-200 rounded-xl p-3 text-xs font-mono bg-gray-50 focus:outline-none resize-none"/>
              <div className="flex gap-2">
                {reminderType==="whatsapp"&&(()=>{ const cust=customers.find(c=>c.id===sel.customerId); return cust&&business?(
                  <a href={`https://wa.me/${cust.phone.replace(/\D/g,"")}?text=${getWhatsAppMessage(cust,sel,business)}`} target="_blank" rel="noreferrer" className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm text-center hover:bg-green-600">📱 Open WhatsApp</a>
                ):null; })()}
                <button onClick={()=>{navigator.clipboard.writeText(getReminderContent());alert("Copied!");}} className="flex-1 py-2.5 bg-violet-100 text-violet-700 rounded-xl font-semibold text-sm hover:bg-violet-200">📋 Copy</button>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 text-right"><button onClick={()=>setShowReminder(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 text-sm">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
