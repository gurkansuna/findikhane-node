# Fındıkhane — Node.js (vanilla) sürümü

Bu klasör, `src/Findikhane.Api` altındaki .NET sürümüyle aynı işlevleri gören, **framework kullanmayan** (sadece Node.js'in yerleşik `http` modülü) bir alternatif implementasyondur. `nextjs-app/` ve `nuxt-app/` klasörleriyle birlikte, aynı ürünün üç ayrı JavaScript/TypeScript çatısındaki yazımını oluşturur.

## Kapsam

- Ürün kataloğu, sepet doğrulaması (T.C. kimlik no, e-posta, GSM), sipariş oluşturma ve iyzico Checkout Form entegrasyonu .NET sürümüyle birebir aynı davranışı taşıyacak şekilde port edildi (`src/lib/`).
- Siparişler PostgreSQL'de saklanır (`src/lib/orderRepository.js`), dosya tabanlı depolama yok.
- Statik dosyalar (`public/`) .NET sürümünün `wwwroot/` klasörüyle aynı: aynı HTML/CSS/JS, aynı ürün görselleri, aynı fiyatlar.
- Ürün fiyatları artık HTML/JS içinde sabit yazılı değil; tek kaynaktan (`data/pricing-config.json`) hesaplanıp `GET /api/products` ile servis edilir (aşağıdaki "Fiyat güncelleme" bölümüne bakın).

## Yerel çalıştırma

```bash
cp .env.example .env   # değerleri doldurun
npm install
npm start               # veya: npm run dev (dosya değişikliklerini izler)
```

PostgreSQL'e ihtiyaç var; yoksa hızlıca `docker compose up postgres` ile ayağa kaldırabilirsiniz.

## Docker ile çalıştırma

```bash
docker compose up --build
```

`docker-compose.yml`, uygulamayı ve bir PostgreSQL 16 konteynerini birlikte ayağa kaldırır. `IYZICO_*` değişkenlerini ortamınıza göre `.env` dosyasından veya `docker compose` çağrısından geçebilirsiniz.

## Fiyat güncelleme (kural tabanlı otomatik fiyatlandırma)

Ürün fiyatları koda gömülü değildir; tek kaynak `data/pricing-config.json` dosyasıdır:

- `referansIcFindikFiyati`: TL/kg cinsinden, çiğ iç fındığın güncel piyasa fiyatı. Bunu siz elle güncellersiniz (ör. haftada bir, akakce/cerezpazari/hepsiburada gibi sitelerden veya kendi tedarikçi fiyatınızdan bakarak).
- `urunler.<id>.carpan`: Her ürünün, bu referans fiyata göre çarpanı (ör. kavrulmuş fındık için 1.3 = referansın %30 üzerinde). Nihai fiyat `Math.round(referansIcFindikFiyati × carpan)` ile otomatik hesaplanır.

Dosyayı kaydettiğiniz an yeni fiyatlar geçerli olur — kod değişikliği, derleme veya sunucu yeniden başlatma **gerekmez** (`src/lib/catalog.js` dosyayı her istekte, değişip değişmediğini `mtime` ile kontrol ederek okur). `GET /api/products` uç noktası güncel fiyatları döner; `public/script.js` sayfa açılışında bunu çağırıp ürün kartlarındaki fiyatları günceller. Sepet toplamı ve iyzico'ya giden tutar da her zaman bu dosyadan hesaplanan sunucu tarafı fiyata göre belirlenir — istemciden gelen fiyat hiçbir zaman güvenilmez.

Yeni bir ürün eklemek için `urunler` altına yeni bir id daha eklemeniz ve `public/index.html`'e karşılık gelen ürün kartını (aynı `data-product-id` ile) eklemeniz yeterlidir.

## Ortam değişkenleri

`.env.example` dosyasına bakın: `PORT`, `POSTGRES_CONNECTION_STRING`, `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL`, `PUBLIC_BASE_URL`.
