// SWEET CRUMBS BAKERY - COMPLETE DEMO WEBSITE

const $ = id => document.getElementById(id);
const rupees = n => "₹" + Number(n).toLocaleString("en-IN");

const products = [
  {id:1,name:"Chocolate Truffle Cake",category:"Cakes",price:599,description:"Rich chocolate cake with creamy ganache.",image:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700"},
  {id:2,name:"Red Velvet Cake",category:"Cakes",price:699,description:"Soft red velvet with cream cheese frosting.",image:"https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=700"},
  {id:3,name:"Vanilla Cake",category:"Cakes",price:499,description:"Classic vanilla sponge with smooth cream.",image:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=700"},
  {id:4,name:"Chocolate Cupcakes",category:"Cupcakes",price:199,description:"Soft cupcakes topped with chocolate cream.",image:"https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=700"},
  {id:5,name:"Strawberry Cupcakes",category:"Cupcakes",price:229,description:"Sweet strawberry cupcakes with frosting.",image:"https://images.unsplash.com/photo-1519869325930-281384150729?w=700"},
  {id:6,name:"Chocolate Chip Cookies",category:"Cookies",price:149,description:"Crunchy cookies filled with chocolate chips.",image:"https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700"},
  {id:7,name:"Butter Cookies",category:"Cookies",price:129,description:"Freshly baked buttery cookies.",image:"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=700"},
  {id:8,name:"Chocolate Pastry",category:"Pastries",price:120,description:"Delicious pastry with chocolate layers.",image:"https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=700"}
];

let cart = JSON.parse(localStorage.getItem("sc_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("sc_wishlist") || "[]");
let category = "All";
let couponApplied = false;

function saveCart(){
  localStorage.setItem("sc_cart",JSON.stringify(cart));
}

function saveWishlist(){
  localStorage.setItem("sc_wishlist",JSON.stringify(wishlist));
}

function toast(message){
  $("toastText").textContent=message;
  bootstrap.Toast.getOrCreateInstance($("siteToast")).show();
}

/* PRODUCT SEARCH, FILTER AND SORT */

function displayProducts(){
  let query=$("searchInput").value.toLowerCase().trim();
  let list=products.filter(p=>{
    let matchCategory=category==="All" || p.category===category;
    let matchSearch=(p.name+" "+p.category+" "+p.description).toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  let sort=$("sortSelect").value;
  if(sort==="low") list.sort((a,b)=>a.price-b.price);
  if(sort==="high") list.sort((a,b)=>b.price-a.price);
  if(sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));

  $("productGrid").innerHTML=list.map(p=>`
    <div class="col-sm-6 col-lg-3">
      <div class="product-card">
        <div class="product-img-wrap">
          <img class="product-img" src="${p.image}" alt="${p.name}">
          <span class="product-tag">${p.category}</span>
          <button class="heart-btn" onclick="toggleWishlist(${p.id})">
            <i class="bi ${wishlist.includes(p.id)?"bi-heart-fill":"bi-heart"}"></i>
          </button>
        </div>
        <div class="card-body">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <div class="product-price">${rupees(p.price)}</div>
          <div class="product-buttons">
    <button class="btn btn-outline-bakery"
        onclick="viewProduct(${p.id})">
        Details
    </button>

    <button class="btn btn-bakery"
        onclick="addToCart(${p.id})">
        Add to Cart
    </button>

    <button class="btn btn-bakery"
        onclick="orderNow(${p.id})">
        Order Now
    </button>
</div>
        </div>
      </div>
    </div>
  `).join("");

  $("noProducts").classList.toggle("d-none",list.length!==0);
}

/* PRODUCT DETAILS */

function viewProduct(id){
  let p=products.find(x=>x.id===id);
  if(!p)return;

  $("detailTitle").textContent=p.name;
  $("detailImage").src=p.image;
  $("detailImage").alt=p.name;
  $("detailDescription").textContent=p.description;
  $("detailPrice").textContent=rupees(p.price);

  $("detailAdd").onclick=()=>{
    addToCart(id);
    bootstrap.Modal.getOrCreateInstance($("detailsModal")).hide();
  };
$("detailOrder").onclick=()=>{
    addToCart(id);

    bootstrap.Modal.getOrCreateInstance(
        $("detailsModal")
    ).hide();

    setTimeout(()=>{
        bootstrap.Modal.getOrCreateInstance(
            $("cartModal")
        ).show();
    },400);
};
}

/* CART FUNCTIONS */

function addToCart(id){
  let p=products.find(x=>x.id===id);
  if(!p)return;

  let existing=cart.find(x=>x.id===id);
  if(existing) existing.qty++;
  else cart.push({...p,qty:1});

  saveCart();
  displayCart();
  toast(p.name+" added to cart!");
}
function orderNow(id) {
    addToCart(id);

    bootstrap.Modal.getOrCreateInstance(
        $("cartModal")
    ).show();
}
function addCustomItem(item){
  cart.push({
    id:Date.now(),
    name:item.name,
    category:"Custom Cake",
    price:item.price,
    description:item.description,
    qty:1
  });
  saveCart();
  displayCart();
}

function changeQuantity(id,change){
  let item=cart.find(x=>x.id===id);
  if(!item)return;

  item.qty+=change;
  if(item.qty<=0) cart=cart.filter(x=>x.id!==id);

  saveCart();
  displayCart();
}

function removeItem(id){
  cart=cart.filter(x=>x.id!==id);
  saveCart();
  displayCart();
}

function subtotal(){
  return cart.reduce((sum,item)=>sum+item.price*item.qty,0);
}

function giftCost(){
  return $("cartIsGift").checked ? Number($("cartGiftWrap").value) : 0;
}

function discount(){
  return couponApplied ? Math.round((subtotal()+giftCost())*.10) : 0;
}

function total(){
  return subtotal()+giftCost()-discount();
}

function displayCart(){
  $("cartCount").textContent=cart.reduce((sum,item)=>sum+item.qty,0);

  if(cart.length===0){
    $("cartItems").innerHTML='<p class="text-center text-muted py-4">Your cart is empty. Add some delicious treats!</p>';
  }else{
    $("cartItems").innerHTML=cart.map(item=>`
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <small>${rupees(item.price)} each</small>
          <div class="qty-controls">
            <button onclick="changeQuantity(${item.id},-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQuantity(${item.id},1)">+</button>
            <button class="remove-item" onclick="removeItem(${item.id})">Remove</button>
          </div>
        </div>
        <strong>${rupees(item.price*item.qty)}</strong>
      </div>
    `).join("");
  }

  $("cartSubtotal").textContent=rupees(subtotal());
  $("cartDiscount").textContent="-"+rupees(discount());
  $("cartTotal").textContent=rupees(total());
}

/* COUPON */

function applyCoupon(){
  let code=$("couponInput").value.trim().toUpperCase();

  if(code==="SWEET10"){
    couponApplied=true;
    $("couponMessage").textContent="10% discount applied successfully!";
    $("couponMessage").className="text-success small";
  }else{
    couponApplied=false;
    $("couponMessage").textContent="Invalid code. Try SWEET10.";
    $("couponMessage").className="text-danger small";
  }
  displayCart();
}

/* WISHLIST */

function toggleWishlist(id){
  if(wishlist.includes(id)){
    wishlist=wishlist.filter(x=>x!==id);
  }else{
    wishlist.push(id);
  }
  saveWishlist();
  displayProducts();
  displayWishlist();
}

function displayWishlist(){
  $("wishCount").textContent=wishlist.length;
  let items=products.filter(p=>wishlist.includes(p.id));

  $("wishlistItems").innerHTML=items.length ? items.map(p=>`
    <div class="wishlist-item">
      <div><strong>${p.name}</strong><br>${rupees(p.price)}</div>
      <div>
        <button class="btn btn-sm btn-bakery" onclick="addToCart(${p.id})">Add</button>
        <button class="btn btn-sm btn-outline-bakery" onclick="toggleWishlist(${p.id})">Remove</button>
      </div>
    </div>
  `).join("") : '<p>Your wishlist is empty.</p>';
}

/* CUSTOM CAKE AND GIFT */

function updateCustomPrice(){
  let base=Number($("cakeSize").value);
  let extra=$("isGift").checked ? Number($("giftWrap").value) : 0;
  $("customPrice").textContent=rupees(base+extra);
}

function submitCustomCake(event){
  event.preventDefault();

  let flavour=$("cakeFlavour").value;
  let base=Number($("cakeSize").value);
  let date=$("cakeDate").value;
  let cakeMessage=$("cakeMessage").value;
  let instructions=$("cakeInstructions").value;

  let gift=$("isGift").checked;
  let recipient=$("recipientName").value;
  let wrap=$("giftWrap").value;
  let giftNote=$("giftMessage").value;

  let price=base+(gift?Number(wrap):0);

  let description=
    "Date: "+date+
    ". Cake message: "+cakeMessage+
    ". Design: "+instructions+
    (gift?". Gift recipient: "+recipient+
    ". Gift note: "+giftNote:"");

  addCustomItem({
    name:flavour+" Custom Cake",
    price:price,
    description:description
  });

  $("customFeedback").textContent="Your custom cake has been added to the cart!";
  $("customForm").reset();
  $("giftFields").classList.add("d-none");
  updateCustomPrice();
}

/* ORDER CONFIRMATION AND TRACKING */

function confirmOrder(){
  if(cart.length===0){
    toast("Your cart is empty!");
    return;
  }

  let orderId="SC"+Date.now().toString().slice(-8);

  let order={
    id:orderId,
    items:cart.map(x=>({name:x.name,price:x.price,qty:x.qty})),
    total:total(),
    date:new Date().toLocaleString(),
    status:"Order Received",
    gift:$("cartIsGift").checked ? {
      recipient:$("cartRecipient").value,
      wrap:$("cartGiftWrap").value,
      note:$("cartGiftMessage").value
    }:null
  };

  let orders=JSON.parse(localStorage.getItem("sc_orders")||"[]");
  orders.push(order);
  localStorage.setItem("sc_orders",JSON.stringify(orders));

  $("orderConfirmation").innerHTML=
    "Your order is confirmed!<br>Order ID: <strong>"+orderId+"</strong><br>Save this ID to track your order.";
  $("orderConfirmation").classList.remove("d-none");

  cart=[];
  couponApplied=false;
  saveCart();
  displayCart();

  $("cartIsGift").checked=false;
  $("cartGiftFields").classList.add("d-none");
  $("cartRecipient").value="";
  $("cartGiftMessage").value="";
  $("cartGiftWrap").value="0";
  $("couponInput").value="";
  $("couponMessage").textContent="";

  displayAdmin();
  toast("order has been placed successfully!");
}

function trackOrder(event){
  event.preventDefault();

  let id=$("trackingId").value.trim().toUpperCase();
  let orders=JSON.parse(localStorage.getItem("sc_orders")||"[]");
  let order=orders.find(x=>x.id===id);

  if(!order){
    $("trackingResult").innerHTML='<div class="alert alert-warning">Order not found. Please check your Order ID.</div>';
    return;
  }

  $("trackingResult").innerHTML=`
    <div class="alert alert-success">
      <h5>Order ${order.id}</h5>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Date:</strong> ${order.date}</p>
      <p><strong>Total:</strong> ${rupees(order.total)}</p>
      <strong>Items:</strong>
      ${order.items.map(x=>`<div>${x.name} × ${x.qty}</div>`).join("")}
    </div>
  `;
}

/* DEMO ADMIN */

function displayAdmin(){
  let orders=JSON.parse(localStorage.getItem("sc_orders")||"[]");
  $("adminCount").textContent=orders.length;

  $("adminOrders").innerHTML=orders.length ? orders.slice().reverse().map(o=>`
    <div class="admin-order">
      <strong>${o.id}</strong> — ${rupees(o.total)}
      <p class="small text-muted">${o.date}</p>
      <select class="form-select form-select-sm"
        onchange="changeOrderStatus('${o.id}',this.value)">
        ${["Order Received","Preparing","Ready for Pickup","Out for Delivery","Delivered"].map(s=>
          `<option ${s===o.status?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>
  `).join("") : "<p>No orders available.</p>";
}

function changeOrderStatus(id,status){
  let orders=JSON.parse(localStorage.getItem("sc_orders")||"[]");
  let order=orders.find(x=>x.id===id);
  if(order){
    order.status=status;
    localStorage.setItem("sc_orders",JSON.stringify(orders));
    displayAdmin();
    toast("Order status updated.");
  }
}

/* CHATBOT / HELP ASSISTANT */

function addMessage(message,type){
  let div=document.createElement("div");
  div.className=type==="user"?"user-message":"bot-message";
  div.textContent=message;
  $("chatMessages").appendChild(div);
  $("chatMessages").scrollTop=$("chatMessages").scrollHeight;
}

function chatbotAnswer(message){
  let q=message.toLowerCase();
  let answer="I can help you with cake prices, custom cakes, gift orders, cart, coupons and order tracking. What would you like to know?";

  if(q.includes("price")||q.includes("cake")){
    answer="Here are our cake prices:\n"+
      products.filter(p=>p.category==="Cakes")
      .map(p=>p.name+" — "+rupees(p.price)).join("\n")+
      "\nVisit Our Cakes to see all products.";
  }

  if(q.includes("track")||q.includes("order id")){
    answer="To track your order, confirm a order in your cart. Copy the Order ID shown after confirmation and enter it in the Track Order section.";
  }

  if(q.includes("gift")){
    answer="You can select 'This cake is a gift' in the Custom Cake form. Enter the recipient name, select gift packaging and add a gift note. You can also mark the whole cart as a gift.";
  }

  if(q.includes("custom")||q.includes("design")){
    answer="Open the Custom Cake section. Choose flavour, size, date and design instructions. You can also add gift packaging and a personal note.";
  }

  if(q.includes("coupon")||q.includes("discount")){
    answer="Use coupon code SWEET10 in your cart to get a 10% demo discount.";
  }

  if(q.includes("cart")||q.includes("add")){
    answer="Click Add to Cart on any product. In your cart, you can change quantity, remove products, apply a coupon and confirm your demo order.";
  }

  if(q.includes("delivery")||q.includes("shipping")){
    answer="This is a student website demo. It does not currently book real delivery or calculate live delivery charges.";
  }

  if(q.includes("contact")||q.includes("help")||q.includes("human")){
    answer="Please visit the Contact section and submit your enquiry. This chatbot is an automated demo assistant.";
  }

  window.setTimeout(()=>addMessage(answer,"bot"),250);
}

function sendChat(event){
  event.preventDefault();
  let message=$("chatInput").value.trim();
  if(!message)return;

  addMessage(message,"user");
  $("chatInput").value="";
  chatbotAnswer(message);
}

/* DARK MODE */

function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  let dark=document.body.classList.contains("dark-mode");
  localStorage.setItem("sc_theme",dark?"dark":"light");
  $("themeBtn").innerHTML=dark?
    '<i class="bi bi-sun"></i>':
    '<i class="bi bi-moon"></i>';
}

/* CONTACT FORM */

function submitContact(event){
  event.preventDefault();
  $("contactFeedback").textContent="Thank you! Your enquiry has been submitted.";
  $("contactForm").reset();
}

/* START WEBSITE */

document.addEventListener("DOMContentLoaded",function(){

  $("year").textContent=new Date().getFullYear();

  // Product controls
  $("searchInput").addEventListener("input",displayProducts);
  $("sortSelect").addEventListener("change",displayProducts);

  $("categoryButtons").addEventListener("click",function(event){
    let button=event.target.closest("[data-category]");
    if(!button)return;

    category=button.dataset.category;

    document.querySelectorAll(".filter").forEach(x=>
      x.classList.toggle("active",x===button)
    );

    displayProducts();
  });

  // Cart and wishlist
  $("applyCoupon").addEventListener("click",applyCoupon);
  $("placeOrder").addEventListener("click",confirmOrder);
  $("cartIsGift").addEventListener("change",function(){
    $("cartGiftFields").classList.toggle("d-none",!this.checked);
    displayCart();
  });
  $("cartGiftWrap").addEventListener("change",displayCart);

  // Custom cake
  $("cakeSize").addEventListener("change",updateCustomPrice);
  $("giftWrap").addEventListener("change",updateCustomPrice);
  $("isGift").addEventListener("change",function(){
    $("giftFields").classList.toggle("d-none",!this.checked);
    updateCustomPrice();
  });
  $("customForm").addEventListener("submit",submitCustomCake);

  // Tracking and contact
  $("trackingForm").addEventListener("submit",trackOrder);
  $("contactForm").addEventListener("submit",submitContact);

  // Chatbot
  $("chatLauncher").addEventListener("click",function(){
    $("chatPanel").classList.remove("d-none");
    $("chatInput").focus();
  });
  $("chatClose").addEventListener("click",function(){
    $("chatPanel").classList.add("d-none");
  });
  $("chatForm").addEventListener("submit",sendChat);

  document.querySelectorAll("[data-question]").forEach(button=>{
    button.addEventListener("click",function(){
      let question=this.dataset.question;
      addMessage(question,"user");
      chatbotAnswer(question);
    });
  });

  // Admin
  $("adminButton").addEventListener("click",function(){
    displayAdmin();
    bootstrap.Modal.getOrCreateInstance($("adminModal")).show();
  });

  // Theme
  $("themeBtn").addEventListener("click",toggleTheme);
  if(localStorage.getItem("sc_theme")==="dark"){
    document.body.classList.add("dark-mode");
    $("themeBtn").innerHTML='<i class="bi bi-sun"></i>';
  }

  // Date cannot be in the past
  $("cakeDate").min=new Date().toISOString().split("T")[0];

  displayProducts();
  displayCart();
  displayWishlist();
  displayAdmin();
  updateCustomPrice();
});
