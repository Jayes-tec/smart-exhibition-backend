let editingProductId = null;
async function loadProducts(){return (await apiCall("/products/my")).data||[];}
async function renderTable(){
  const tbody=document.getElementById("productsBody");
  try{
    const list=await loadProducts();
    tbody.innerHTML=list.length?list.map(p=>`<tr><td>${p.product_name}</td><td>${p.category||"—"}</td><td>${p.price==null?"—":"₹"+Number(p.price).toLocaleString("en-IN")}</td><td><span class="badge ${String(p.status).toLowerCase()}">${p.status||"active"}</span></td><td><div class="row-actions"><a href="#" onclick='editProduct(${JSON.stringify(p)});return false;'>Edit</a><button class="danger" onclick="deleteProduct(${p.product_id})">Delete</button></div></td></tr>`).join(""):`<tr><td colspan="5" class="empty-state">No products listed yet.</td></tr>`;
  }catch(e){tbody.innerHTML=`<tr><td colspan="5" class="empty-state">${e.message}</td></tr>`;}
}
function editProduct(p){editingProductId=p.product_id;document.getElementById("modalTitle").textContent="Edit Product";document.getElementById("submitBtn").textContent="Save Changes";for(const id of ["product_name","category","price","description","status"]){const el=document.getElementById(id);if(el)el.value=p[id]??"";}document.getElementById("product_id").value=p.product_id;document.getElementById("createModal").classList.add("active");}
async function deleteProduct(id){if(!confirm("Delete this product?"))return;try{await apiCall(`/products/${id}`,"DELETE");await renderTable();}catch(e){alert(e.message);}}
document.addEventListener("DOMContentLoaded",async()=>{
 if(!requireAuth())return;showUserChip("Exhibitor");
 const overlay=document.getElementById("createModal"),form=document.getElementById("productForm");
 const reset=()=>{form.reset();editingProductId=null;document.getElementById("product_id").value="";document.getElementById("modalTitle").textContent="Add Product";document.getElementById("submitBtn").textContent="Add Product";};
 document.getElementById("openCreateModal").onclick=()=>{reset();overlay.classList.add("active")};document.getElementById("closeCreateModal").onclick=()=>overlay.classList.remove("active");document.getElementById("cancelCreate").onclick=()=>overlay.classList.remove("active");
 form.onsubmit=async e=>{e.preventDefault();const err=document.getElementById("formError");err.classList.remove("active");const data=Object.fromEntries(new FormData(form).entries());
  try{
   if(editingProductId) await apiCall(`/products/${editingProductId}`,"PUT",{product_name:data.product_name,category:data.category,description:data.description,price:data.price||null,status:data.status});
   else {
    const regs=(await apiCall("/exhibitionExhibitor/my")).data||[];
    const approved=regs.find(r=>r.status==="Approved");
    if(!approved) throw new Error("You need an approved exhibition registration before adding products.");
    await apiCall("/products","POST",{exhibition_exhibitor_id:approved.exhibition_exhibitor_id,product_name:data.product_name,category:data.category,description:data.description,price:data.price||null});
   }
   overlay.classList.remove("active");reset();await renderTable();
  }catch(x){err.textContent=x.message;err.classList.add("active");}
 };
 await renderTable();
});
