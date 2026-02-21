export const STORAGE_KEY = "creator_ui_state_v1";
export const ANALYTICS_KEY = "creator_ui_analytics_v1";
export const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const initialState = {
  showInstagramFeed: true,
  links: [
    { label: "Lançamento Exclusivo", url: "https://exemplo.com/lancamento" },
    { label: "Instagram", url: "https://instagram.com" },
    { label: "YouTube", url: "https://youtube.com" },
    { label: "TikTok", url: "https://tiktok.com" }
  ],
  products: [
    {
      name: "Curso Premium",
      url: "https://afiliado.com/curso-premium",
      description: "Treinamento completo para criadores que querem vender todos os dias.",
      image: ""
    },
    {
      name: "Kit Creator",
      url: "https://afiliado.com/kit-creator",
      description: "Templates, checklists e recursos para acelerar sua produção.",
      image: ""
    }
  ]
};
