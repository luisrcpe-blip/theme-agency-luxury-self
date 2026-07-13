export const PROPERTY_LOCALES = ["es", "en", "de", "fr"];

const TYPE_LABELS = {
  villa: {
    es: "Villa",
    en: "Villa",
    de: "Villa",
    fr: "Villa",
  },
  apartment: {
    es: "Apartamento",
    en: "Apartment",
    de: "Wohnung",
    fr: "Appartement",
  },
  penthouse: {
    es: "Ático",
    en: "Penthouse",
    de: "Penthouse",
    fr: "Penthouse",
  },
};

const STATUS_LABELS = {
  "for-sale": {
    es: "En venta",
    en: "For sale",
    de: "Zum Verkauf",
    fr: "À vendre",
  },
};

function normalizedLabel(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function propertyTypeToken(value) {
  const normalized = normalizedLabel(value);
  if (normalized.includes("villa")) return "villa";
  if (normalized.includes("penthouse") || normalized.includes("atico")) return "penthouse";
  if (normalized.includes("apart") || normalized.includes("wohnung")) return "apartment";
  return null;
}

function propertyStatusToken(value) {
  const normalized = normalizedLabel(value);
  if (["en venta", "for sale", "zum verkauf", "a vendre"].includes(normalized)) return "for-sale";
  return null;
}

export function localizePropertyFacts(property, locale) {
  const resolvedLocale = PROPERTY_LOCALES.includes(locale) ? locale : "es";
  const typeToken = propertyTypeToken(property?.type);
  const statusToken = propertyStatusToken(property?.status);

  return {
    typeKey: typeToken === "villa" ? "villa" : typeToken ? "apartment" : null,
    type: typeToken ? TYPE_LABELS[typeToken][resolvedLocale] : property?.type || "",
    statusKey: statusToken,
    status: statusToken ? STATUS_LABELS[statusToken][resolvedLocale] : property?.status || "",
  };
}

export function propertyMatchesType(property, selectedType) {
  return selectedType === "all" || property?.typeKey === selectedType;
}
