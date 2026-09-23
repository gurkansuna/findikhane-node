// Ürün kataloğu: nihai fiyat sunucuda hesaplanır; istemciden gelen fiyat asla güvenilmez.
// Fiyatların kaynağı data/pricing-config.json'daki tek referans değer + ürün başına
// sabit çarpandır ("kural tabanlı otomatik fiyatlandırma"). O dosyayı güncellemek
// yeterlidir; kod değişikliği ya da sunucu yeniden başlatma gerekmez — her istek
// dosyanın o anki içeriğini (değişmediyse önbellekten) kullanır.

import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "..", "..", "data", "pricing-config.json");

let cache = null; // { mtimeMs, catalog }

function computePrice(referansFiyat, carpan) {
  const price = Math.round(referansFiyat * carpan);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("pricing-config.json içindeki fiyat/çarpan değerleri geçersiz.");
  }
  return price;
}

function buildCatalogFromConfig(config) {
  const referansFiyat = Number(config.referansIcFindikFiyati);
  if (!Number.isFinite(referansFiyat) || referansFiyat <= 0) {
    throw new Error("pricing-config.json içindeki referansIcFindikFiyati geçersiz.");
  }

  const catalog = {};
  for (const [id, urun] of Object.entries(config.urunler || {})) {
    const carpan = Number(urun.carpan);
    if (!Number.isFinite(carpan) || carpan <= 0) {
      throw new Error(`pricing-config.json içindeki "${id}" ürününün çarpanı geçersiz.`);
    }
    catalog[id] = {
      id,
      name: urun.ad,
      price: computePrice(referansFiyat, carpan),
      category: urun.kategori
    };
  }
  return catalog;
}

function loadCatalog() {
  const stat = statSync(CONFIG_PATH);
  if (cache && cache.mtimeMs === stat.mtimeMs) {
    return cache.catalog;
  }

  const raw = readFileSync(CONFIG_PATH, "utf8");
  const config = JSON.parse(raw);
  const catalog = buildCatalogFromConfig(config);
  cache = { mtimeMs: stat.mtimeMs, catalog };
  return catalog;
}

export function getCatalog() {
  return loadCatalog();
}

export function getProduct(id) {
  const catalog = loadCatalog();
  return Object.prototype.hasOwnProperty.call(catalog, id) ? catalog[id] : undefined;
}
