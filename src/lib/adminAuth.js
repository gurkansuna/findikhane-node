// Yönetim paneli (/admin ve /api/admin/*) için basit HTTP Basic Auth.
// Kullanıcı adı/şifre ortam değişkenlerinden (ADMIN_USERNAME, ADMIN_PASSWORD)
// okunur — iyzico anahtarlarıyla aynı yaklaşım. Panel MUTLAKA HTTPS arkasında
// çalıştırılmalı; aksi halde kimlik bilgileri düz metin olarak iletilir.

import crypto from "node:crypto";

export function isAdminConfigured(options) {
  return Boolean(options.username && options.password);
}

function safeEqual(a, b) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function checkAdminAuth(req, options) {
  if (!isAdminConfigured(options)) return false;

  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;

  let decoded;
  try {
    decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  return safeEqual(username, options.username) && safeEqual(password, options.password);
}
