import {
  db,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "./firebase.js";

// Elementos da interface
const adminToggleBtn = document.getElementById("adminToggleBtn");
const adminModal = document.getElementById("adminModal");
const closeAdminBtn = document.getElementById("closeAdminBtn");
const loginSection = document.getElementById("loginSection");
const adminEditor = document.getElementById("adminEditor");
const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

const testimonialsContainer = document.getElementById("testimonials-container");
const productsContainer = document.getElementById("products-container");
const featuresContainer = document.getElementById("features-container");

const adminTestimonials = document.getElementById("adminTestimonials");
const adminProducts = document.getElementById("adminProducts");
const adminFeatures = document.getElementById("adminFeatures");

const addTestimonialBtn = document.getElementById("addTestimonialBtn");
const addProductBtn = document.getElementById("addProductBtn");
const addFeatureBtn = document.getElementById("addFeatureBtn");

let listenersAdded = false;

// --- MODAL ---
function openAdmin() {
  adminModal.style.display = "block";
}

function closeAdmin() {
  adminModal.style.display = "none";
  resetLogin();
}

function resetLogin() {
  loginSection.style.display = "block";
  adminEditor.style.display = "none";
  loginError.style.display = "none";
  emailInput.value = "";
  passwordInput.value = "";
}

adminToggleBtn.addEventListener("click", openAdmin);
closeAdminBtn.addEventListener("click", closeAdmin);
window.addEventListener("click", (e) => {
  if (e.target === adminModal) closeAdmin();
});

// --- AUTH ---
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginError.style.display = "none";
  } catch (error) {
    console.error("Erro no login:", error.message);
    loginError.style.display = "block";
    loginError.textContent = "Email ou senha inválidos.";
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    resetLogin();
    adminEditor.style.display = "none";
  });
});

// Verifica se usuário está logado
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    adminEditor.style.display = "block";

    if (!listenersAdded) {
      setupAddButtons();
      setupAdminData();
      listenersAdded = true;
    }
  } else {
    resetLogin();
  }
});

// --- CARREGA SITE (PÚBLICO) ---
onSnapshot(collection(db, "testimonials"), (snapshot) => {
  renderTestimonials(snapshot.docs);
});
onSnapshot(collection(db, "products"), (snapshot) => {
  renderProducts(snapshot.docs);
});
onSnapshot(collection(db, "features"), (snapshot) => {
  renderFeatures(snapshot.docs);
});

// --- ADMIN DATA ---
function setupAdminData() {
  onSnapshot(collection(db, "testimonials"), (snapshot) => {
    renderAdminTestimonials(snapshot.docs);
  });

  onSnapshot(collection(db, "products"), (snapshot) => {
    renderAdminProducts(snapshot.docs);
  });

  onSnapshot(collection(db, "features"), (snapshot) => {
    renderAdminFeatures(snapshot.docs);
  });
}

// --- RENDER SITE ---
function renderTestimonials(data) {
  testimonialsContainer.innerHTML = "";
  data.forEach(doc => {
    const t = doc.data();
    testimonialsContainer.innerHTML += `
      <div class="testimonial">
        <p class="testimonial-text">"${t.texto}"</p>
        <p class="testimonial-author">- ${t.autor}</p>
      </div>
    `;
  });
}

function renderProducts(data) {
  productsContainer.innerHTML = "";
  data.forEach(doc => {
    const p = doc.data();
    const parcelas = p.parcelas && Number(p.parcelas) > 1 ? Number(p.parcelas) : 1;
    const preco = Number(p.preco) || 0;
    const valorParcela = (preco / parcelas).toFixed(2).replace('.', ',');

    productsContainer.innerHTML += `
      <div class="product-card">
        <div class="product-image">${p.imagem || "🛏️"}</div>
        <div class="product-info">
          <h3 class="product-title">${p.nome}</h3>
          <p class="product-price">
            R$ ${preco.toFixed(2).replace('.', ',')}
            ${parcelas > 1 ? `em ${parcelas}x de R$ ${valorParcela}` : ""}
          </p>
          <a href="${p.link}" target="_blank" class="product-link">Comprar</a>
        </div>
      </div>
    `;
  });
}

function renderFeatures(data) {
  featuresContainer.innerHTML = "";
  data.forEach(doc => {
    const f = doc.data();
    featuresContainer.innerHTML += `
      <div class="feature-card">
        <div class="feature-icon">${f.icone || "⭐"}</div>
        <h4>${f.titulo}</h4>
        <p>${f.descricao}</p>
      </div>
    `;
  });
}

// --- ADMIN RENDER ---
function renderAdminTestimonials(data) {
  adminTestimonials.innerHTML = "";
  data.forEach(docItem => {
    const data = docItem.data();
    const div = document.createElement("div");
    div.className = "admin-item";

    div.appendChild(createEditableField({ collectionName: "testimonials", id: docItem.id }, "autor", data.autor, "Autor"));
    div.appendChild(createEditableTextarea({ collectionName: "testimonials", id: docItem.id }, "texto", data.texto, "Texto do depoimento"));
    div.appendChild(createDeleteBtn(docItem.id, "testimonials"));

    adminTestimonials.appendChild(div);
  });
}

function renderAdminProducts(data) {
  adminProducts.innerHTML = "";
  data.forEach(docItem => {
    const data = docItem.data();
    const div = document.createElement("div");
    div.className = "admin-item";

    div.appendChild(createEditableField({ collectionName: "products", id: docItem.id }, "nome", data.nome, "Nome"));
    div.appendChild(createEditableField({ collectionName: "products", id: docItem.id }, "preco", data.preco, "Preço"));
    div.appendChild(createEditableField({ collectionName: "products", id: docItem.id }, "parcelas", data.parcelas || 1, "Parcelas"));
    div.appendChild(createEditableField({ collectionName: "products", id: docItem.id }, "link", data.link, "Link"));
    div.appendChild(createEditableField({ collectionName: "products", id: docItem.id }, "imagem", data.imagem, "Ícone"));
    div.appendChild(createDeleteBtn(docItem.id, "products"));

    adminProducts.appendChild(div);
  });
}

function renderAdminFeatures(data) {
  adminFeatures.innerHTML = "";
  data.forEach(docItem => {
    const data = docItem.data();
    const div = document.createElement("div");
    div.className = "admin-item";

    div.appendChild(createEditableField({ collectionName: "features", id: docItem.id }, "titulo", data.titulo, "Título"));
    div.appendChild(createEditableTextarea({ collectionName: "features", id: docItem.id }, "descricao", data.descricao, "Descrição"));
    div.appendChild(createEditableField({ collectionName: "features", id: docItem.id }, "icone", data.icone, "Ícone"));
    div.appendChild(createDeleteBtn(docItem.id, "features"));

    adminFeatures.appendChild(div);
  });
}

// --- CAMPOS EDITÁVEIS ---
function createEditableField(id, field, value, placeholder) {
  const input = document.createElement("input");
  input.value = value || "";
  input.placeholder = placeholder || "";

  if (field === "preco" || field === "parcelas") {
    input.type = "number";
    input.min = "0";
    if (field === "parcelas") input.min = "1";
  } else {
    input.type = "text";
  }

  input.onchange = () => {
    let val = input.value;
    if (field === "preco" || field === "parcelas") {
      val = Number(val);
      if (isNaN(val) || val < (field === "parcelas" ? 1 : 0)) {
        alert(`Valor inválido para ${placeholder}`);
        input.value = value || (field === "parcelas" ? "1" : "0");
        return;
      }
    }
    updateDocField(id.collectionName, id.id, field, val);
  };
  return input;
}

function createEditableTextarea(id, field, value, placeholder) {
  const textarea = document.createElement("textarea");
  textarea.value = value || "";
  textarea.placeholder = placeholder || "";
  textarea.onchange = () => updateDocField(id.collectionName, id.id, field, textarea.value);
  return textarea;
}

function createDeleteBtn(id, collectionName) {
  const btn = document.createElement("button");
  btn.textContent = "Excluir";
  btn.className = "btn btn-danger";
  btn.onclick = () => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteDoc(doc(db, collectionName, id));
    }
  };
  return btn;
}

async function updateDocField(collectionName, id, field, value) {
  try {
    await updateDoc(doc(db, collectionName, id), { [field]: value });
  } catch (error) {
    console.error("Erro ao atualizar:", error);
  }
}

// --- BOTÕES ADD ---
function setupAddButtons() {
  addTestimonialBtn.addEventListener("click", async () => {
    await addDoc(collection(db, "testimonials"), {
      autor: "Novo Autor",
      texto: "Novo depoimento..."
    });
  });

  addFeatureBtn.addEventListener("click", async () => {
    await addDoc(collection(db, "features"), {
      titulo: "Nova Feature",
      descricao: "Descrição da feature...",
      icone: "✨"
    });
  });

  addProductBtn.addEventListener("click", async () => {
    await addDoc(collection(db, "products"), {
      nome: "Novo Produto",
      preco: 0,
      parcelas: 1,
      link: "#",
      imagem: "🛍️"
    });
  });
}