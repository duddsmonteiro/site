import { THREE_DAYS_MS } from "./state.js";
import { esc, createSafeUrl, persistState } from "./storage.js";
import { formatDate } from "./analytics.js";

export function setActiveView(viewId, tabs, views) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewId));
  views.forEach((view) => view.classList.toggle("active", view.id === viewId));
}

export function renderDragCards(state, dragList, onDropDone) {
  dragList.innerHTML = "";
  if (!state.links.length) {
    dragList.innerHTML = '<div class="empty">Nenhum link cadastrado.</div>';
    return;
  }

  state.links.forEach((link, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.index = index;
    card.innerHTML = `<span><strong>${esc(link.label || "Sem nome")}</strong><div class="card-sub">${esc(link.url || "Sem URL")}</div></span><span class="handle">:::</span>`;
    dragList.appendChild(card);
  });

  let draggedIndex = null;
  dragList.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("dragstart", () => {
      draggedIndex = Number(card.dataset.index);
    });

    card.addEventListener("dragover", (event) => event.preventDefault());

    card.addEventListener("drop", (event) => {
      event.preventDefault();
      const targetIndex = Number(card.dataset.index);
      if (draggedIndex === null || draggedIndex === targetIndex) return;
      const [item] = state.links.splice(draggedIndex, 1);
      state.links.splice(targetIndex, 0, item);
      onDropDone();
    });
  });
}

export function renderLinkEditor(state, linkEditorList, onChanged) {
  linkEditorList.innerHTML = "";

  if (!state.links.length) {
    linkEditorList.innerHTML = '<div class="empty">Adicione seu primeiro link para começar.</div>';
    return;
  }

  state.links.forEach((link, index) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<input class="field" data-field="label" data-index="${index}" value="${esc(link.label)}" placeholder="Nome do botão" /><input class="field" data-field="url" data-index="${index}" value="${esc(link.url)}" placeholder="https://..." /><button class="btn remove" data-remove-link="${index}" type="button">X</button>`;
    linkEditorList.appendChild(row);
  });

  linkEditorList.querySelectorAll("input[data-field]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const idx = Number(event.target.dataset.index);
      const field = event.target.dataset.field;
      state.links[idx][field] = event.target.value;
      persistState(state);
      onChanged(false);
    });
  });

  linkEditorList.querySelectorAll("button[data-remove-link]").forEach((button) => {
    button.addEventListener("click", () => {
      state.links.splice(Number(button.dataset.removeLink), 1);
      onChanged(true);
    });
  });
}

export function renderDashboardLinks(state, dashboardPreviewLinks) {
  dashboardPreviewLinks.innerHTML = "";
  if (!state.links.length) {
    dashboardPreviewLinks.innerHTML = '<div class="empty">Sem links no preview.</div>';
    return;
  }

  state.links.slice(0, 6).forEach((link) => {
    const anchor = document.createElement("a");
    anchor.className = "link-btn";
    anchor.href = createSafeUrl(link.url);
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.label || "Sem nome";
    dashboardPreviewLinks.appendChild(anchor);
  });
}

export function renderBioLinks(state, bioLinks) {
  bioLinks.innerHTML = "";
  if (!state.links.length) {
    bioLinks.innerHTML = '<div class="empty">Sem links publicados.</div>';
    return;
  }

  state.links.forEach((link, index) => {
    const anchor = document.createElement("a");
    anchor.className = `glass-btn${index === 0 ? " pulse" : ""}`;
    anchor.href = createSafeUrl(link.url);
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.innerHTML = `<span>${esc(link.label || "Sem nome")}</span><span>${index === 0 ? "★" : "↗"}</span>`;
    bioLinks.appendChild(anchor);
  });
}

export function renderInstagramFeed(state, instagramFeedWidget) {
  if (!instagramFeedWidget) return;
  instagramFeedWidget.style.display = state.showInstagramFeed ? "block" : "none";
}

export function renderProducts(state, productList, productQuickList, onChanged) {
  productList.innerHTML = "";
  productQuickList.innerHTML = "";

  if (!state.products.length) {
    productList.innerHTML = '<div class="empty">Nenhum produto adicionado.</div>';
    productQuickList.innerHTML = '<div class="empty">Sem produtos no momento.</div>';
    return;
  }

  state.products.forEach((product, index) => {
    const description = product.description || "Sem descrição.";
    const media = product.image
      ? `<img class="product-photo" src="${esc(product.image)}" alt="Foto de ${esc(product.name)}" />`
      : `<div class="product-photo placeholder">Sem foto</div>`;

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `<div class="product-main">${media}<div><div><strong>${esc(product.name)}</strong></div><div class="product-link">${esc(product.url)}</div><div class="product-desc">${esc(description)}</div></div></div><div style="display:flex;gap:8px;"><a class="btn" href="${createSafeUrl(product.url)}" target="_blank" rel="noopener noreferrer">Abrir</a><button class="btn remove" data-remove-product="${index}" type="button">X</button></div>`;
    productList.appendChild(card);

    const quick = document.createElement("a");
    quick.className = "product-pill";
    quick.href = createSafeUrl(product.url);
    quick.target = "_blank";
    quick.rel = "noopener noreferrer";
    quick.innerHTML = `${media}<span class="product-pill-content"><strong>${esc(product.name)}</strong><small>${esc(description)}</small></span>`;
    productQuickList.appendChild(quick);
  });

  productList.querySelectorAll("button[data-remove-product]").forEach((button) => {
    button.addEventListener("click", () => {
      state.products.splice(Number(button.dataset.removeProduct), 1);
      onChanged();
    });
  });
}

export function renderAnalytics(snapshot, analyticsMini, analyticsMeta) {
  analyticsMini.innerHTML = `<div class="metric"><span>Instagram</span><span>${snapshot.metrics.instagram.toLocaleString("pt-BR")}</span></div><div class="metric"><span>TikTok</span><span>${snapshot.metrics.tiktok.toLocaleString("pt-BR")}</span></div><div class="metric"><span>YouTube</span><span>${snapshot.metrics.youtube.toLocaleString("pt-BR")}</span></div><div class="metric"><span>Cliques Totais</span><span>${snapshot.metrics.totalClicks.toLocaleString("pt-BR")}</span></div>`;
  analyticsMeta.innerHTML = `<strong>Última atualização:</strong> ${formatDate(snapshot.updatedAt)}<br/><strong>Próxima atualização automática:</strong> ${formatDate(snapshot.updatedAt + THREE_DAYS_MS)}`;
}
