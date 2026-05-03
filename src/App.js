function App() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const [users, setUsers] = React.useState(initialData.users);
  const [businesses, setBusinesses] = React.useState(initialData.businesses);
  const [customers, setCustomers] = React.useState(initialData.customers);
  const [invoices, setInvoices] = React.useState(initialData.invoices);
  const [products, setProducts] = React.useState(initialData.products);
  const [notifications, setNotifications] = React.useState(initialData.notifications);

  // Mark overdue invoices on load
  React.useEffect(()=>{
    setInvoices(prev=>prev.map(inv=>{
      if(inv.status==="paid") return inv;
      if(new Date(inv.dueDate)<new Date()&&inv.status!=="overdue") return {...inv,status:"overdue"};
      return inv;
    }));
  },[]);

  // Auto-sync customer totals
  React.useEffect(()=>{
    setCustomers(prev=>prev.map(c=>{
      const ci=invoices.filter(i=>i.customerId===c.id);
      return {...c,totalBilled:ci.reduce((s,i)=>s+i.total,0),totalPaid:ci.reduce((s,i)=>s+i.paid,0)};
    }));
  },[invoices]);

  function handleLogin(email, password) {
    const user=users.find(u=>u.email===email&&u.password===password&&u.status==="active");
    if(user){ setCurrentUser(user); setCurrentPage(user.role==="superadmin"?"sa-dashboard":"dashboard"); return true; }
    return false;
  }
  function handleLogout(){ setCurrentUser(null); setCurrentPage("dashboard"); }

  if(!currentUser) return <LoginPage onLogin={handleLogin}/>;

  // Business-scoped data
  const business = businesses.find(b=>b.id===currentUser.businessId) || null;
  const bizInvoices = currentUser.role==="superadmin" ? invoices : invoices.filter(i=>i.businessId===currentUser.businessId);
  const bizCustomers = currentUser.role==="superadmin" ? customers : customers.filter(c=>c.businessId===currentUser.businessId);
  const bizProducts = currentUser.role==="superadmin" ? products : products.filter(p=>p.businessId===currentUser.businessId);
  const bizNotifications = currentUser.role==="superadmin" ? notifications : notifications.filter(n=>n.businessId===currentUser.businessId);
  const bizUsers = currentUser.role==="superadmin" ? users : users.filter(u=>u.businessId===currentUser.businessId);

  const unreadCount = bizNotifications.filter(n=>!n.read).length;

  function setBusinessSettings(updatedBiz){
    setBusinesses(prev=>prev.map(b=>b.id===updatedBiz.id?updatedBiz:b));
  }

  const pageTitle = {
    "sa-dashboard":"Super Admin Overview","sa-businesses":"Business Management","sa-admins":"Admins & Users",
    dashboard:"Dashboard",invoices:"Invoices",customers:"Customers",users:"Staff Users",
    products:"Products & Services",reports:"Reports & Analytics",notifications:"Notifications",settings:"Settings"
  }[currentPage]||"Dashboard";

  function renderPage(){
    // Super Admin pages
    if(currentUser.role==="superadmin"){
      if(currentPage==="sa-dashboard") return <SuperAdminDashboard businesses={businesses} users={users} invoices={invoices} customers={customers}/>;
      if(currentPage==="sa-businesses") return <SuperAdminBusinesses businesses={businesses} setBusinesses={setBusinesses}/>;
      if(currentPage==="sa-admins") return <SuperAdminAdmins users={users} setUsers={setUsers} businesses={businesses}/>;
      return <SuperAdminDashboard businesses={businesses} users={users} invoices={invoices} customers={customers}/>;
    }
    // Admin / User pages
    switch(currentPage){
      case "dashboard": return <Dashboard invoices={bizInvoices} customers={bizCustomers} users={bizUsers} currentUser={currentUser} business={business} setPage={setCurrentPage} notifications={bizNotifications}/>;
      case "invoices": return <InvoicesPage invoices={bizInvoices} setInvoices={setInvoices} customers={bizCustomers} products={bizProducts} currentUser={currentUser} business={business}/>;
      case "customers": return <CustomersPage customers={bizCustomers} setCustomers={setCustomers} invoices={bizInvoices} users={bizUsers} currentUser={currentUser}/>;
      case "users":
        return currentUser.role==="admin"
          ? <UsersPage users={bizUsers} setUsers={setUsers} currentUser={currentUser}/>
          : <div className="flex-1 flex items-center justify-center text-gray-400"><div className="text-center"><div className="text-5xl mb-3">🔒</div><p>Access denied.</p></div></div>;
      case "products": return <ProductsPage products={bizProducts} setProducts={setProducts} currentUser={currentUser}/>;
      case "reports": return <ReportsPage invoices={bizInvoices} customers={bizCustomers} currentUser={currentUser}/>;
      case "notifications": return <NotificationsPage notifications={bizNotifications} setNotifications={setNotifications} invoices={bizInvoices} customers={bizCustomers} business={business} setPage={setCurrentPage}/>;
      case "settings":
        return business
          ? <SettingsPage business={business} setBusiness={setBusinessSettings} currentUser={currentUser}/>
          : <div className="flex-1 flex items-center justify-center text-gray-400"><p>No business found.</p></div>;
      default: return null;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Sidebar currentPage={currentPage} setPage={setCurrentPage} user={currentUser} business={business} onLogout={handleLogout} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} unreadCount={unreadCount}/>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar title={pageTitle} user={currentUser} setPage={setCurrentPage} unreadCount={unreadCount}/>
        {renderPage()}
      </div>
    </div>
  );
}
