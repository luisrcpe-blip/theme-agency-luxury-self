import articles from "./generated/articles.json";
import properties from "./generated/properties.json";
import localizedContent from "./generated/localized-content.json";

const RELEASE_BASE_PATH = (() => {
  const value = String(import.meta.env.BASE_URL || "/");
  const pathname = new URL(value, "https://nuklo.invalid").pathname;
  return pathname === "/" ? "/" : `/${pathname.replace(/^\/+|\/+$/g, "")}/`;
})();

function sanitizeRichHtml(value) {
  if (typeof DOMParser === "undefined") return "";
  const allowedTags = new Set([
    "A", "AUDIO", "B", "BLOCKQUOTE", "BR", "DIV", "EM", "FIGCAPTION", "FIGURE",
    "H2", "H3", "H4", "HR", "IMG", "LI", "OL", "P", "SOURCE", "STRONG",
    "TABLE", "TBODY", "TD", "TH", "THEAD", "TR", "UL",
  ]);
  const removeWithContent = new Set(["EMBED", "FORM", "IFRAME", "OBJECT", "SCRIPT", "STYLE", "SVG"]);
  const allowedAttributes = {
    A: new Set(["href", "rel", "target"]),
    AUDIO: new Set(["controls", "preload", "src"]),
    IMG: new Set(["alt", "decoding", "height", "loading", "src", "width"]),
    SOURCE: new Set(["src", "type"]),
  };
  const document = new DOMParser().parseFromString(`<body>${String(value || "")}</body>`, "text/html");
  [...document.body.querySelectorAll("*")].reverse().forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      if (removeWithContent.has(element.tagName)) element.remove();
      else element.replaceWith(...element.childNodes);
      return;
    }
    const allowed = allowedAttributes[element.tagName] || new Set();
    for (const attribute of [...element.attributes]) {
      if (!allowed.has(attribute.name.toLowerCase())) element.removeAttribute(attribute.name);
    }
    for (const attribute of ["href", "src"]) {
      const target = element.getAttribute(attribute);
      if (!target) continue;
      try {
        const protocol = new URL(target, "https://agencyluxuryself.com/").protocol;
        const protocols = attribute === "href" ? ["http:", "https:", "mailto:", "tel:"] : ["http:", "https:"];
        if (!protocols.includes(protocol)) element.removeAttribute(attribute);
      } catch {
        element.removeAttribute(attribute);
      }
    }
    if (element.tagName === "A") {
      const target = element.getAttribute("target");
      if (target && !["_blank", "_self"].includes(target)) element.removeAttribute("target");
      if (element.getAttribute("target") === "_blank") element.setAttribute("rel", "noopener noreferrer");
    }
  });
  return document.body.innerHTML;
}

function cleanArticleHtml(value) {
  return sanitizeRichHtml(String(value || "")
    .replace(
      /<p><strong>(?:Prompt[^<]*|AI-Bild[^<]*|Invite pour l[’']image IA[^<]*)<\/strong><\/p>\s*<blockquote>[\s\S]*?<\/blockquote>/gi,
      "",
    )
    .replace(/\s+href=(["'])([^"']*)\1/gi, (match, quote, href) => {
      try {
        return ["http:", "https:", "mailto:", "tel:"].includes(new URL(href, "https://agencyluxuryself.com/").protocol) ? match : "";
      } catch {
        return "";
      }
    })
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/\bCoatrol\b/g, "Control"));
}

function decodeArticleText(value) {
  const textarea = typeof document !== "undefined" ? document.createElement("textarea") : null;
  if (textarea) {
    textarea.innerHTML = String(value || "");
    return textarea.value;
  }
  return String(value || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&");
}

function deriveArticleDescription(article, bodyHtml) {
  const paragraphs = [...String(bodyHtml || "").matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => decodeArticleText(match[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim())
    .filter((text) => text.length >= 90);
  const substantive = paragraphs.find((text) => !/(?:podcast|audio|puntos clave|key points|wichtigsten punkte|points clés|resumen|summary|zusammenfassung|résumé)/i.test(text));
  const description = substantive || article.description || article.title;
  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description;
}

const sourceArticles = articles.map((article) => {
  const bodyHtml = cleanArticleHtml(article.bodyHtml);
  return { ...article, bodyHtml, description: deriveArticleDescription(article, bodyHtml) };
});

const supplementalArticles = localizedContent.articles.flatMap((group) =>
  Object.values(group.localized).map((article) => {
    const bodyHtml = cleanArticleHtml(article.bodyHtml);
    return {
      ...article,
      bodyHtml,
      description: deriveArticleDescription(article, bodyHtml),
      id: `${group.sourceId}-${article.locale}`,
      translationKey: group.translationKey,
      sourceLocale: group.sourceLocale,
      sourcePath: group.sourcePath,
      sourceUrl: group.sourceUrl,
      publishedAt: group.sourcePublishedAt,
      author: group.sourceAuthor,
      publisher: group.sourcePublisher,
      category: null,
      heroImage: article.heroImage || group.heroImage,
    };
  }),
);
const allArticles = [...sourceArticles, ...supplementalArticles];
const propertyLocalizationBySlug = new Map(
  localizedContent.properties.map((property) => [property.sourceSlug, property.localized]),
);

export const LOCALES = ["es", "en", "de", "fr"];

export const routeSegments = {
  es: {
    properties: "propiedades",
    interiors: "diseno-interior",
    atelier: "atelier",
    services: "gestion-de-propiedades",
    about: "nosotros",
    blog: "blog",
    contact: "contacto",
    cart: "carrito",
    checkout: "finalizar-compra",
    order: "pedido",
    privacy: "politica-de-privacidad",
    cookies: "politica-de-cookies",
    legal: "aviso-legal",
  },
  en: {
    properties: "properties",
    interiors: "interior-design",
    atelier: "atelier",
    services: "property-management",
    about: "about-us",
    blog: "blog",
    contact: "contact",
    cart: "cart",
    checkout: "checkout",
    order: "order",
    privacy: "privacy-policy",
    cookies: "cookie-policy",
    legal: "legal-notice",
  },
  de: {
    properties: "immobilien",
    interiors: "innenarchitektur",
    atelier: "atelier",
    services: "immobilienverwaltung",
    about: "ueber-uns",
    blog: "blog",
    contact: "kontakt",
    cart: "warenkorb",
    checkout: "kasse",
    order: "bestellung",
    privacy: "datenschutz",
    cookies: "cookie-richtlinie",
    legal: "impressum",
  },
  fr: {
    properties: "proprietes",
    interiors: "design-interieur",
    atelier: "atelier",
    services: "gestion-immobiliere",
    about: "a-propos",
    blog: "blog",
    contact: "contact",
    cart: "panier",
    checkout: "paiement",
    order: "commande",
    privacy: "politique-de-confidentialite",
    cookies: "politique-de-cookies",
    legal: "mentions-legales",
  },
};

export const copy = {
  es: {
    localeName: "Español",
    nav: {
      properties: "Propiedades",
      interiors: "Interiores",
      atelier: "Atelier",
      services: "Servicios",
      about: "Nosotros",
      blog: "Blog",
    },
    consult: "Consultar",
    privateInquiry: "Consulta privada",
    heroTitle: "Una vida excepcional, cuidadosamente gestionada.",
    heroBody:
      "Un ecosistema de propiedades excepcionales, gestión integral, interiores a medida y Atelier. Todo lo que necesita, con un único estándar: el suyo.",
    discover: "Descubrir el universo",
    viewAtelier: "Ver Atelier",
    featuredProperty: "Propiedad exclusiva",
    propertyCategory: "Propiedades",
    atelierCategory: "Atelier",
    serviceCategory: "Servicio",
    viewProperty: "Ver propiedad",
    viewProduct: "Ver producto",
    moreInformation: "Más información",
    atelierSampleTitle: "Cuenco esculpido en travertino",
    atelierSampleMeta: "Pieza de muestra · Catálogo conectado a Nuklo",
    atelierSamplePrice: "Precio configurado en Nuklo",
    managementTitle: "Gestión integral de propiedades",
    managementMeta: "Gestión completa, mantenimiento, concierge y reporting.",
    propertiesTitle: "Propiedades seleccionadas con criterio",
    propertiesLead:
      "Una cartera real del sur de España, presentada con información clara y una consulta discreta.",
    all: "Todas",
    villas: "Villas",
    apartments: "Apartamentos",
    minPrice: "Precio mínimo",
    location: "Ubicación",
    clearFilters: "Limpiar filtros",
    results: "resultados",
    bedrooms: "Dormitorios",
    bathrooms: "Baños",
    area: "Superficie",
    lot: "Parcela",
    requestProperty: "Consultar esta propiedad",
    gallery: "Galería",
    details: "Detalles",
    atelierTitle: "Atelier, objetos para una vida bien vivida",
    atelierLead:
      "La plantilla recibe productos, variantes, precios y stock del catálogo activo de Nuklo.",
    previewProduct: "Vista de producto de muestra",
    unavailableDemo: "La compra se activa al conectar productos reales en Nuklo.",
    addToCart: "Añadir al carrito",
    cart: "Carrito",
    emptyCart: "Su carrito está vacío.",
    continueShopping: "Continuar en Atelier",
    checkout: "Finalizar compra",
    subtotal: "Subtotal",
    quantity: "Cantidad",
    remove: "Eliminar",
    checkoutTitle: "Datos de entrega",
    address: "Dirección",
    reference: "Indicaciones de entrega",
    orderTitle: "Pedido confirmado",
    orderPending: "Estamos procesando su pedido de forma segura.",
    blogTitle: "Journal",
    blogLead:
      "Criterio inmobiliario, gestión residencial y estilo de vida en el sur de España.",
    readArticle: "Leer artículo",
    latest: "Últimos artículos",
    published: "Publicado",
    by: "Por",
    related: "También puede interesarle",
    inquiryTitle: "Conversemos con discreción",
    inquiryBody:
      "Cuéntenos qué necesita. Su consulta quedará registrada en Nuklo y será atendida por el equipo de Agency Luxury Self.",
    name: "Nombre",
    surname: "Apellidos",
    email: "Correo electrónico",
    phone: "Teléfono",
    interest: "Interés",
    message: "Mensaje",
    send: "Enviar consulta",
    sending: "Enviando…",
    sent: "Gracias. Hemos recibido su consulta.",
    inquiryError: "No pudimos enviar la consulta. Inténtelo de nuevo.",
    close: "Cerrar",
    menu: "Menú",
    search: "Buscar",
    searchPlaceholder: "Buscar propiedades, servicios o artículos",
    noResults: "No encontramos resultados.",
    sourceLanguageNotice: "Este contenido se conserva en su idioma original.",
    footerClaim: "Real estate, lifestyle management, interiores y Atelier.",
    rights: "Todos los derechos reservados.",
    privacyConsent: "Acepto la política de privacidad.",
  },
  en: {
    localeName: "English",
    nav: {
      properties: "Properties",
      interiors: "Interiors",
      atelier: "Atelier",
      services: "Services",
      about: "About",
      blog: "Journal",
    },
    consult: "Enquire",
    privateInquiry: "Private enquiry",
    heroTitle: "An exceptional life, thoughtfully managed.",
    heroBody:
      "An ecosystem of exceptional properties, integrated management, tailored interiors and Atelier. Everything you need, held to one standard: yours.",
    discover: "Discover the universe",
    viewAtelier: "View Atelier",
    featuredProperty: "Exclusive property",
    propertyCategory: "Properties",
    atelierCategory: "Atelier",
    serviceCategory: "Service",
    viewProperty: "View property",
    viewProduct: "View product",
    moreInformation: "More information",
    atelierSampleTitle: "Sculpted travertine bowl",
    atelierSampleMeta: "Sample piece · Catalogue connected to Nuklo",
    atelierSamplePrice: "Price configured in Nuklo",
    managementTitle: "Integrated property management",
    managementMeta: "Complete management, maintenance, concierge and reporting.",
    propertiesTitle: "Properties selected with discernment",
    propertiesLead:
      "A real portfolio in southern Spain, presented with clear information and discreet enquiry.",
    all: "All",
    villas: "Villas",
    apartments: "Apartments",
    minPrice: "Minimum price",
    location: "Location",
    clearFilters: "Clear filters",
    results: "results",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    area: "Built area",
    lot: "Plot",
    requestProperty: "Enquire about this property",
    gallery: "Gallery",
    details: "Details",
    atelierTitle: "Atelier, objects for a life well lived",
    atelierLead:
      "The theme receives products, variants, prices and stock from the active Nuklo catalogue.",
    previewProduct: "Sample product preview",
    unavailableDemo: "Purchasing activates when real products are connected in Nuklo.",
    addToCart: "Add to cart",
    cart: "Cart",
    emptyCart: "Your cart is empty.",
    continueShopping: "Continue in Atelier",
    checkout: "Checkout",
    subtotal: "Subtotal",
    quantity: "Quantity",
    remove: "Remove",
    checkoutTitle: "Delivery details",
    address: "Address",
    reference: "Delivery instructions",
    orderTitle: "Order confirmed",
    orderPending: "We are processing your order securely.",
    blogTitle: "Journal",
    blogLead:
      "Real-estate insight, residential management and lifestyle in southern Spain.",
    readArticle: "Read article",
    latest: "Latest articles",
    published: "Published",
    by: "By",
    related: "You may also like",
    inquiryTitle: "Let us speak discreetly",
    inquiryBody:
      "Tell us what you need. Your enquiry will be recorded in Nuklo and handled by the Agency Luxury Self team.",
    name: "First name",
    surname: "Last name",
    email: "Email",
    phone: "Phone",
    interest: "Interest",
    message: "Message",
    send: "Send enquiry",
    sending: "Sending…",
    sent: "Thank you. We have received your enquiry.",
    inquiryError: "We could not send your enquiry. Please try again.",
    close: "Close",
    menu: "Menu",
    search: "Search",
    searchPlaceholder: "Search properties, services or articles",
    noResults: "No results found.",
    sourceLanguageNotice: "This content is preserved in its original language.",
    footerClaim: "Real estate, lifestyle management, interiors and Atelier.",
    rights: "All rights reserved.",
    privacyConsent: "I accept the privacy policy.",
  },
  de: {
    localeName: "Deutsch",
    nav: {
      properties: "Immobilien",
      interiors: "Interieur",
      atelier: "Atelier",
      services: "Services",
      about: "Über uns",
      blog: "Journal",
    },
    consult: "Anfragen",
    privateInquiry: "Private Anfrage",
    heroTitle: "Ein außergewöhnliches Leben, sorgfältig organisiert.",
    heroBody:
      "Ein Ökosystem aus außergewöhnlichen Immobilien, ganzheitlichem Management, maßgeschneiderten Interieurs und Atelier. Alles nach einem Maßstab: Ihrem.",
    discover: "Universum entdecken",
    viewAtelier: "Atelier ansehen",
    featuredProperty: "Exklusive Immobilie",
    propertyCategory: "Immobilien",
    atelierCategory: "Atelier",
    serviceCategory: "Service",
    viewProperty: "Immobilie ansehen",
    viewProduct: "Produkt ansehen",
    moreInformation: "Mehr erfahren",
    atelierSampleTitle: "Skulpturale Travertinschale",
    atelierSampleMeta: "Musterstück · Katalog mit Nuklo verbunden",
    atelierSamplePrice: "Preis in Nuklo konfiguriert",
    managementTitle: "Ganzheitliches Immobilienmanagement",
    managementMeta: "Management, Wartung, Concierge und Reporting aus einer Hand.",
    propertiesTitle: "Mit Bedacht ausgewählte Immobilien",
    propertiesLead:
      "Ein echtes Portfolio in Südspanien, mit klaren Informationen und diskreter Anfrage.",
    all: "Alle",
    villas: "Villen",
    apartments: "Apartments",
    minPrice: "Mindestpreis",
    location: "Lage",
    clearFilters: "Filter löschen",
    results: "Ergebnisse",
    bedrooms: "Schlafzimmer",
    bathrooms: "Bäder",
    area: "Wohnfläche",
    lot: "Grundstück",
    requestProperty: "Immobilie anfragen",
    gallery: "Galerie",
    details: "Details",
    atelierTitle: "Atelier, Objekte für ein erfülltes Leben",
    atelierLead:
      "Das Theme erhält Produkte, Varianten, Preise und Bestand aus dem aktiven Nuklo-Katalog.",
    previewProduct: "Musterprodukt",
    unavailableDemo: "Der Kauf wird mit echten, in Nuklo verbundenen Produkten aktiviert.",
    addToCart: "In den Warenkorb",
    cart: "Warenkorb",
    emptyCart: "Ihr Warenkorb ist leer.",
    continueShopping: "Weiter im Atelier",
    checkout: "Zur Kasse",
    subtotal: "Zwischensumme",
    quantity: "Menge",
    remove: "Entfernen",
    checkoutTitle: "Lieferdetails",
    address: "Adresse",
    reference: "Lieferhinweise",
    orderTitle: "Bestellung bestätigt",
    orderPending: "Ihre Bestellung wird sicher verarbeitet.",
    blogTitle: "Journal",
    blogLead: "Immobilienwissen, Wohnmanagement und Lifestyle in Südspanien.",
    readArticle: "Artikel lesen",
    latest: "Neueste Artikel",
    published: "Veröffentlicht",
    by: "Von",
    related: "Das könnte Sie auch interessieren",
    inquiryTitle: "Sprechen wir diskret",
    inquiryBody:
      "Erzählen Sie uns, was Sie benötigen. Ihre Anfrage wird in Nuklo erfasst und vom Agency-Luxury-Self-Team bearbeitet.",
    name: "Vorname",
    surname: "Nachname",
    email: "E-Mail",
    phone: "Telefon",
    interest: "Interesse",
    message: "Nachricht",
    send: "Anfrage senden",
    sending: "Wird gesendet…",
    sent: "Vielen Dank. Wir haben Ihre Anfrage erhalten.",
    inquiryError: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    close: "Schließen",
    menu: "Menü",
    search: "Suche",
    searchPlaceholder: "Immobilien, Services oder Artikel suchen",
    noResults: "Keine Ergebnisse gefunden.",
    sourceLanguageNotice: "Dieser Inhalt bleibt in seiner Originalsprache erhalten.",
    footerClaim: "Immobilien, Lifestyle Management, Interieur und Atelier.",
    rights: "Alle Rechte vorbehalten.",
    privacyConsent: "Ich akzeptiere die Datenschutzerklärung.",
  },
  fr: {
    localeName: "Français",
    nav: {
      properties: "Propriétés",
      interiors: "Intérieurs",
      atelier: "Atelier",
      services: "Services",
      about: "À propos",
      blog: "Journal",
    },
    consult: "Consulter",
    privateInquiry: "Demande privée",
    heroTitle: "Une vie d’exception, soigneusement orchestrée.",
    heroBody:
      "Un écosystème de propriétés d’exception, gestion intégrale, intérieurs sur mesure et Atelier. Tout ce dont vous avez besoin, selon un seul standard : le vôtre.",
    discover: "Découvrir l’univers",
    viewAtelier: "Voir l’Atelier",
    featuredProperty: "Propriété exclusive",
    propertyCategory: "Propriétés",
    atelierCategory: "Atelier",
    serviceCategory: "Service",
    viewProperty: "Voir la propriété",
    viewProduct: "Voir le produit",
    moreInformation: "Plus d’informations",
    atelierSampleTitle: "Coupe sculptée en travertin",
    atelierSampleMeta: "Pièce témoin · Catalogue connecté à Nuklo",
    atelierSamplePrice: "Prix configuré dans Nuklo",
    managementTitle: "Gestion immobilière intégrale",
    managementMeta: "Gestion, entretien, conciergerie et reporting complets.",
    propertiesTitle: "Des propriétés sélectionnées avec discernement",
    propertiesLead:
      "Un portefeuille réel dans le sud de l’Espagne, présenté clairement et avec une consultation discrète.",
    all: "Toutes",
    villas: "Villas",
    apartments: "Appartements",
    minPrice: "Prix minimum",
    location: "Localisation",
    clearFilters: "Effacer les filtres",
    results: "résultats",
    bedrooms: "Chambres",
    bathrooms: "Salles de bains",
    area: "Surface",
    lot: "Terrain",
    requestProperty: "Demander cette propriété",
    gallery: "Galerie",
    details: "Détails",
    atelierTitle: "Atelier, des objets pour une vie bien vécue",
    atelierLead:
      "Le thème reçoit les produits, variantes, prix et stocks du catalogue Nuklo actif.",
    previewProduct: "Aperçu d’un produit témoin",
    unavailableDemo: "L’achat s’active lorsque des produits réels sont connectés dans Nuklo.",
    addToCart: "Ajouter au panier",
    cart: "Panier",
    emptyCart: "Votre panier est vide.",
    continueShopping: "Continuer dans l’Atelier",
    checkout: "Commander",
    subtotal: "Sous-total",
    quantity: "Quantité",
    remove: "Supprimer",
    checkoutTitle: "Informations de livraison",
    address: "Adresse",
    reference: "Instructions de livraison",
    orderTitle: "Commande confirmée",
    orderPending: "Votre commande est traitée en toute sécurité.",
    blogTitle: "Journal",
    blogLead: "Immobilier, gestion résidentielle et art de vivre dans le sud de l’Espagne.",
    readArticle: "Lire l’article",
    latest: "Derniers articles",
    published: "Publié",
    by: "Par",
    related: "À découvrir également",
    inquiryTitle: "Échangeons en toute discrétion",
    inquiryBody:
      "Dites-nous ce dont vous avez besoin. Votre demande sera enregistrée dans Nuklo et traitée par l’équipe Agency Luxury Self.",
    name: "Prénom",
    surname: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    interest: "Intérêt",
    message: "Message",
    send: "Envoyer la demande",
    sending: "Envoi…",
    sent: "Merci. Nous avons bien reçu votre demande.",
    inquiryError: "Votre demande n’a pas pu être envoyée. Veuillez réessayer.",
    close: "Fermer",
    menu: "Menu",
    search: "Recherche",
    searchPlaceholder: "Rechercher propriétés, services ou articles",
    noResults: "Aucun résultat trouvé.",
    sourceLanguageNotice: "Ce contenu est conservé dans sa langue d’origine.",
    footerClaim: "Immobilier, lifestyle management, intérieurs et Atelier.",
    rights: "Tous droits réservés.",
    privacyConsent: "J’accepte la politique de confidentialité.",
  },
};

export const navKeys = ["properties", "interiors", "atelier", "services"];
export const secondaryNavKeys = ["about", "blog"];

export function hrefFor(locale, key, slug) {
  const routePath = key === "home"
    ? `/${locale}/`
    : `/${locale}/${routeSegments[locale][key]}/${slug ? `${slug}/` : ""}`;
  if (
    RELEASE_BASE_PATH !== "/" &&
    typeof window !== "undefined" &&
    (window.location.pathname === RELEASE_BASE_PATH.slice(0, -1) || window.location.pathname.startsWith(RELEASE_BASE_PATH))
  ) {
    return `${RELEASE_BASE_PATH.slice(0, -1)}${routePath}`;
  }
  return routePath;
}

export function resolveRoute(pathname = window.location.pathname) {
  if (RELEASE_BASE_PATH !== "/" && pathname.startsWith(RELEASE_BASE_PATH)) {
    pathname = `/${pathname.slice(RELEASE_BASE_PATH.length)}`;
  } else if (RELEASE_BASE_PATH !== "/" && pathname === RELEASE_BASE_PATH.slice(0, -1)) {
    pathname = "/";
  }
  const parts = pathname.split("/").filter(Boolean);
  const locale = LOCALES.includes(parts[0]) ? parts.shift() : "es";
  if (parts.length === 0) return { locale, page: "home" };
  const segment = parts[0];
  const segments = routeSegments[locale];
  const page = Object.entries(segments).find(([, value]) => value === segment)?.[0];
  if (!page) return { locale, page: "notFound" };
  if (parts.length === 1) return { locale, page };
  if (page === "properties") return { locale, page: "property", slug: parts[1] };
  if (page === "atelier") return { locale, page: "product", slug: parts[1] };
  if (page === "blog") return { locale, page: "article", slug: parts[1] };
  if (page === "order") return { locale, page: "order", token: parts[1] };
  return { locale, page: "notFound" };
}

export function localizedHref(pathname, targetLocale) {
  const route = resolveRoute(pathname);
  if (route.page === "article") {
    const current = allArticles.find(
      (article) => article.locale === route.locale && article.slug === route.slug,
    );
    const translated = current
      ? allArticles.find(
          (article) =>
            article.translationKey === current.translationKey &&
            article.locale === targetLocale,
        )
      : null;
    return translated
      ? hrefFor(targetLocale, "blog", translated.slug)
      : hrefFor(targetLocale, "blog");
  }
  if (["property", "product"].includes(route.page)) {
    const key = route.page === "property" ? "properties" : "atelier";
    return hrefFor(targetLocale, key, route.slug);
  }
  if (route.page === "order") return hrefFor(targetLocale, "order", route.token);
  if (routeSegments[targetLocale][route.page]) return hrefFor(targetLocale, route.page);
  return hrefFor(targetLocale, "home");
}

export function articlesForLocale(locale) {
  return allArticles.filter((article) => article.locale === locale);
}

export function articleForRoute(locale, slug) {
  return allArticles.find((article) => article.locale === locale && article.slug === slug) || null;
}

export function propertiesForLocale(locale) {
  return properties.map((property) => {
    const localized = propertyLocalizationBySlug.get(property.slug)?.[locale];
    const result = localized ? { ...property, ...localized, slug: property.slug } : property;
    return { ...result, bodyHtml: sanitizeRichHtml(result.bodyHtml) };
  });
}

export function propertyForRoute(slug, locale = "es") {
  return propertiesForLocale(locale).find((property) => property.slug === slug) || null;
}

export function legalPageContent(page, locale) {
  const key = page === "legal" ? "legal-notice" : page;
  const content = localizedContent.legalPages.find((item) => item.key === key)?.localized?.[locale] || null;
  return content ? { ...content, bodyHtml: sanitizeRichHtml(content.bodyHtml) } : null;
}

export { allArticles as articles, properties };
