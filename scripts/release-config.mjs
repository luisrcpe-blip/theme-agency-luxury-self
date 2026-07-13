import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

export const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const OUT_DIR = resolve(PROJECT_ROOT, "out");
export const DIST_DIR = resolve(PROJECT_ROOT, "dist");
export const MANIFEST_FILE = "nuklo.template.json";
export const INTEGRITY_FILE = "integrity.json";

export const LOCALES = ["es", "en", "de", "fr"];
export const LOCALE_DEFINITIONS = [
  { code: "es", prefix: "/es", hreflang: "es" },
  { code: "en", prefix: "/en", hreflang: "en" },
  { code: "de", prefix: "/de", hreflang: "de" },
  { code: "fr", prefix: "/fr", hreflang: "fr" },
];

export const SEGMENTS = {
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

const SEO = {
  home: {
    es: ["Agency Luxury Self | Real estate y gestión", "Propiedades excepcionales, gestión integral, interiores a medida y Atelier en el sur de España."],
    en: ["Agency Luxury Self | Real estate and management", "Exceptional properties, integrated management, tailored interiors and Atelier in southern Spain."],
    de: ["Agency Luxury Self | Immobilien und Management", "Außergewöhnliche Immobilien, ganzheitliches Management, Interieur und Atelier in Südspanien."],
    fr: ["Agency Luxury Self | Immobilier et gestion", "Propriétés d’exception, gestion intégrale, intérieurs sur mesure et Atelier dans le sud de l’Espagne."],
  },
  properties: {
    es: ["Propiedades seleccionadas | Agency Luxury Self", "Villas y apartamentos seleccionados en Sotogrande, Marbella y la Costa del Sol, con consulta privada."],
    en: ["Selected properties | Agency Luxury Self", "Selected villas and apartments in Sotogrande, Marbella and the Costa del Sol, with private enquiry."],
    de: ["Ausgewählte Immobilien | Agency Luxury Self", "Ausgewählte Villen und Apartments in Sotogrande, Marbella und an der Costa del Sol."],
    fr: ["Propriétés sélectionnées | Agency Luxury Self", "Villas et appartements sélectionnés à Sotogrande, Marbella et sur la Costa del Sol."],
  },
  interiors: {
    es: ["Diseño de interiores | Agency Luxury Self", "Interiorismo a medida para elevar la experiencia, la coherencia estética y el valor de cada propiedad."],
    en: ["Interior design | Agency Luxury Self", "Tailored interior design that elevates the experience, aesthetic coherence and value of each property."],
    de: ["Innenarchitektur | Agency Luxury Self", "Maßgeschneiderte Innenarchitektur für Ästhetik, Wohnqualität und nachhaltigen Immobilienwert."],
    fr: ["Design intérieur | Agency Luxury Self", "Des intérieurs sur mesure pour l’expérience, la cohérence esthétique et la valeur de chaque propriété."],
  },
  atelier: {
    es: ["Atelier | Agency Luxury Self", "Objetos y piezas seleccionadas para una vida bien vivida, conectados al catálogo comercial de Nuklo."],
    en: ["Atelier | Agency Luxury Self", "Selected objects for a life well lived, connected to the active Nuklo commerce catalogue."],
    de: ["Atelier | Agency Luxury Self", "Ausgewählte Objekte für ein erfülltes Leben, verbunden mit dem aktiven Nuklo-Katalog."],
    fr: ["Atelier | Agency Luxury Self", "Des objets sélectionnés pour un art de vivre, reliés au catalogue commercial actif de Nuklo."],
  },
  services: {
    es: ["Gestión de propiedades | Agency Luxury Self", "Gestión residencial, mantenimiento, concierge y reporting para propietarios en el sur de España."],
    en: ["Property management | Agency Luxury Self", "Residential management, maintenance, concierge and reporting for owners in southern Spain."],
    de: ["Immobilienverwaltung | Agency Luxury Self", "Wohnmanagement, Instandhaltung, Concierge und Reporting für Eigentümer in Südspanien."],
    fr: ["Gestion immobilière | Agency Luxury Self", "Gestion résidentielle, entretien, conciergerie et reporting pour les propriétaires du sud de l’Espagne."],
  },
  about: {
    es: ["Nosotros | Agency Luxury Self", "Conozca el criterio, la discreción y la visión integral detrás de Agency Luxury Self."],
    en: ["About us | Agency Luxury Self", "Discover the discernment, discretion and integrated vision behind Agency Luxury Self."],
    de: ["Über uns | Agency Luxury Self", "Lernen Sie Anspruch, Diskretion und die ganzheitliche Vision von Agency Luxury Self kennen."],
    fr: ["À propos | Agency Luxury Self", "Découvrez le discernement, la discrétion et la vision intégrale d’Agency Luxury Self."],
  },
  blog: {
    es: ["Journal | Agency Luxury Self", "Criterio inmobiliario, gestión residencial y estilo de vida en el sur de España."],
    en: ["Journal | Agency Luxury Self", "Real-estate insight, residential management and lifestyle in southern Spain."],
    de: ["Journal | Agency Luxury Self", "Immobilienwissen, Wohnmanagement und Lifestyle in Südspanien."],
    fr: ["Journal | Agency Luxury Self", "Immobilier, gestion résidentielle et art de vivre dans le sud de l’Espagne."],
  },
  contact: {
    es: ["Contacto privado | Agency Luxury Self", "Converse de forma privada con Agency Luxury Self sobre propiedades, gestión, interiores o Atelier."],
    en: ["Private contact | Agency Luxury Self", "Speak privately with Agency Luxury Self about properties, management, interiors or Atelier."],
    de: ["Private Anfrage | Agency Luxury Self", "Kontaktieren Sie Agency Luxury Self diskret zu Immobilien, Management, Interieur oder Atelier."],
    fr: ["Contact privé | Agency Luxury Self", "Échangez en toute discrétion avec Agency Luxury Self sur l’immobilier, la gestion, les intérieurs ou l’Atelier."],
  },
  privacy: {
    es: ["Política de privacidad | Agency Luxury Self", "Información sobre el tratamiento y la protección de datos personales en Agency Luxury Self."],
    en: ["Privacy policy | Agency Luxury Self", "Information about personal-data processing and protection at Agency Luxury Self."],
    de: ["Datenschutz | Agency Luxury Self", "Informationen zur Verarbeitung und zum Schutz personenbezogener Daten bei Agency Luxury Self."],
    fr: ["Politique de confidentialité | Agency Luxury Self", "Informations sur le traitement et la protection des données personnelles par Agency Luxury Self."],
  },
  cookies: {
    es: ["Política de cookies | Agency Luxury Self", "Información sobre las cookies y tecnologías similares utilizadas por Agency Luxury Self."],
    en: ["Cookie policy | Agency Luxury Self", "Information about cookies and similar technologies used by Agency Luxury Self."],
    de: ["Cookie-Richtlinie | Agency Luxury Self", "Informationen über Cookies und ähnliche Technologien von Agency Luxury Self."],
    fr: ["Politique de cookies | Agency Luxury Self", "Informations sur les cookies et technologies similaires utilisés par Agency Luxury Self."],
  },
  legal: {
    es: ["Aviso legal | Agency Luxury Self", "Información legal y condiciones de uso del sitio web de Agency Luxury Self."],
    en: ["Legal notice | Agency Luxury Self", "Legal information and terms of use for the Agency Luxury Self website."],
    de: ["Impressum | Agency Luxury Self", "Rechtliche Informationen und Nutzungsbedingungen der Website von Agency Luxury Self."],
    fr: ["Mentions légales | Agency Luxury Self", "Informations légales et conditions d’utilisation du site Agency Luxury Self."],
  },
  cart: {
    es: ["Carrito | Agency Luxury Self", "Revise las piezas seleccionadas antes de finalizar la compra."],
    en: ["Cart | Agency Luxury Self", "Review your selected pieces before checkout."],
    de: ["Warenkorb | Agency Luxury Self", "Prüfen Sie Ihre Auswahl vor dem Checkout."],
    fr: ["Panier | Agency Luxury Self", "Vérifiez les pièces sélectionnées avant le paiement."],
  },
  checkout: {
    es: ["Finalizar compra | Agency Luxury Self", "Complete de forma segura los datos de entrega de su pedido."],
    en: ["Checkout | Agency Luxury Self", "Securely complete the delivery details for your order."],
    de: ["Kasse | Agency Luxury Self", "Vervollständigen Sie sicher die Lieferdaten Ihrer Bestellung."],
    fr: ["Paiement | Agency Luxury Self", "Complétez en toute sécurité les informations de livraison de votre commande."],
  },
  order: {
    es: ["Estado del pedido | Agency Luxury Self", "Consulte de forma privada el estado de su pedido."],
    en: ["Order status | Agency Luxury Self", "Privately review the status of your order."],
    de: ["Bestellstatus | Agency Luxury Self", "Rufen Sie den Status Ihrer Bestellung privat ab."],
    fr: ["État de la commande | Agency Luxury Self", "Consultez de façon privée l’état de votre commande."],
  },
};

const STATIC_GROUPS = [
  { key: "shop.home", page: "home", surface: "SHOP_HOME", runtimeKind: "surface" },
  { key: "content.properties", page: "properties", segment: "properties", surface: "CONTENT_PAGE", runtimeKind: "surface" },
  { key: "content.interiors", page: "interiors", segment: "interiors", surface: "CONTENT_PAGE", runtimeKind: "surface" },
  { key: "shop.collection", page: "atelier", segment: "atelier", surface: "SHOP_COLLECTION", runtimeKind: "surface" },
  { key: "content.services", page: "services", segment: "services", surface: "CONTENT_PAGE", runtimeKind: "surface" },
  { key: "content.about", page: "about", segment: "about", surface: "CONTENT_PAGE", runtimeKind: "surface" },
  { key: "content.blog", page: "blog", segment: "blog", surface: "CONTENT_PAGE", runtimeKind: "surface" },
  { key: "content.contact", page: "contact", segment: "contact", surface: "CONTENT_PAGE", runtimeKind: "surface" },
  { key: "content.privacy", page: "privacy", segment: "privacy", surface: "CONTENT_PAGE", runtimeKind: "surface" },
  { key: "content.cookies", page: "cookies", segment: "cookies", surface: "CONTENT_PAGE", runtimeKind: "surface" },
  { key: "content.legal", page: "legal", segment: "legal", surface: "CONTENT_PAGE", runtimeKind: "surface" },
  { key: "commerce.cart", page: "cart", segment: "cart", surface: "SHOP_HOME", runtimeKind: "cart", private: true },
  { key: "commerce.checkout", page: "checkout", segment: "checkout", surface: "SHOP_HOME", runtimeKind: "checkout", private: true },
];

const DYNAMIC_GROUPS = [
  { key: "shop.product", page: "atelier", segment: "atelier", param: ":slug", surface: "SHOP_PRODUCT", runtimeKind: "surface" },
  { key: "commerce.order", page: "order", segment: "order", param: ":token", surface: "SHOP_HOME", runtimeKind: "order", private: true },
];

function cleanPath(pathname) {
  const value = String(pathname || "").trim();
  if (value === "/") return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

function joinRoute(...segments) {
  return cleanPath(segments.filter(Boolean).join("/"));
}

function routeFile(pathname, fallbackName) {
  if (pathname.includes(":")) return `templates/${fallbackName}.html`;
  const trimmed = cleanPath(pathname).replace(/^\/+|\/+$/g, "");
  return trimmed ? `${trimmed}/index.html` : "index.html";
}

function absoluteAsset(baseUrl, path) {
  return new URL(String(path || "").replace(/^\/+/, ""), baseUrl).toString();
}

function safeDescription(value, fallback) {
  const text = String(value || fallback || "").replace(/\s+/g, " ").trim();
  return text.length > 165 ? `${text.slice(0, 162).trimEnd()}…` : text;
}

function safeSeoTitle(value) {
  const brand = " | Agency Luxury Self";
  const title = String(value || "Agency Luxury Self").replace(/\s+/g, " ").trim();
  const available = 70 - brand.length;
  const concise = title.length > available ? `${title.slice(0, available - 1).trimEnd()}…` : title;
  return `${concise}${brand}`;
}

function decodeArticleText(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function articleDescription(article) {
  const paragraphs = [...String(article.bodyHtml || "").matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => decodeArticleText(match[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim())
    .filter((text) => text.length >= 90);
  const substantive = paragraphs.find((text) => !/(?:podcast|audio|puntos clave|key points|wichtigsten punkte|points clés|resumen|summary|zusammenfassung|résumé)/i.test(text));
  return safeDescription(substantive || article.description, article.title);
}

function sanitizeRichHtml(value) {
  const allowedTags = new Set([
    "a", "audio", "b", "blockquote", "br", "div", "em", "figcaption", "figure",
    "h2", "h3", "h4", "hr", "img", "li", "ol", "p", "source", "strong",
    "table", "tbody", "td", "th", "thead", "tr", "ul",
  ]);
  const removeWithContent = new Set(["embed", "form", "iframe", "object", "script", "style", "svg"]);
  const allowedAttributes = {
    a: new Set(["href", "rel", "target"]),
    audio: new Set(["controls", "preload", "src"]),
    img: new Set(["alt", "decoding", "height", "loading", "src", "width"]),
    source: new Set(["src", "type"]),
  };
  const $ = load(`<main id="nuklo-rich-root">${String(value || "")}</main>`, null, false);
  const root = $("#nuklo-rich-root");
  root.find("*").toArray().reverse().forEach((element) => {
    const tag = element.tagName?.toLowerCase();
    const node = $(element);
    if (!allowedTags.has(tag)) {
      if (removeWithContent.has(tag)) node.remove();
      else node.replaceWith(node.contents());
      return;
    }
    const allowed = allowedAttributes[tag] || new Set();
    for (const attribute of Object.keys(element.attribs || {})) {
      if (!allowed.has(attribute.toLowerCase())) node.removeAttr(attribute);
    }
    for (const attribute of ["href", "src"]) {
      const target = node.attr(attribute);
      if (!target) continue;
      try {
        const protocol = new URL(target, "https://agencyluxuryself.com/").protocol;
        const protocols = attribute === "href" ? ["http:", "https:", "mailto:", "tel:"] : ["http:", "https:"];
        if (!protocols.includes(protocol)) node.removeAttr(attribute);
      } catch {
        node.removeAttr(attribute);
      }
    }
    if (tag === "a") {
      const target = node.attr("target");
      if (target && !["_blank", "_self"].includes(target)) node.removeAttr("target");
      if (node.attr("target") === "_blank") node.attr("rel", "noopener noreferrer");
    }
  });
  return root.html() || "";
}

function cleanMigratedHtml(value, baseUrl) {
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
    .replace(/\bCoatrol\b/g, "Control"))
    .replace(/(["'])\/assets\//g, `$1${baseUrl}assets/`);
}

function localizedPropertyDescription(locale, property) {
  const place = property.location || property.title;
  const templates = {
    es: `Descubra ${property.title}, una propiedad seleccionada en ${place}. Información real y consulta privada con Agency Luxury Self.`,
    en: `Explore ${property.title}, a selected property in ${place}. Verified details and private enquiry with Agency Luxury Self.`,
    de: `Entdecken Sie ${property.title}, eine ausgewählte Immobilie in ${place}. Reale Angaben und private Anfrage bei Agency Luxury Self.`,
    fr: `Découvrez ${property.title}, une propriété sélectionnée à ${place}. Informations réelles et demande privée auprès d’Agency Luxury Self.`,
  };
  return safeDescription(templates[locale]);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function loadReleaseSource() {
  const [release, sourceArticles, properties, inventory, redirectAudit, localizedContent] = await Promise.all([
    readJson(resolve(PROJECT_ROOT, "theme.release.json")),
    readJson(resolve(PROJECT_ROOT, "src/generated/articles.json")),
    readJson(resolve(PROJECT_ROOT, "src/generated/properties.json")),
    readJson(resolve(PROJECT_ROOT, "content/source-route-inventory.json")),
    readJson(resolve(PROJECT_ROOT, "content/redirects-and-exclusions.json")),
    readJson(resolve(PROJECT_ROOT, "src/generated/localized-content.json")),
  ]);
  const articles = [...sourceArticles];
  const articleKeys = new Set(articles.map((entry) => `${entry.translationKey}:${entry.locale}`));
  for (const translation of localizedContent.articles || []) {
    for (const locale of ["en", "de", "fr"]) {
      const entry = translation.localized?.[locale];
      const key = `${translation.translationKey}:${locale}`;
      if (!entry || articleKeys.has(key)) continue;
      articles.push({
        id: `${translation.sourceId}-${locale}`,
        translationKey: translation.translationKey,
        locale,
        slug: entry.slug,
        sourcePath: "",
        sourceUrl: "",
        title: entry.title,
        description: entry.seoDescription || entry.description,
        author: translation.sourceAuthor,
        authorType: "Person",
        publisher: translation.sourcePublisher,
        category: null,
        publishedAt: translation.sourcePublishedAt,
        heroImage: translation.heroImage,
        bodyHtml: entry.bodyHtml,
      });
      articleKeys.add(key);
    }
  }
  return { release, sourceArticles, articles, properties, inventory, redirectAudit, localizedContent };
}

function buildStaticRoutes(baseUrl) {
  return STATIC_GROUPS.flatMap((group) =>
    LOCALES.map((locale) => {
      const path = group.page === "home"
        ? `/${locale}/`
        : joinRoute(locale, SEGMENTS[locale][group.segment]);
      const [title, description] = SEO[group.page][locale];
      return {
        path,
        html: routeFile(path, `${locale}/${group.key.replace(/[^a-z0-9.-]+/gi, "-")}`),
        locale,
        translationKey: group.key,
        surface: group.surface,
        runtimeKind: group.runtimeKind,
        seo: {
          title,
          description,
          canonical: new URL(path.replace(/^\//, ""), baseUrl).toString(),
          ogImage: absoluteAsset(baseUrl, "/assets/images/hero-linen-label.webp"),
          private: Boolean(group.private),
        },
      };
    }),
  );
}

function buildExactPropertyRoutes(baseUrl, properties, localizedContent) {
  const localizations = new Map((localizedContent.properties || []).map((entry) => [entry.sourceId, entry]));
  return [...properties]
    .sort((a, b) => String(a.slug).localeCompare(String(b.slug)))
    .flatMap((property) =>
      LOCALES.map((locale) => {
        const path = joinRoute(locale, SEGMENTS[locale].properties, property.slug);
        const localized = localizations.get(property.id)?.localized?.[locale];
        return {
          path,
          html: routeFile(path, `${locale}/property-${property.slug}`),
          locale,
          translationKey: `property.${property.slug}`,
          surface: "CONTENT_PAGE",
          runtimeKind: "surface",
          prerender: {
            kind: "property",
            title: localized?.title || property.title,
            description: localized?.description || property.description,
            bodyHtml: cleanMigratedHtml(localized?.bodyHtml || property.bodyHtml, baseUrl),
            image: absoluteAsset(baseUrl, property.heroImage),
            location: localized?.location || property.location,
            price: property.price,
            currency: property.currency,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            areaM2: property.areaM2,
            lotM2: property.lotM2,
          },
          seo: {
            title: safeSeoTitle(localized?.title || property.title),
            description: safeDescription(localized?.description, localizedPropertyDescription(locale, property)),
            canonical: new URL(path.replace(/^\//, ""), baseUrl).toString(),
            ogImage: absoluteAsset(baseUrl, property.heroImage),
            private: false,
          },
        };
      }),
    );
}

function completeArticleGroups(articles) {
  const groups = new Map();
  for (const article of articles) {
    const entries = groups.get(article.translationKey) || [];
    entries.push(article);
    groups.set(article.translationKey, entries);
  }
  return [...groups.entries()]
    .filter(([, entries]) => LOCALES.every((locale) => entries.filter((entry) => entry.locale === locale).length === 1))
    .sort(([left], [right]) => String(left).localeCompare(String(right)));
}

function buildExactArticleRoutes(baseUrl, articles) {
  return completeArticleGroups(articles).flatMap(([translationKey, entries]) =>
    LOCALES.map((locale) => {
      const article = entries.find((entry) => entry.locale === locale);
      const path = joinRoute(locale, SEGMENTS[locale].blog, article.slug);
      return {
        path,
        html: routeFile(path, `${locale}/article-${article.slug}`),
        locale,
        translationKey: `article.${translationKey}`,
        surface: "CONTENT_PAGE",
        runtimeKind: "surface",
        prerender: {
          kind: "article",
          title: article.title,
          description: articleDescription(article),
          bodyHtml: cleanMigratedHtml(article.bodyHtml, baseUrl),
          image: absoluteAsset(baseUrl, article.heroImage),
          publishedAt: article.publishedAt,
          author: article.author,
          authorType: article.authorType,
          publisher: article.publisher,
        },
        seo: {
          title: safeSeoTitle(article.title),
          description: articleDescription(article),
          canonical: new URL(path.replace(/^\//, ""), baseUrl).toString(),
          ogImage: absoluteAsset(baseUrl, article.heroImage),
          private: false,
        },
      };
    }),
  );
}

function buildDynamicRoutes(baseUrl) {
  return DYNAMIC_GROUPS.flatMap((group) =>
    LOCALES.map((locale) => {
      const path = joinRoute(locale, SEGMENTS[locale][group.segment], group.param);
      const fallbackPage = group.page === "order" ? "order" : group.page;
      const [title, description] = SEO[fallbackPage][locale];
      return {
        path,
        html: `templates/${locale}/${group.key.replace(/[^a-z0-9.-]+/gi, "-")}.html`,
        locale,
        translationKey: group.key,
        surface: group.surface,
        runtimeKind: group.runtimeKind,
        seo: {
          title,
          description,
          canonical: "",
          ogImage: absoluteAsset(baseUrl, "/assets/images/hero-linen-label.webp"),
          private: true,
        },
      };
    }),
  );
}

function stripRoute(route) {
  const { seo, prerender, ...descriptor } = route;
  return descriptor;
}

function manifestSeo(route) {
  return {
    path: route.path,
    title: route.seo.title,
    description: route.seo.description,
    ...(route.seo.canonical ? { canonical: route.seo.canonical } : {}),
    ...(route.seo.ogImage ? { ogImage: route.seo.ogImage } : {}),
  };
}

function buildPublicRoutes(baseUrl, routes, articles) {
  const byPath = new Map();
  for (const route of routes) {
    if (!route.path.includes(":") && route.runtimeKind === "surface") {
      byPath.set(route.path, route);
    }
  }
  for (const article of articles) {
    const path = joinRoute(article.locale, SEGMENTS[article.locale].blog, article.slug);
    if (!byPath.has(path)) {
      byPath.set(path, {
        path,
        html: routeFile(path, `${article.locale}/article-${article.slug}`),
        locale: article.locale,
        translationKey: `article.${article.translationKey}`,
        surface: "CONTENT_PAGE",
        runtimeKind: "surface",
        prerender: {
          kind: "article",
          title: article.title,
          description: articleDescription(article),
          bodyHtml: cleanMigratedHtml(article.bodyHtml, baseUrl),
          image: absoluteAsset(baseUrl, article.heroImage),
          publishedAt: article.publishedAt,
          author: article.author,
          authorType: article.authorType,
          publisher: article.publisher,
        },
        seo: {
          title: safeSeoTitle(article.title),
          description: articleDescription(article),
          canonical: new URL(path.replace(/^\//, ""), baseUrl).toString(),
          ogImage: absoluteAsset(baseUrl, article.heroImage),
          private: false,
        },
        sidecarOnly: true,
      });
    }
  }
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function redirect(from, to, reason) {
  return { from: cleanPath(from), to: cleanPath(to), status: 308, reason };
}

function gone(path, reason) {
  return { path: cleanPath(path), status: 410, reason };
}

function buildRedirects(articles, properties, inventory, redirectAudit) {
  const redirects = [
    redirect("/", "/es/", "Locale predeterminado ahora explicito"),
    redirect("/nosotros/", "/es/nosotros/", "Prefijo de locale obligatorio"),
    redirect("/atelier/", "/es/atelier/", "Prefijo de locale obligatorio"),
    redirect("/shop/", "/es/atelier/", "El nuevo Atelier sustituye el archivo demo de WooCommerce"),
    redirect("/blog/", "/es/blog/", "Prefijo de locale obligatorio"),
    redirect("/contacto/", "/es/contacto/", "Prefijo de locale obligatorio"),
    redirect("/diseno-interior/", "/es/diseno-interior/", "Prefijo de locale obligatorio"),
    redirect("/gestion-de-propriedades/", "/es/gestion-de-propiedades/", "Correccion ortografica y prefijo de locale"),
    redirect("/gestion-de-propiedades/", "/es/gestion-de-propiedades/", "Prefijo de locale obligatorio"),
    redirect("/bienes-raices/", "/es/propiedades/", "Nueva arquitectura de propiedades"),
    redirect("/propiedades/", "/es/propiedades/", "Nueva arquitectura de propiedades"),
    redirect("/properties/", "/es/propiedades/", "Se retira la pagina vacia y se consolida la cartera"),
    redirect("/portfolio/", "/es/propiedades/", "La cartera pasa a la ruta canonica de propiedades"),
    redirect("/politica-de-privacidad/", "/es/politica-de-privacidad/", "Prefijo de locale obligatorio"),
    redirect("/politica-de-cookies/", "/es/politica-de-cookies/", "Prefijo de locale obligatorio"),
    redirect("/aviso-legal/", "/es/aviso-legal/", "Prefijo de locale obligatorio"),
    redirect("/carrito/", "/es/carrito/", "Carrito SALES localizado"),
    redirect("/checkout/", "/es/finalizar-compra/", "Checkout SALES localizado"),
    redirect("/finalizar-compra/", "/es/finalizar-compra/", "Checkout SALES localizado"),
    redirect("/en/real-estate/", "/en/properties/", "Nueva arquitectura de propiedades"),
    redirect("/fr/immobilier/", "/fr/proprietes/", "Nueva arquitectura de propiedades"),
    redirect("/fr/nous/", "/fr/a-propos/", "Nueva ruta localizada"),
    redirect("/fr/design-dinterieur/", "/fr/design-interieur/", "Nueva ruta localizada"),
  ];

  for (const article of articles) {
    redirects.push(
      redirect(
        article.sourcePath,
        joinRoute(article.locale, SEGMENTS[article.locale].blog, article.slug),
        "Articulo migrado al Journal localizado",
      ),
    );
  }
  for (const property of properties) {
    redirects.push(
      redirect(
        property.sourcePath,
        joinRoute("es", SEGMENTS.es.properties, property.slug),
        "Detalle de propiedad migrado uno a uno",
      ),
    );
  }

  const productUrls = inventory?.inventoryBySitemapType?.product || [];
  const goneRoutes = [
    gone("/elementor-222585/", "Pagina de prueba de Elementor sin equivalente real"),
    gone("/faq/", "Contenido demo retirado; no existe una FAQ real equivalente"),
    gone("/my-account/", "Cuenta demo de WooCommerce retirada"),
    ...productUrls
      .map((url) => new URL(url).pathname)
      .filter((path) => path !== "/shop/")
      .map((path) => gone(path, "Producto demo de moda retirado; no se redirige a contenido no equivalente")),
  ];

  const uniqueRedirects = [...new Map(redirects.map((entry) => [entry.from, entry])).values()]
    .filter((entry) => entry.from !== entry.to)
    .sort((a, b) => a.from.localeCompare(b.from));
  const uniqueGone = [...new Map(goneRoutes.map((entry) => [entry.path, entry])).values()]
    .sort((a, b) => a.path.localeCompare(b.path));

  return {
    schemaVersion: 1,
    sourceHost: "agencyluxuryself.com",
    target: "Nuklo tenant host",
    policy: redirectAudit.policy,
    redirects: uniqueRedirects,
    gone: uniqueGone,
    hostCanonicalization: redirectAudit.hostCanonicalization,
    contractNote: "Nuklo sales@1.1.0 consume este mismo mapa mediante manifest.legacySeo; el sidecar se conserva como artefacto operativo auditable.",
  };
}

export async function buildReleaseModel({ baseUrl, sourceCommit, sourceBranch }) {
  const source = await loadReleaseSource();
  const releaseBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const staticRoutes = buildStaticRoutes(releaseBase);
  const exactPropertyRoutes = buildExactPropertyRoutes(releaseBase, source.properties, source.localizedContent);
  const exactArticleRoutes = buildExactArticleRoutes(releaseBase, source.articles);
  const dynamicRoutes = buildDynamicRoutes(releaseBase);
  const internalRoutes = [
    ...staticRoutes,
    ...exactPropertyRoutes,
    ...exactArticleRoutes,
    ...dynamicRoutes,
  ];
  const publicRoutes = buildPublicRoutes(releaseBase, internalRoutes, source.articles);
  const seoMigration = buildRedirects(source.sourceArticles, source.properties, source.inventory, source.redirectAudit);

  const manifest = {
    id: source.release.themeId,
    name: source.release.name,
    mode: "sales",
    contractVersion: source.release.contractVersion,
    templateVersion: source.release.version,
    description: "Theme SALES multilingüe de Agency Luxury Self: propiedades, gestión, interiores, Atelier, carrito, checkout, pedidos y consultas comerciales.",
    sourceCommit,
    sourceBranch,
    entry: "index.html",
    renderer: "remote-static-app",
    appUrl: releaseBase,
    assetsBase: releaseBase,
    previewUrl: new URL("es/index.html", releaseBase).toString(),
    surfaces: ["SHOP_HOME", "SHOP_COLLECTION", "SHOP_PRODUCT", "CONTENT_PAGE"],
    capabilities: [
      "tenant",
      "branding",
      "media",
      "tracking",
      "catalog",
      "product",
      "collection",
      "cart",
      "checkout",
      "orders",
      "contactInquiry",
      "contentPage",
    ],
    forbidden: ["leadLanding", "leadForm", "singleLanding"],
    i18n: {
      defaultLocale: "es",
      prefixDefault: true,
      locales: LOCALE_DEFINITIONS,
    },
    routes: internalRoutes.map(stripRoute),
    mediaAssets: [
      {
        key: "agency-luxury-self-hero",
        url: absoluteAsset(releaseBase, "/assets/images/hero-linen-label.webp"),
        kind: "BRANDING",
        title: "Agency Luxury Self — hero",
        alt: "Etiqueta textil de Agency Luxury Self",
        tags: ["agency-luxury-self", "hero", "branding"],
      },
      {
        key: "agency-luxury-self-property",
        url: absoluteAsset(releaseBase, "/assets/images/property-pool.jpg"),
        kind: "COMMERCE",
        title: "Agency Luxury Self — propiedad",
        alt: "Piscina y arquitectura residencial seleccionada",
        tags: ["agency-luxury-self", "property", "real-estate"],
      },
      {
        key: "agency-luxury-self-atelier",
        url: absoluteAsset(releaseBase, "/assets/images/atelier-travertine-bowl.png"),
        kind: "COMMERCE",
        title: "Agency Luxury Self — Atelier",
        alt: "Cuenco escultórico de travertino",
        tags: ["agency-luxury-self", "atelier", "product"],
      },
    ],
    routeSeo: internalRoutes.map(manifestSeo),
    legacySeo: {
      schemaVersion: 1,
      redirects: seoMigration.redirects,
      gone: seoMigration.gone,
    },
    notes: [
      "Las consultas se envian por el bridge contactInquiry a /api/inquiries/public; no se crean leads CAPTURE.",
      "Carrito, checkout y pedidos usan el bridge SALES y /api/orders/public.",
      "legacySeo aplica el plan uno-a-uno y las respuestas 410 desde Core; redirects.json conserva el mismo mapa como sidecar auditable.",
      "El host de release es un origen inmutable de assets y se bloquea para indexacion; el tenant Nuklo publica SEO en su dominio.",
    ],
  };

  return {
    ...source,
    releaseBase,
    manifest,
    internalRoutes,
    publicRoutes,
    redirects: seoMigration,
    counts: {
      articles: source.sourceArticles.length,
      localizedArticleRoutes: source.articles.length,
      properties: source.properties.length,
      completeArticleGroups: completeArticleGroups(source.articles).length,
      routeDescriptors: internalRoutes.length,
      publicRoutes: publicRoutes.length,
    },
  };
}

export function routeMatches(pattern, pathname) {
  const template = cleanPath(pattern).split("/").filter(Boolean);
  const actual = cleanPath(pathname).split("/").filter(Boolean);
  if (template.length !== actual.length) return false;
  return template.every((segment, index) => {
    if (segment === ":slug") return Boolean(actual[index]);
    if (segment === ":token") return /^[a-z0-9_-]+$/i.test(actual[index] || "");
    return segment === actual[index];
  });
}

export function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
