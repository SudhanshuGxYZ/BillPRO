// ─── Format helpers ───────────────────────────────────────────────────────────
function formatCurrency(amount, symbol = "₹") {
  return `${symbol}${Number(amount||0).toLocaleString("en-IN",{minimumFractionDigits:0,maximumFractionDigits:2})}`;
}
function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function daysOverdue(due) {
  return Math.floor((new Date()-new Date(due))/(1000*60*60*24));
}
function getStatusColor(s) {
  return ({paid:"bg-emerald-100 text-emerald-700 border-emerald-200",partial:"bg-amber-100 text-amber-700 border-amber-200",pending:"bg-blue-100 text-blue-700 border-blue-200",overdue:"bg-red-100 text-red-700 border-red-200",active:"bg-emerald-100 text-emerald-700 border-emerald-200",flagged:"bg-red-100 text-red-700 border-red-200",inactive:"bg-gray-100 text-gray-600 border-gray-200"})[s]||"bg-gray-100 text-gray-600";
}
function getPriorityColor(p) { return({high:"text-red-500",medium:"text-amber-500",low:"text-blue-500"})[p]||"text-gray-500"; }
function getNotificationIcon(t) { return({overdue:"⚠️",partial:"💰",paid:"✅",info:"ℹ️",new:"🆕"})[t]||"📢"; }
function generateId(p="id") { return `${p}-${Date.now()}-${Math.random().toString(36).substr(2,5)}`; }
function generateInvoiceId(invoices, prefix="INV", bizId) {
  const bizInvoices = invoices.filter(i=>i.businessId===bizId);
  const nums = bizInvoices.map(i=>{ const p=i.id.split("-"); return parseInt(p[p.length-1])||0; });
  return `${prefix}-${(Math.max(0,...nums)+1).toString().padStart(3,"0")}`;
}
function calculateTotals(items, discount=0) {
  const subtotal = items.reduce((s,i)=>s+(i.qty*i.rate),0);
  const taxAmount = items.reduce((s,i)=>s+(i.qty*i.rate*i.tax/100),0);
  return { subtotal, taxAmount, total: subtotal+taxAmount-discount };
}
function getAvatarColor(str) {
  const c=["bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-indigo-500","bg-teal-500","bg-orange-500"];
  let h=0; for(let i=0;i<str.length;i++) h+=str.charCodeAt(i);
  return c[h%c.length];
}
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function getRevenueByMonth(invoices) {
  const data={},today=new Date();
  for(let i=5;i>=0;i--){const d=new Date(today.getFullYear(),today.getMonth()-i,1);data[`${MONTHS[d.getMonth()]} ${d.getFullYear()}`]={billed:0,collected:0};}
  invoices.forEach(inv=>{const d=new Date(inv.createdAt);const k=`${MONTHS[d.getMonth()]} ${d.getFullYear()}`;if(data[k]){data[k].billed+=inv.total;data[k].collected+=inv.paid;}});
  return data;
}

// Reminder helpers
function getWhatsAppMessage(customer, invoice, settings) {
  const balance=invoice.total-invoice.paid;
  return encodeURIComponent(`Hello ${customer.name},\n\nReminder from ${settings.name}.\n\nInvoice: ${invoice.id}\nAmount Due: ${formatCurrency(balance)}\nDue Date: ${formatDate(invoice.dueDate)}\n\nPayment via:\n• UPI: ${settings.upiId}\n• Bank: ${settings.bankName}, A/C: ${settings.accountNumber}\n\nThank you!\n${settings.name}`);
}
function getEmailDraft(customer, invoice, settings) {
  const balance=invoice.total-invoice.paid;
  return {
    to:customer.email,
    subject:`Payment Reminder - ${invoice.id} | ${settings.name}`,
    body:`Dear ${customer.name},\n\nOutstanding payment for invoice ${invoice.id}.\n\nTotal: ${formatCurrency(invoice.total)}\nPaid: ${formatCurrency(invoice.paid)}\nBalance: ${formatCurrency(balance)}\nDue: ${formatDate(invoice.dueDate)}\n\nBank: ${settings.bankName} | A/C: ${settings.accountNumber} | IFSC: ${settings.ifscCode}\nUPI: ${settings.upiId}\n\nThank you,\n${settings.name}\n${settings.phone}`
  };
}
function getSMSDraft(customer, invoice, settings) {
  return `Hi ${customer.name}, payment of ${formatCurrency(invoice.total-invoice.paid)} for ${invoice.id} due ${formatDate(invoice.dueDate)}. UPI: ${settings.upiId}. -${settings.name}`;
}

// ─── PDF INVOICE GENERATOR ────────────────────────────────────────────────────
function generateInvoicePDF(invoice, customer, business) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W=210, margin=15, cW=W-margin*2;

  // Header gradient bar
  doc.setFillColor(99,102,241);
  doc.rect(0,0,W,32,"F");

  // Business name
  doc.setTextColor(255,255,255);
  doc.setFontSize(22);
  doc.setFont("helvetica","bold");
  doc.text(business.name, margin, 14);

  // INVOICE label
  doc.setFontSize(12);
  doc.setFont("helvetica","normal");
  doc.text("TAX INVOICE", W-margin, 10, {align:"right"});
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.id}`, W-margin, 17, {align:"right"});
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, W-margin, 23, {align:"right"});
  doc.text(`Due: ${formatDate(invoice.dueDate)}`, W-margin, 29, {align:"right"});

  // Business details block
  doc.setTextColor(60,60,60);
  doc.setFontSize(8);
  doc.setFont("helvetica","normal");
  let y=38;
  doc.text(business.address, margin, y); y+=4;
  doc.text(`Phone: ${business.phone}  |  Email: ${business.email}`, margin, y); y+=4;
  if(business.gstin) { doc.text(`GSTIN: ${business.gstin}`, margin, y); y+=4; }
  if(business.upiId) { doc.text(`UPI: ${business.upiId}`, margin, y); y+=4; }

  // Divider
  y+=2; doc.setDrawColor(200,200,220); doc.setLineWidth(0.3); doc.line(margin,y,W-margin,y); y+=5;

  // Bill To
  doc.setFillColor(245,245,252);
  doc.rect(margin,y,cW/2-4,22,"F");
  doc.setFontSize(7); doc.setTextColor(120,120,140); doc.text("BILL TO", margin+3, y+4);
  doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(30,30,60);
  doc.text(customer.name, margin+3, y+9);
  doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(70,70,90);
  if(customer.businessName) { doc.text(customer.businessName, margin+3, y+14); }
  doc.text(customer.phone, margin+3, y+19);
  if(customer.email) { doc.text(customer.email, margin+3, y+24); }

  // Status badge
  const statusColors={paid:[16,185,129],partial:[245,158,11],pending:[59,130,246],overdue:[239,68,68]};
  const sc=statusColors[invoice.status]||[156,163,175];
  doc.setFillColor(...sc);
  doc.roundedRect(W-margin-35, y, 35, 10, 2, 2, "F");
  doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont("helvetica","bold");
  doc.text(invoice.status.toUpperCase(), W-margin-35+17.5, y+6.5, {align:"center"});

  y+=28;

  // Items table header
  doc.setFillColor(99,102,241);
  doc.rect(margin,y,cW,8,"F");
  doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont("helvetica","bold");
  const cols=[margin+2, margin+60, margin+80, margin+100, margin+120, margin+145];
  ["#","DESCRIPTION","QTY","RATE","TAX","AMOUNT"].forEach((h,i)=>doc.text(h,cols[i],y+5.5));
  y+=8;

  // Items rows
  invoice.items.forEach((item,idx)=>{
    const bg = idx%2===0?[249,248,255]:[255,255,255];
    doc.setFillColor(...bg); doc.rect(margin,y,cW,7,"F");
    doc.setTextColor(40,40,60); doc.setFont("helvetica","normal"); doc.setFontSize(8);
    const amt=item.qty*item.rate*(1+item.tax/100);
    doc.text(String(idx+1), cols[0], y+5);
    doc.text(String(item.name).slice(0,30), cols[1], y+5);
    doc.text(String(item.qty), cols[2], y+5);
    doc.text(`₹${item.rate.toLocaleString("en-IN")}`, cols[3], y+5);
    doc.text(`${item.tax}%`, cols[4], y+5);
    doc.text(`₹${amt.toLocaleString("en-IN",{maximumFractionDigits:0})}`, cols[5], y+5);
    y+=7;
  });

  // Totals block
  y+=4;
  doc.setDrawColor(200,200,220); doc.line(margin,y,W-margin,y); y+=4;

  const totals=[
    ["Subtotal", `₹${invoice.subtotal.toLocaleString("en-IN")}`],
    [`${business.taxLabel||"Tax"}`, `₹${invoice.taxAmount.toLocaleString("en-IN")}`],
  ];
  if(invoice.discount>0) totals.push(["Discount", `-₹${invoice.discount.toLocaleString("en-IN")}`]);
  totals.forEach(([k,v])=>{
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(80,80,100);
    doc.text(k, W-margin-55, y); doc.text(v, W-margin, y, {align:"right"});
    y+=5;
  });
  // Total
  doc.setFillColor(99,102,241); doc.rect(W-margin-65, y-1, 65, 8, "F");
  doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(10);
  doc.text("TOTAL", W-margin-63, y+5); doc.text(`₹${invoice.total.toLocaleString("en-IN")}`, W-margin-2, y+5, {align:"right"});
  y+=10;

  // Paid / Balance
  if(invoice.paid>0){
    doc.setTextColor(16,185,129); doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text(`Amount Paid: ₹${invoice.paid.toLocaleString("en-IN")}`, W-margin, y, {align:"right"}); y+=5;
  }
  const balance=invoice.total-invoice.paid;
  if(balance>0){
    doc.setTextColor(239,68,68); doc.setFontSize(10); doc.setFont("helvetica","bold");
    doc.text(`Balance Due: ₹${balance.toLocaleString("en-IN")}`, W-margin, y, {align:"right"}); y+=7;
  }

  // Payment history
  if(invoice.paymentHistory&&invoice.paymentHistory.length>0){
    y+=2; doc.setTextColor(60,60,80); doc.setFontSize(8); doc.setFont("helvetica","bold");
    doc.text("PAYMENT HISTORY", margin, y); y+=4;
    invoice.paymentHistory.forEach(p=>{
      doc.setFont("helvetica","normal"); doc.setTextColor(80,80,100);
      doc.text(`• ${formatDate(p.date)} — ${p.method}: ₹${p.amount.toLocaleString("en-IN")}${p.note?" ("+p.note+")":""}`, margin+2, y);
      y+=4;
    });
  }

  // Payment details box
  y+=4;
  doc.setFillColor(245,245,252); doc.rect(margin, y, cW, 22, "F");
  doc.setTextColor(100,100,130); doc.setFontSize(7); doc.setFont("helvetica","bold");
  doc.text("PAYMENT DETAILS", margin+3, y+5);
  doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(50,50,80);
  doc.text(`Bank: ${business.bankName}  |  A/C: ${business.accountNumber}  |  IFSC: ${business.ifscCode}`, margin+3, y+10);
  doc.text(`UPI: ${business.upiId}`, margin+3, y+16);
  if(invoice.notes){ doc.text(`Note: ${invoice.notes}`, margin+3, y+22); y+=6; }
  y+=26;

  // Footer
  doc.setDrawColor(200,200,220); doc.line(margin,y,W-margin,y); y+=4;
  doc.setTextColor(130,130,160); doc.setFontSize(8); doc.setFont("helvetica","normal");
  doc.text(business.invoiceFooter||"Thank you for your business!", W/2, y+4, {align:"center"}); y+=8;
  doc.setFontSize(7); doc.text(`Generated by BillPro · ${new Date().toLocaleString("en-IN")}`, W/2, y, {align:"center"});

  doc.save(`${invoice.id}.pdf`);
}

// ─── STATEMENT PDF GENERATOR ──────────────────────────────────────────────────
function generateStatementPDF(business, invoices, customers, fromDate, toDate) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W=210, margin=15, cW=W-margin*2;

  const filtered = invoices.filter(inv=>{
    const d=new Date(inv.createdAt);
    return d>=new Date(fromDate) && d<=new Date(toDate);
  });

  const totalBilled=filtered.reduce((s,i)=>s+i.total,0);
  const totalCollected=filtered.reduce((s,i)=>s+i.paid,0);
  const totalOutstanding=totalBilled-totalCollected;

  // Header
  doc.setFillColor(99,102,241); doc.rect(0,0,W,32,"F");
  doc.setTextColor(255,255,255);
  doc.setFont("helvetica","bold"); doc.setFontSize(20); doc.text(business.name, margin, 13);
  doc.setFontSize(11); doc.setFont("helvetica","normal"); doc.text("ACCOUNT STATEMENT", margin, 21);
  doc.setFontSize(9); doc.text(`Period: ${formatDate(fromDate)} — ${formatDate(toDate)}`, margin, 28);
  doc.setFontSize(9); doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, W-margin, 28, {align:"right"});

  let y=40;
  doc.setTextColor(60,60,80); doc.setFontSize(8);
  doc.text(`${business.address}  |  ${business.phone}  |  ${business.email}`, margin, y);
  y+=8;

  // Summary cards
  const cards=[
    {l:"Total Billed", v:`₹${totalBilled.toLocaleString("en-IN")}`, c:[99,102,241]},
    {l:"Collected", v:`₹${totalCollected.toLocaleString("en-IN")}`, c:[16,185,129]},
    {l:"Outstanding", v:`₹${totalOutstanding.toLocaleString("en-IN")}`, c:[239,68,68]},
    {l:"Invoices", v:String(filtered.length), c:[245,158,11]}
  ];
  cards.forEach((card,i)=>{
    const x=margin+i*(cW/4+1);
    doc.setFillColor(...card.c); doc.rect(x,y,cW/4-1,14,"F");
    doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text(card.l, x+2, y+5);
    doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.text(card.v, x+2, y+12);
  });
  y+=20;

  // Table header
  doc.setFillColor(50,50,80); doc.rect(margin,y,cW,7,"F");
  doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont("helvetica","bold");
  const cols=[margin+1, margin+18, margin+60, margin+95, margin+115, margin+133, margin+151];
  ["#","Invoice","Customer","Date","Total","Paid","Balance","Status"].forEach((h,i,arr)=>{
    if(i<arr.length-1) doc.text(h,cols[i],y+5);
    else doc.text(h,W-margin-20,y+5);
  });
  y+=7;

  filtered.forEach((inv,idx)=>{
    if(y>265){ doc.addPage(); y=20; }
    const bg=idx%2===0?[248,248,255]:[255,255,255];
    doc.setFillColor(...bg); doc.rect(margin,y,cW,6,"F");
    doc.setTextColor(50,50,80); doc.setFont("helvetica","normal"); doc.setFontSize(7);
    const bal=inv.total-inv.paid;
    const cust=customers.find(c=>c.id===inv.customerId);
    doc.text(String(idx+1), cols[0], y+4.5);
    doc.text(inv.id, cols[1], y+4.5);
    doc.text((cust?.name||inv.customerName).slice(0,22), cols[2], y+4.5);
    doc.text(formatDate(inv.createdAt), cols[3], y+4.5);
    doc.text(`₹${inv.total.toLocaleString("en-IN")}`, cols[4], y+4.5);
    doc.text(`₹${inv.paid.toLocaleString("en-IN")}`, cols[5], y+4.5);
    doc.text(`₹${bal.toLocaleString("en-IN")}`, cols[6], y+4.5);
    const sc={paid:[16,185,129],partial:[245,158,11],pending:[59,130,246],overdue:[239,68,68]}[inv.status]||[150,150,150];
    doc.setTextColor(...sc); doc.setFont("helvetica","bold");
    doc.text(inv.status.toUpperCase(), W-margin-1, y+4.5, {align:"right"});
    doc.setTextColor(50,50,80); doc.setFont("helvetica","normal");
    y+=6;
  });

  if(filtered.length===0){
    doc.setTextColor(150,150,170); doc.setFontSize(10); doc.setFont("helvetica","normal");
    doc.text("No invoices found for this period.", W/2, y+10, {align:"center"});
  }

  // Totals summary
  y+=8;
  doc.setDrawColor(180,180,200); doc.line(margin,y,W-margin,y); y+=5;
  [["Total Billed",totalBilled],["Total Collected",totalCollected]].forEach(([l,v])=>{
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(80,80,100);
    doc.text(l, W-margin-50, y); doc.text(`₹${v.toLocaleString("en-IN")}`, W-margin, y, {align:"right"}); y+=5;
  });
  doc.setFillColor(99,102,241); doc.rect(W-margin-60,y-1,60,8,"F");
  doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(10);
  doc.text("Balance Due", W-margin-58, y+5);
  doc.text(`₹${totalOutstanding.toLocaleString("en-IN")}`, W-margin-2, y+5, {align:"right"});
  y+=14;
  doc.setTextColor(130,130,160); doc.setFontSize(7);
  doc.text("This is a computer-generated statement. No signature required.", W/2, y, {align:"center"});

  doc.save(`Statement_${business.name}_${fromDate}_${toDate}.pdf`);
}
