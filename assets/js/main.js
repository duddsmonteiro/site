import { loadState, persistState } from "./storage.js";
import { ensureAnalytics, buildAnalytics, saveAnalytics } from "./analytics.js";
import {
  setActiveView,
  renderDragCards,
  renderLinkEditor,
  renderDashboardLinks,
  renderBioLinks,
  renderInstagramFeed,
  renderProducts,
  renderAnalytics
} from "./ui.js";

const state = loadState();

const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const dragList = document.getElementById("dragList");
const dashboardPreviewLinks = document.getElementById("dashboardPreviewLinks");
const bioLinks = document.getElementById("bioLinks");
const linkEditorList = document.getElementById("linkEditorList");
const productList = document.getElementById("productList");
const productQuickList = document.getElementById("productQuickList");
const analyticsMini = document.getElementById("analyticsMini");
const analyticsMeta = document.getElementById("analyticsMeta");
const landingLoginBtn = document.getElementById("landingLoginBtn");
const landing = document.querySelector(".landing");
const toggleInstagramFeed = document.getElementById("toggleInstagramFeed");
const instagramFeedWidget = document.getElementById("instagramFeedWidget");

tabs.forEach((tab) => tab.addEventListener("click", () => setActiveView(tab.dataset.view, tabs, views)));
document.querySelectorAll("[data-open-tab]").forEach((button) => {
  button.addEventListener("click", () => setActiveView(button.dataset.openTab, tabs, views));
});

if (landingLoginBtn) {
  landingLoginBtn.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveView("login", tabs, views);
    document.querySelector(".shell")?.scrollIntoView({ behavior: "smooth" });
  });
}

setupLandingCursorLights();

if (toggleInstagramFeed) {
  toggleInstagramFeed.checked = state.showInstagramFeed;
  toggleInstagramFeed.addEventListener("change", () => {
    state.showInstagramFeed = toggleInstagramFeed.checked;
    persistAndRender();
  });
}

document.getElementById("addLinkBtn").addEventListener("click", () => {
  const labelInput = document.getElementById("newLinkLabel");
  const urlInput = document.getElementById("newLinkUrl");
  const label = labelInput.value.trim();
  const url = urlInput.value.trim();
  if (!label || !url) return;

  state.links.push({ label, url });
  labelInput.value = "";
  urlInput.value = "";
  persistAndRender();
});

document.getElementById("productForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const nameInput = document.getElementById("productName");
  const urlInput = document.getElementById("productUrl");
  const descriptionInput = document.getElementById("productDescription");
  const imageInput = document.getElementById("productImage");

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();
  const description = descriptionInput.value.trim();
  if (!name || !url || !description) return;

  const image = imageInput.files && imageInput.files[0]
    ? await fileToDataUrl(imageInput.files[0])
    : "";

  state.products.push({ name, url, description, image });
  nameInput.value = "";
  urlInput.value = "";
  descriptionInput.value = "";
  imageInput.value = "";
  persistAndRender();
});

document.getElementById("forceAnalyticsBtn").addEventListener("click", () => {
  const next = buildAnalytics();
  saveAnalytics(next);
  renderAnalytics(next, analyticsMini, analyticsMeta);
});

function persistAndRender() {
  persistState(state);
  renderAll();
}

function renderAll() {
  renderDragCards(state, dragList, persistAndRender);
  renderLinkEditor(state, linkEditorList, (needsPersist) => {
    if (needsPersist) {
      persistAndRender();
      return;
    }
    renderDragCards(state, dragList, persistAndRender);
    renderDashboardLinks(state, dashboardPreviewLinks);
    renderBioLinks(state, bioLinks);
  });
  renderDashboardLinks(state, dashboardPreviewLinks);
  renderBioLinks(state, bioLinks);
  renderInstagramFeed(state, instagramFeedWidget);
  renderProducts(state, productList, productQuickList, persistAndRender);
}

renderAll();
renderAnalytics(ensureAnalytics(), analyticsMini, analyticsMeta);

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function setupLandingCursorLights() {
  if (!landing) return;
  const isDesktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isDesktopPointer) return;

  let frameId = null;
  let x = 0;
  let y = 0;

  const render = () => {
    landing.style.setProperty("--mx", `${x}px`);
    landing.style.setProperty("--my", `${y}px`);
    frameId = null;
  };

  landing.addEventListener("pointermove", (event) => {
    const rect = landing.getBoundingClientRect();
    x = event.clientX - (rect.left + rect.width / 2);
    y = event.clientY - (rect.top + rect.height / 2);
    if (!frameId) frameId = requestAnimationFrame(render);
  });

  landing.addEventListener("pointerleave", () => {
    x = 0;
    y = 0;
    if (!frameId) frameId = requestAnimationFrame(render);
  });
}
