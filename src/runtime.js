const listeners = new Set();
const pending = new Map();

let context = window.NukloTheme?.context || null;
let localCart = readLocalCart();

function notify() {
  for (const listener of listeners) listener();
}

function requestId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocalCart() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem("als-theme-demo-cart") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalCart(items) {
  localCart = items;
  window.localStorage.setItem("als-theme-demo-cart", JSON.stringify(items));
  notify();
}

function postRequest(type, resultType, payload) {
  return new Promise((resolve, reject) => {
    const id = requestId();
    const timeout = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error("La solicitud superó el tiempo de espera."));
    }, 15000);
    pending.set(id, { resolve, reject, resultType, timeout });
    window.postMessage({ type, requestId: id, payload }, window.location.origin);
  });
}

window.addEventListener("message", (event) => {
  if (event.source !== window || event.origin !== window.location.origin) return;
  const message = event.data || {};
  if (message.type === "nuklo-template:context") {
    context = message.payload || null;
    notify();
    return;
  }
  const request = message.requestId ? pending.get(message.requestId) : null;
  if (!request || request.resultType !== message.type) return;
  window.clearTimeout(request.timeout);
  pending.delete(message.requestId);
  if (message.ok === false || message.payload?.success === false) {
    request.reject(new Error(message.payload?.error || "No se pudo completar la solicitud."));
  } else {
    request.resolve(message.payload);
  }
});

window.postMessage({ type: "nuklo-template:ready" }, window.location.origin);

export function subscribeRuntime(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRuntimeContext() {
  return context;
}

export function getRuntimeProducts() {
  const data = context?.data || {};
  const candidates = [
    data.products,
    data.collection?.products,
    data.catalog?.products,
    data.product ? [data.product] : null,
  ];
  return candidates.find(Array.isArray) || [];
}

export function getCartSnapshot() {
  const runtimeCart = context?.cart;
  const items = Array.isArray(runtimeCart?.items) ? runtimeCart.items : localCart;
  return {
    items,
    itemCount: items.reduce((total, item) => total + Number(item.quantity || 0), 0),
  };
}

function updateLocalCart(payload) {
  const items = [...localCart];
  if (payload.action === "clear") {
    writeLocalCart([]);
    return getCartSnapshot();
  }
  if (payload.action === "remove") {
    writeLocalCart(
      items.filter(
        (item) =>
          item.productId !== payload.productId ||
          (item.variantId || "") !== (payload.variantId || ""),
      ),
    );
    return getCartSnapshot();
  }
  const next = payload.item;
  const index = items.findIndex(
    (item) =>
      item.productId === next.productId &&
      (item.variantId || "") === (next.variantId || ""),
  );
  if (index < 0) items.push(next);
  else {
    items[index] = {
      ...next,
      quantity:
        payload.action === "add"
          ? Number(items[index].quantity || 0) + Number(next.quantity || 0)
          : Number(next.quantity || 0),
    };
  }
  writeLocalCart(items.filter((item) => item.quantity > 0));
  return getCartSnapshot();
}

export async function updateCart(payload) {
  if (window.NukloTheme?.updateCart) {
    const result = await postRequest(
      "nuklo-template:update-cart",
      "nuklo-template:cart-result",
      payload,
    );
    return result.cart;
  }
  return updateLocalCart(payload);
}

export async function submitInquiry(payload) {
  if (window.NukloTheme?.submitInquiry) {
    return postRequest(
      "nuklo-template:submit-inquiry",
      "nuklo-template:inquiry-result",
      payload,
    );
  }
  throw new Error("La consulta real se activa al importar y previsualizar este tema dentro de Nuklo.");
}

export async function createOrder(payload) {
  if (!window.NukloTheme?.createOrder) {
    throw new Error("El checkout real se activa al previsualizar este tema dentro de Nuklo.");
  }
  return postRequest(
    "nuklo-template:create-order",
    "nuklo-template:order-result",
    payload,
  );
}

export function formatMoney(amount, currency = "EUR", locale = "es") {
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
