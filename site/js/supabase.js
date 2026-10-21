/* ============================================================
   supabase.js — طبقة اتصال خفيفة بـ Supabase (مشتركة مع لوحة الإدارة)
   ============================================================ */
async function sbFetch(path, { method = "GET", body, token, headers = {}, raw = false } = {}) {
  const h = { apikey: SUPABASE_KEY, Authorization: "Bearer " + (token || SUPABASE_KEY), ...headers };
  if (body !== undefined && !raw) h["Content-Type"] = "application/json";
  const res = await fetch(SUPABASE_URL + path, {
    method, headers: h, body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) {
    const m = (data && (data.message || data.msg || data.error_description || data.error)) || res.statusText;
    throw new Error(m);
  }
  return data;
}
