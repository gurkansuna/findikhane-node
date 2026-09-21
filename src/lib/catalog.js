// Ürün kataloğu: fiyat sunucuda sabittir; istemciden gelen fiyat asla güvenilmez.
// .NET portundaki Catalog/ProductCatalog.cs ile birebir aynı veriler.

export const CATALOG = {
  "giresun-secme": { id: "giresun-secme", name: "Ordu ve Giresun Seçme", price: 849, category: "Çiğ iç fındık" },
  "tas-firin-kavrulmus": { id: "tas-firin-kavrulmus", name: "Taş Fırın Kavrulmuş", price: 1099, category: "Kavrulmuş iç fındık" },
  "ipek-kivam": { id: "ipek-kivam", name: "İpek Kıvam", price: 849, category: "Katkısız fındık ezmesi" }
};

export function getProduct(id) {
  return Object.prototype.hasOwnProperty.call(CATALOG, id) ? CATALOG[id] : undefined;
}
