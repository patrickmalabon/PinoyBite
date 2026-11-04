import { firebaseReady, getFirebaseServices } from "./firebase.js";

const M={"Oriental Mindoro":["Calapan City","Baco","Bansud","Bongabong","Bulalacao","Gloria","Mansalay","Naujan","Pinamalayan","Pola","Puerto Galera","Roxas","Socorro","Victoria"],"Occidental Mindoro":["Abra de Ilog","Calintaan","Looc","Lubang","Magsaysay","Mamburao","Paluan","Rizal","Sablayan","San Jose","Santa Cruz"]};
const R=[["Mark Santos","0917 123 4567","Calapan City",4.9,"🛵"],["Juan Dela Cruz","0928 456 7890","Naujan",4.8,"🏍️"],["Carlo Reyes","0939 789 0123","Pinamalayan",4.9,"🛵"],["Miguel Garcia","0945 321 6789","San Jose",4.7,"🏍️"]];
const F=[
 ["McDo","Big Burger Meal",159,"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=82","Best Seller"],
 ["McDo","Chicken & Fries",149,"https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=82","Popular"],
 ["McDo","McDo Fries",69,"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=82",""],
 ["McDo","McFloat",59,"https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=82",""],
 ["Jollibee","Chickenjoy Meal",149,"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=82","Best Seller"],
 ["Jollibee","Yumburger",69,"https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=82","Popular"],
 ["Jollibee","Jolly Spaghetti",79,"https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=900&q=82",""],
 ["Jollibee","Peach Mango Pie",45,"https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=82",""],
 ["Inasal","Chicken Inasal Meal",159,"https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=82","Best Seller"],
 ["Inasal","Pecho Meal",179,"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=82","Popular"],
 ["Inasal","Liempo Meal",169,"https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=82",""],
 ["Inasal","Halo-Halo",89,"https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=82",""]
];
const ADMIN_EMAIL='patrickmalabon262@gmail.com';
let cart=JSON.parse(localStorage.pb_cart||"[]"),users=JSON.parse(localStorage.pb_users||"[]"),orders=JSON.parse(localStorage.pb_orders||"[]"),user=JSON.parse(localStorage.pb_user||"null"),rider=0,rating=0;
function normalizeRole(u){if(!u)return null; const email=String(u.email||'').trim().toLowerCase(); return {...u,role:email===ADMIN_EMAIL?'admin':'user'};}
user=normalizeRole(user);
if(user) localStorage.pb_user=JSON.stringify(user);
const $=x=>document.getElementById(x),money=x=>Number(x).toFixed(2),total=()=>cart.reduce((s,x)=>s+x.price*x.qty,0);
function save(){localStorage.pb_cart=JSON.stringify(cart);localStorage.pb_users=JSON.stringify(users);localStorage.pb_orders=JSON.stringify(orders)}
function seedDemoAccounts(){if(!users.some(x=>x.email==='admin@pinoybite.test'))users.push({name:'Demo Account',email:'admin@pinoybite.test',password:'admin123',role:'user'});if(!users.some(x=>x.email==='staff@pinoybite.test'))users.push({name:'Staff Account',email:'staff@pinoybite.test',password:'staff123',role:'user'});users=users.map(normalizeRole);save()}
seedDemoAccounts()
function openModal(id){$(id).style.display="flex"} function closeM(id){$(id).style.display="none"} function switchM(a,b){closeM(a);openModal(b)}
window.onclick=e=>document.querySelectorAll('.modal').forEach(m=>{if(e.target===m)m.style.display='none'});
function render(filter='All'){$('grid').innerHTML=F.map((f,i)=>({f,i})).filter(x=>filter==='All'||x.f[0]===filter).map(x=>`<article class="card"><div class="pic"><img src="${x.f[3]}" alt="${x.f[1]}" loading="lazy">${x.f[4]?`<i>${x.f[4]}</i>`:''}</div><div class="fi"><small>${x.f[0]}</small><h3>${x.f[1]}</h3><div class="fb"><b>₱${money(x.f[2])}</b><button onclick="add(${x.i})">Add +</button></div></div></article>`).join('')}
function filter(x,b){document.querySelectorAll('.filters button').forEach(q=>q.classList.remove('active'));b.classList.add('active');render(x)}
function brand(x){let b=[...document.querySelectorAll('.filters button')].find(q=>q.textContent===x);filter(x,b);location.hash='menu'}
function add(i){let f=F[i],x=cart.find(q=>q.i===i);x?x.qty++:cart.push({i,brand:f[0],name:f[1],price:f[2],image:f[3],qty:1});save();cartRender();toast('Added to cart')}
function cartRender(){$('cartCount').textContent=cart.reduce((s,x)=>s+x.qty,0);$('cartTotal').textContent=money(total());$('cartItems').innerHTML=cart.length?cart.map((x,i)=>`<div class="line"><img src="${x.image}"><div><b>${x.name}</b><small>₱${money(x.price)}</small></div><div class="qty"><button onclick="q(${i},-1)">−</button>${x.qty}<button onclick="q(${i},1)">+</button></div></div>`).join(''):`<div class="empty">Your cart is empty.</div>`}
function q(i,n){cart[i].qty+=n;if(cart[i].qty<1)cart.splice(i,1);save();cartRender()}
function openCart(){
  if(user?.role==='admin'){openAdmin();return;}
  cartRender();openModal('cart');
}
function municipal(a,b){$(b).innerHTML='<option value="">Municipality / City *</option>';($(a).value?M[$(a).value]:[]).forEach(x=>$(b).innerHTML+=`<option>${x}</option>`)}
function register(){let u={name:$('rn').value.trim(),phone:$('rp').value.trim(),email:$('re').value.trim().toLowerCase(),password:$('rpass').value,province:$('rv').value,municipality:$('rm').value,barangay:$('rb').value.trim(),street:$('rs').value.trim(),landmark:$('rl').value.trim(),role:'user'};if(!u.name||!u.phone||!u.email||!u.password||!u.province||!u.municipality||!u.barangay||!u.street)return $('regm').textContent='Please complete all required details.';if(u.password.length<6)return $('regm').textContent='Password must be at least 6 characters.';if(users.some(x=>x.email===u.email))return $('regm').textContent='Email already registered.';users.push(u);save();user=u;localStorage.pb_user=JSON.stringify(user);closeM('register');ui();toast('Account created successfully!')}
function login(){
  const e=$('le').value.trim().toLowerCase(),p=$('lp').value;
  let u=users.find(x=>String(x.email||'').toLowerCase()===e&&x.password===p);

  if(!u)return $('lm').textContent='Invalid email or password.';

  // Exactly one email is allowed to have the admin role. Every other email is a user.
  user=normalizeRole(u);
  localStorage.pb_user=JSON.stringify(user);
  closeM('login');
  ui();

  if(user.role==='admin') openAdmin();
  else toast('Welcome '+user.name+'!');
}
async function googleLogin(){
  const button=document.querySelector('.googleBtn');
  if(!firebaseReady()){
    $('lm').textContent='Google Login is ready, but Firebase config is not connected yet. Paste your Firebase Web App config in src/firebase.js.';
    return;
  }
  try{
    if(button){button.disabled=true;button.textContent='Signing in with Google...';}
    const {auth,googleProvider,signInWithPopup,db,doc,setDoc}=await getFirebaseServices();
    const result=await Promise.race([
      signInWithPopup(auth,googleProvider),
      new Promise((_, reject)=>setTimeout(()=>{
        const e=new Error('Google sign-in timed out. If the Google popup is blocked, allow popups for localhost and try again.');
        e.code='auth/popup-timeout';
        reject(e);
      },20000))
    ]);
    const g=result.user;
    const profile={name:g.displayName||'Google User',email:(g.email||'').trim().toLowerCase(),phone:g.phoneNumber||'',photoURL:g.photoURL||'',provider:'google'};
    const existing=users.find(x=>String(x.email||'').toLowerCase()===profile.email);

    // Fixed rule: only patrickmalabon262@gmail.com is Admin. Every other Google account is User.
    user=normalizeRole(existing?{...existing,...profile}:{...profile});

    if(!existing) users.push(user);
    else{
      const index=users.findIndex(x=>String(x.email||'').toLowerCase()===profile.email);
      users[index]=user;
    }
    save();
    localStorage.pb_user=JSON.stringify(user);
    // Route immediately after Google authentication. Do not wait for Firestore,
    // because the admin UI must open even when Firestore/network is slow.
    closeM('login');
    ui();
    if(user?.role==='admin'){
      closeM('settings');
      closeM('cart');
      closeM('checkout');
      closeM('account');
      closeM('reviews');
      closeM('tracker');
      openAdmin();
    }else{
      toast('Welcome '+(user.name||'Google User')+'!');
    }

    // Save the Google profile in the background. This must never block routing.
    try{
      await setDoc(doc(db,'users',g.uid),{...profile,updatedAt:new Date().toISOString()},{merge:true});
    }catch(e){console.warn('Firestore profile save skipped:',e.message)}
  }catch(err){
    console.error('Google Login:',err);
    const code=err?.code||'';
    $('lm').textContent=code==='auth/popup-closed-by-user'?'Google sign-in was cancelled.':(err?.message||'Google sign-in failed. Check Firebase Authentication > Google.');
  }finally{
    if(button){button.disabled=false;button.innerHTML='<span class="googleG">G</span> Continue with Google';}
  }
}
function togglePass(id,b){let x=$(id);x.type=x.type==='password'?'text':'password';b.textContent=x.type==='password'?'Show':'Hide'}
function logout(){
  user=null;
  localStorage.removeItem('pb_user');
  closeM('settings');
  closeM('admin');
  document.body.classList.remove('adminMode');
  ui();
  toast('Logged out');
}
function ui(){
  const isAdmin=!!user&&user.role==='admin';
  $('loginBtn').classList.toggle('hide',!!user);
  $('profileBtn').classList.toggle('hide',!user||isAdmin);
  $('userTop').textContent=user?user.name.split(' ')[0]:'';
  document.body.classList.toggle('adminMode',isAdmin);
  ordersRender();
}
function requireUser(action){
  if(!user){
    openModal('login');
    return false;
  }
  if(user.role==='admin'){
    toast('Admin accounts cannot use customer features.');
    openAdmin();
    return false;
  }
  return true;
}
function openSettings(){
  if(!user)return openModal('login');
  if(user.role==='admin'){openAdmin();return;}
  openModal('settings');
}
function account(){closeM('settings');$('ainfo').innerHTML=`<div class="detail"><b>Name</b><span>${user.name}</span></div><div class="detail"><b>Email</b><span>${user.email}</span></div><div class="detail"><b>Phone</b><span>${user.phone||'—'}</span></div><div class="detail"><b>Location</b><span>${user.street||'—'}, ${user.barangay||''}, ${user.municipality||''}, ${user.province||''}</span></div>`;openModal('account')}
function checkout(){
  if(user?.role==='admin'){closeM('cart');openAdmin();toast('Admin accounts cannot place customer orders.');return;}
  if(!cart.length)return toast('Your cart is empty.');
  if(!user)return switchM('cart','login');closeM('cart');$('cn').value=user.name||'';$('cp').value=user.phone||'';$('cv').value=user.province||'';municipal('cv','cm');$('cm').value=user.municipality||'';$('cb').value=user.barangay||'';$('cs').value=user.street||'';$('cl').value=user.landmark||'';$('coTotal').textContent=money(total());$('summary').innerHTML=cart.map(x=>`<span>${x.name} × ${x.qty}</span>`).join('');renderRiders();openModal('checkout')}
function renderRiders(){$('riders').innerHTML=R.map((r,i)=>`<label class="rider ${rider===i?'sel':''}" onclick="rider=${i};renderRiders()"><input type="radio" name="r" ${rider===i?'checked':''}><span>${r[4]}</span><div><b>${r[0]}</b><small>⭐ ${r[3]} • ${r[2]}</small></div></label>`).join('')}
function place(){let c={name:$('cn').value.trim(),phone:$('cp').value.trim(),province:$('cv').value,municipality:$('cm').value,barangay:$('cb').value.trim(),street:$('cs').value.trim(),landmark:$('cl').value.trim()};if([c.name,c.phone,c.province,c.municipality,c.barangay,c.street].some(x=>!x))return $('cmg').textContent='Complete the required delivery details.';let rr=R[rider],o={id:'PB-'+Date.now().toString().slice(-7),date:new Date().toLocaleString(),customer:c,items:cart.map(x=>({...x})),total:total(),rider:{name:rr[0],phone:rr[1],area:rr[2],rating:rr[3],emoji:rr[4]},payment:document.querySelector('input[name=pay]:checked').value,status:'Order Received',step:0,user:user.email,review:null};orders.unshift(o);cart=[];save();cartRender();ordersRender();closeM('checkout');receipt(o)}
function receipt(o){$('receiptBody').innerHTML=`<div class="rhead"><b>PinoyBite</b><small>Official Order Receipt</small></div><div class="rmeta"><span>Order<br><b>${o.id}</b></span><span>Date<br><b>${o.date}</b></span></div><div class="address"><b>Deliver to</b><br>${o.customer.name} • ${o.customer.phone}<br>${o.customer.street}, ${o.customer.barangay}, ${o.customer.municipality}, ${o.customer.province}${o.customer.landmark?'<br>Landmark: '+o.customer.landmark:''}</div><p><b>Rider:</b> ${o.rider.name} ${o.rider.emoji}</p><table>${o.items.map(x=>`<tr><td>${x.name} × ${x.qty}</td><td>₱${money(x.price*x.qty)}</td></tr>`).join('')}</table><div class="total"><span>Grand Total</span><b>₱${money(o.total)}</b></div><div class="note">Payment: ${o.payment}<br>Thank you for ordering with PinoyBite.</div>`;openModal('receipt')}
function printReceipt(){let c=$('receiptBody').innerHTML,w=window.open('','PRINT','width=600,height=800');w.document.write(`<html><body style="font-family:Arial;padding:30px">${c}<style>table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px solid #ddd}td:last-child{text-align:right}</style></body></html>`);w.document.close();w.print();w.close()}
function ordersRender(){let a=user?orders.filter(o=>o.user===user.email):[];$('ordersList').innerHTML=a.length?a.slice(0,5).map(o=>`<div class="order"><div><b>${o.id}</b><h3>${o.items[0]?.name||'Order'}</h3><small>${o.date} • ${o.rider.name}</small></div><div><b>₱${money(o.total)}</b><button onclick="openTracker('${o.id}')">Track</button></div></div>`).join(''):`<div class="empty">${user?'No orders yet.':'Login to view your orders.'}</div>`}
function openTracker(id){
  if(user?.role==='admin'){openAdmin();return;}
  let o=id?orders.find(x=>x.id===id):(user?orders.find(x=>x.user===user.email):null);if(!o)return toast('Place an order first.');$('track').innerHTML=`<div class="trackTop"><b>${o.id}</b><strong>${o.status}</strong></div><div class="map">📍 ───────── 🛵<br><small>Mindoro delivery area • simulated tracking</small></div><div class="steps">${['Order Received','Preparing','Rider Picked Up','Out for Delivery','Delivered'].map((s,i)=>`<div class="${i<=o.step?'done':''}"><i>${i<=o.step?'✓':'•'}</i><span><b>${s}</b><small>${['Order accepted','Kitchen is preparing','Rider picked up','Rider is heading to you','Delivered'][i]}</small></span></div>`).join('')}</div><div class="riderNow">${o.rider.emoji}<span><b>${o.rider.name}</b><small>📞 ${o.rider.phone} • ${o.rider.area}</small></span><b>⭐ ${o.rider.rating}</b></div><button class="secondary full" onclick='receipt(${JSON.stringify(o)})'>View Receipt</button>`;openModal('tracker')}
function reviews(){
  if(!requireUser('reviews'))return;
  closeM('settings');let o=user&&orders.find(x=>x.user===user.email);$('reviewBox').innerHTML=!o?`<div class="empty">Complete an order first.</div>`:o.review?`<div class="note">You rated <b>${'★'.repeat(o.review.rating)}</b><p>${o.review.text||''}</p></div>`:`<p>Rate order <b>${o.id}</b></p><div class="stars">${[1,2,3,4,5].map(i=>`<button id="st${i}" onclick="rate(${i})">★</button>`).join('')}</div><textarea id="rt" placeholder="Write your feedback..."></textarea><button class="primary full" onclick="submitReview('${o.id}')">Submit Review</button>`;openModal('reviews')}
function rate(n){rating=n;for(let i=1;i<=5;i++)$('st'+i).classList.toggle('on',i<=n)}function submitReview(id){if(!rating)return toast('Select a rating.');let o=orders.find(x=>x.id===id);o.review={rating,text:$('rt').value};save();reviews()}
function openAdmin(){
  if(!user||user.role!=='admin'){
    toast('Admin access is restricted to admin accounts.');
    return;
  }
  openModal('admin');
  $('adminName').textContent=user.name||'Admin';$('adminHello').textContent=(user?.name||'Admin').split(' ')[0];$('adminDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric',year:'numeric'});adminTab('overview',document.querySelector('.adminSide .sideActive'))}
function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    if(!file)return resolve('');
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}
let menuEditId=null;

async function backendLoad(){
  const box=$('backendData'); if(!box)return;
  try{
    const response=await fetch('http://localhost:8080/api/product');
    if(!response.ok)throw new Error('Backend returned '+response.status);
    const data=await response.json();
    window.__pinoybiteMenus=data;
    box.innerHTML=data.length?data.map((x)=>`<article class="menuAdminCard"><div class="menuAdminImage"><img src="${x.image||'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82'}" alt="${x.name||'Menu item'}"><span class="menuBadge">${x.status||'Available'}</span></div><div class="menuAdminBody"><div class="menuAdminMeta"><span>MENU #${x.id}</span><span>₱${money(x.price)}</span></div><h3>${x.name||'Untitled menu'}</h3><p>Ready to serve • PinoyBite menu item</p><div class="menuAdminActions"><button class="menuEditBtn" onclick="openMenuEditor(${x.id})">Edit menu</button><button class="menuDeleteBtn" onclick="backendDelete(${x.id})">Delete</button></div></div></article>`).join(''):'<div class="menuEmpty"><div class="menuEmptyIcon">🍽️</div><h3>No menu items yet</h3><p>Add your first meal with a photo, name, and price.</p><button class="primary" onclick="openMenuEditor()">＋ Add your first menu</button></div>';
    $('backendStatus').textContent=`${data.length} menu ${data.length===1?'item':'items'} • Connected to backend`;
  }catch(err){
    console.error(err);
    $('backendStatus').textContent='Backend offline • start backend-api with npm run dev';
    box.innerHTML='<div class="menuEmpty"><div class="menuEmptyIcon">⚠️</div><h3>Menu service is offline</h3><p>Start the backend API on port 8080, then refresh this page.</p><button class="secondary" onclick="backendLoad()">Refresh menu</button></div>';
  }
}

function openMenuEditor(id=null){
  if(!user||user.role!=='admin')return toast('Admin access is restricted to admin accounts.');
  menuEditId=id;
  const item=id?(window.__pinoybiteMenus||[]).find(x=>x.id===id):null;
  const modal=$('menuEditorModal');
  if(!modal)return;
  $('menuEditorTitle').textContent=item?'Edit menu':'Add new menu';
  $('menuEditorSubtitle').textContent=item?'Update the meal details and photo.':'Create a menu item customers can recognize at a glance.';
  $('menuName').value=item?.name||'';
  $('menuPrice').value=item?.price??'';
  $('menuImage').value='';
  $('menuImagePreview').src=item?.image||'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82';
  $('menuImageName').textContent=item?.image?'Current photo':'No photo selected';
  modal.classList.add('show');
}

function closeMenuEditor(){
  $('menuEditorModal')?.classList.remove('show');
  menuEditId=null;
}

function previewMenuImage(input){
  const file=input.files?.[0];
  if(!file)return;
  if(!file.type.startsWith('image/')){input.value='';return toast('Please choose an image file.');}
  if(file.size>4*1024*1024){input.value='';return toast('Image must be 4MB or smaller.');}
  $('menuImageName').textContent=file.name;
  const reader=new FileReader();
  reader.onload=e=>{$('menuImagePreview').src=e.target.result};
  reader.readAsDataURL(file);
}

async function saveMenu(){
  if(!user||user.role!=='admin')return toast('Admin access is restricted to admin accounts.');
  const name=$('menuName').value.trim(),price=$('menuPrice').value;
  if(!name||price===''||Number(price)<0)return toast('Enter a menu name and valid price.');
  try{
    const file=$('menuImage').files?.[0];
    let image='';
    if(file)image=await fileToDataURL(file);
    const isEdit=!!menuEditId;
    const url=isEdit?`http://localhost:8080/api/product/${menuEditId}`:'http://localhost:8080/api/product';
    const body={name,price};
    if(image)body.image=image;
    const response=await fetch(url,{method:isEdit?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!response.ok)throw new Error('Backend returned '+response.status);
    closeMenuEditor();
    await backendLoad();
    toast(isEdit?'Menu updated successfully.':'Menu added successfully.');
  }catch(err){
    console.error(err);
    toast('Unable to save menu. Check that backend-api is running.');
  }
}

async function backendSubmit(e){
  e?.preventDefault?.();
  openMenuEditor();
}

async function backendEdit(id){
  openMenuEditor(id);
}

async function backendDelete(id){
  if(!user||user.role!=='admin')return toast('Admin access is restricted to admin accounts.');
  const item=(window.__pinoybiteMenus||[]).find(x=>x.id===id);
  if(!item)return toast('Menu item not found.');
  if(!confirm(`Delete "${item.name}" from the menu?`))return;
  try{
    const response=await fetch(`http://localhost:8080/api/product/${id}`,{method:'DELETE'});
    if(!response.ok)throw new Error('Backend returned '+response.status);
    const result=await response.json();
    await backendLoad();
    toast(`Deleted ${result.deleted.name}`);
  }catch(err){console.error(err);toast('Unable to delete menu.');}
}

function adminTab(t,b){document.querySelectorAll('.adminSide>button').forEach(x=>x.classList.remove('sideActive'));b?.classList.add('sideActive');let p=$('adminPanel'),sales=orders.reduce((s,o)=>s+o.total,0),pending=orders.filter(o=>o.status!=='Delivered').length;let tabs={overview:`<div class="metricGrid"><div><small>Total sales</small><b>₱${money(sales)}</b><span>All recorded orders</span></div><div><small>Orders</small><b>${orders.length}</b><span>${pending} active</span></div><div><small>Customers</small><b>${users.length}</b><span>Registered accounts</span></div><div><small>Menu items</small><b>${F.length}</b><span>Across 3 brands</span></div></div><div class="adminGrid"><div class="panelCard"><div class="panelHead"><h3>Recent orders</h3><button onclick="adminTab('orders',document.querySelectorAll('.adminSide>button')[1])">View all</button></div>${orders.slice(0,6).map(adminOrder).join('')||'<div class="empty">No orders yet.</div>'}</div><div class="panelCard"><div class="panelHead"><h3>Sales by brand</h3></div>${['McDo','Jollibee','Inasal'].map(br=>{let n=orders.flatMap(o=>o.items).filter(i=>i.brand===br).reduce((s,i)=>s+i.price*i.qty,0);return `<div class="barRow"><span>${br}</span><div><i style="width:${sales?Math.max(8,n/sales*100):8}%"></i></div><b>₱${money(n)}</b></div>`}).join('')}</div></div>`,orders:`<div class="panelCard"><div class="panelHead"><h3>Order management</h3><span>${orders.length} total</span></div>${orders.map(adminOrder).join('')||'<div class="empty">No orders yet.</div>'}</div>`,users:`<div class="panelCard"><div class="panelHead"><h3>Customers</h3><span>${users.length} registered</span></div><div class="tableHead"><span>Name</span><span>Email</span><span>Location</span></div>${users.map(u=>`<div class="tableRow"><b>${u.name}</b><span>${u.email}</span><span>${u.municipality||'—'}, ${u.province||'—'}</span></div>`).join('')||'<div class="empty">No registered users.</div>'}</div>`,inventory:`<div class="panelCard menuOverviewPanel"><div class="panelHead"><div><h3>Menu & inventory</h3><span>Keep track of the meals currently featured in PinoyBite.</span></div></div><div class="metricGrid menuMiniMetrics"><div><small>Featured meals</small><b>${F.length}</b><span>Ready to order</span></div><div><small>Brands</small><b>${new Set(F.map(x=>x[0])).size}</b><span>Food partners</span></div><div><small>Lowest price</small><b>₱${money(Math.min(...F.map(x=>x[2])))}</b><span>Budget-friendly</span></div></div><div class="panelHead menuPreviewHead"><div><h3>Current menu preview</h3><span>Customer-facing featured meals</span></div></div><div class="adminMenuPreview">${F.map((f)=>`<div class="adminPreviewCard"><img src="${f[3]}" alt="${f[1]}"><div><small>${f[0]}</small><b>${f[1]}</b><strong>₱${money(f[2])}</strong></div></div>`).join('')}</div></div>`,
menu:`<div class="panelCard menuManagerPanel"><div class="menuManagerHero"><div><span class="eyebrow">MENU MANAGEMENT</span><h3>Build your PinoyBite menu.</h3><p>Add meals with a clear photo, set the price, and update them anytime.</p></div><button class="primary menuAddBtn" onclick="openMenuEditor()">＋ Add Menu</button></div><div class="menuManagerBar"><div><b>All menu items</b><span id="backendStatus">Connecting to menu service…</span></div><button class="secondary" onclick="backendLoad()">↻ Refresh</button></div><div id="backendData" class="menuAdminGrid"></div><div id="menuEditorModal" class="menuEditorOverlay" onclick="if(event.target===this)closeMenuEditor()"><div class="menuEditorCard"><button class="menuEditorClose" onclick="closeMenuEditor()">×</button><div class="menuEditorIntro"><span class="eyebrow">MENU ITEM</span><h3 id="menuEditorTitle">Add new menu</h3><p id="menuEditorSubtitle">Create a menu item customers can recognize at a glance.</p></div><div class="menuEditorLayout"><div class="menuPhotoPicker"><img id="menuImagePreview" src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82" alt="Menu preview"><label for="menuImage">Change photo</label><input id="menuImage" type="file" accept="image/*" onchange="previewMenuImage(this)"><small id="menuImageName">No photo selected</small></div><div class="menuFields"><label>Menu name<input id="menuName" type="text" placeholder="e.g. Chicken Inasal Meal"></label><label>Price<input id="menuPrice" type="number" min="0" step="0.01" placeholder="159"></label><div class="menuEditorActions"><button class="secondary" type="button" onclick="closeMenuEditor()">Cancel</button><button class="primary" type="button" onclick="saveMenu()">Save Menu</button></div></div></div></div></div></div>`,riders:`<div class="panelCard"><div class="panelHead"><h3>Rider directory</h3><span>${R.length} riders</span></div>${R.map(r=>`<div class="riderAdmin"><span>${r[4]}</span><div><b>${r[0]}</b><small>${r[1]} • ${r[2]}</small></div><strong>★ ${r[3]}</strong><em>Active</em></div>`).join('')}</div>`,reports:`<div class="metricGrid"><div><small>Gross sales</small><b>₱${money(sales)}</b><span>Recorded in browser</span></div><div><small>Average order</small><b>₱${money(orders.length?sales/orders.length:0)}</b><span>Per order</span></div><div><small>Delivered</small><b>${orders.filter(o=>o.status==='Delivered').length}</b><span>Completed orders</span></div><div><small>GCash orders</small><b>${orders.filter(o=>o.payment==='GCash').length}</b><span>Payment method</span></div></div><div class="panelCard"><div class="panelHead"><h3>System note</h3></div><p class="muted">This capstone version stores demo data in localStorage. For multi-device admin data, secure authentication, payments, and live delivery tracking, connect the project to a backend/database.</p></div>`};p.innerHTML=tabs[t];if(t==='menu')setTimeout(backendLoad,0)}
function adminOrder(o){return `<div class="adminOrder"><div><b>${o.id}</b><strong>${o.customer.name}</strong><small>${o.customer.municipality}, ${o.customer.province} • ${o.rider.name} • ${o.payment}</small></div><select onchange="updateOrderStatus('${o.id}',this.value)">${['Order Received','Preparing','Rider Picked Up','Out for Delivery','Delivered'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select></div>`}
function updateOrderStatus(id,s){let o=orders.find(x=>x.id===id);o.status=s;o.step=['Order Received','Preparing','Rider Picked Up','Out for Delivery','Delivered'].indexOf(s);save();ordersRender();adminTab('orders',document.querySelectorAll('.adminSide>button')[1]);toast('Order updated')}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
render();cartRender();ordersRender();ui();
if(user?.role==='admin')openAdmin();


// Keep the original UI inline handlers working while using Vite modules.
Object.assign(window, {
  openModal, closeM, switchM, filter, brand, add, cartRender, q, openCart, municipal,
  register, login, googleLogin, togglePass, logout, ui, openSettings, account, checkout,
  renderRiders, place, receipt, printReceipt, ordersRender, openTracker, reviews, rate,
  submitReview, openAdmin, adminTab, adminOrder, updateOrderStatus, toast, backendLoad, backendSubmit, backendEdit, backendDelete, openMenuEditor, closeMenuEditor, previewMenuImage, saveMenu
});

function startOrdering(){
  if(user?.role==='admin'){openAdmin();return;}
  if(user){location.hash='menu';}
  else{openModal('login');}
}
window.startOrdering = startOrdering;
