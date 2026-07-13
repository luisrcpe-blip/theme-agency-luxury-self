import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowsOut,
  Bathtub,
  Bed,
  CaretDown,
  CaretLeft,
  CaretRight,
  CheckCircle,
  EnvelopeSimple,
  GlobeSimple,
  Handbag,
  InstagramLogo,
  List,
  MagnifyingGlass,
  MapPin,
  Minus,
  Phone,
  Plus,
  Ruler,
  Trash,
  WarningCircle,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import {
  LOCALES,
  articleForRoute,
  articlesForLocale,
  copy,
  hrefFor,
  legalPageContent,
  localizedHref,
  navKeys,
  propertiesForLocale,
  propertyForRoute,
  resolveRoute,
  secondaryNavKeys,
} from "./content.js";
import { propertyMatchesType } from "./property-localization.js";
import {
  createOrder,
  formatMoney,
  getCartSnapshot,
  getRuntimeContext,
  getRuntimeProducts,
  submitInquiry,
  subscribeRuntime,
  updateCart,
} from "./runtime.js";

const atelierPreview = {
  id: "preview-travertine-bowl",
  slug: "cuenco-travertino",
  name: "Cuenco esculpido en travertino",
  description:
    "Pieza editorial de muestra. El catálogo comercial real se inyecta desde Nuklo.",
  image: "/assets/images/atelier-travertine-bowl.png",
  previewOnly: true,
  price: null,
  currency: "EUR",
  variants: [],
  stock: null,
};

const atelierPreviewCopy = {
  es: { name: "Cuenco esculpido en travertino", description: "Pieza editorial de muestra. El catálogo comercial real se inyecta desde Nuklo." },
  en: { name: "Sculpted travertine bowl", description: "Editorial sample piece. The live commerce catalogue is supplied by Nuklo." },
  de: { name: "Skulpturale Schale aus Travertin", description: "Redaktionelles Musterstück. Der echte Produktkatalog wird von Nuklo bereitgestellt." },
  fr: { name: "Coupe sculptée en travertin", description: "Pièce éditoriale de démonstration. Le catalogue commercial réel est fourni par Nuklo." },
};

const commerceLabels = {
  es: { variant: "Variante", soldOut: "Agotado", decrease: "Reducir cantidad", increase: "Aumentar cantidad", orderNumber: "Pedido", orderTotal: "Total", orderStatus: "Estado", previous: "Anterior", next: "Siguiente", heroAlt: "Etiqueta textil de Agency Luxury Self", checkoutError: "No pudimos completar el pedido. Revise los datos e inténtelo de nuevo.", orderRecorded: "Su pedido quedó registrado correctamente." },
  en: { variant: "Variant", soldOut: "Sold out", decrease: "Decrease quantity", increase: "Increase quantity", orderNumber: "Order", orderTotal: "Total", orderStatus: "Status", previous: "Previous", next: "Next", heroAlt: "Agency Luxury Self textile label", checkoutError: "We could not complete the order. Check the details and try again.", orderRecorded: "Your order was recorded successfully." },
  de: { variant: "Variante", soldOut: "Ausverkauft", decrease: "Menge verringern", increase: "Menge erhöhen", orderNumber: "Bestellung", orderTotal: "Gesamt", orderStatus: "Status", previous: "Zurück", next: "Weiter", heroAlt: "Textiletikett von Agency Luxury Self", checkoutError: "Die Bestellung konnte nicht abgeschlossen werden. Prüfen Sie die Angaben und versuchen Sie es erneut.", orderRecorded: "Ihre Bestellung wurde erfolgreich erfasst." },
  fr: { variant: "Variante", soldOut: "Épuisé", decrease: "Réduire la quantité", increase: "Augmenter la quantité", orderNumber: "Commande", orderTotal: "Total", orderStatus: "Statut", previous: "Précédent", next: "Suivant", heroAlt: "Étiquette textile Agency Luxury Self", checkoutError: "La commande n’a pas pu être finalisée. Vérifiez les informations et réessayez.", orderRecorded: "Votre commande a bien été enregistrée." },
};

const PAGE_COVERS = {
  home: "/assets/source/pages/home-cover.webp",
  properties: "/assets/source/pages/properties-cover.webp",
  services: "/assets/source/pages/management-cover.jpg",
  interiors: "/assets/source/pages/interiors-cover.webp",
  about: "/assets/source/pages/about-cover.jpg",
  atelier: "/assets/source/pages/atelier-cover.webp",
  blog: "/assets/source/pages/blog-cover.jpg",
  contact: "/assets/source/pages/contact-cover.jpg",
};

const HOME_SERVICE_MEDIA = [
  { image: "/assets/source/home/home-real-estate.webp", page: "properties" },
  { image: "/assets/source/home/home-property-management.webp", page: "services" },
  { image: "/assets/source/home/home-interior-design.jpeg", page: "interiors" },
];

const homeSourceCopy = {
  es: {
    statementLines: [
      "“Somos una marca integral de lujo y estilo de vida que acompaña a propietarios e",
      "inversionistas internacionales en España, gestionando cada etapa de su residencia:",
      "desde la adquisición estratégica del inmueble hasta su diseño, operación y cuidado",
      "continuo.”",
    ],
    carouselLabel: "Servicios de Agency Luxury Self",
    slides: [
      {
        title: "Bienes Raíces",
        description: "Asesoramiento y búsqueda de viviendas prime y oportunidades de inversión, alineadas con el estilo de vida, la privacidad y el valor a largo plazo.",
        cta: "Ver más",
      },
      {
        title: "Gestión de Propiedades",
        description: "Cuidado operativo integral: mantenimiento, proveedores, personal, preparación de la propiedad y tranquilidad del propietario durante todo el año.",
        cta: "Ver más",
      },
      {
        title: "Diseño de Interior",
        description: "Transformaciones llave en mano que elevan el confort y la coherencia, desde el concepto hasta la instalación, con socios cuidadosamente seleccionados.",
        cta: "Ver más",
      },
    ],
  },
  en: {
    statementLines: [
      "“We are a comprehensive luxury and lifestyle brand that supports international owners and",
      "investors in Spain, managing every stage of their residence:",
      "from strategic property acquisition to its design, operation, and ongoing",
      "care.”",
    ],
    carouselLabel: "Agency Luxury Self services",
    slides: [
      {
        title: "Real Estate",
        description: "Advisory and search for prime properties and investment opportunities, aligned with lifestyle, privacy, and long-term value.",
        cta: "View more",
      },
      {
        title: "Property Management",
        description: "Comprehensive operational care: maintenance, suppliers, staff, property preparation, and owner peace of mind year-round.",
        cta: "View more",
      },
      {
        title: "Interior Design",
        description: "Turnkey transformations that elevate comfort and coherence, from concept to installation, with carefully selected partners.",
        cta: "View more",
      },
    ],
  },
  de: {
    statementLines: [
      "„Wir sind eine ganzheitliche Luxus- und Lifestyle-Marke, die internationale Eigentümer und",
      "Investoren in Spanien begleitet und jede Phase ihres Wohnsitzes betreut:",
      "von der strategischen Immobilienakquise bis hin zu Design, Betrieb und kontinuierlicher",
      "Betreuung.“",
    ],
    carouselLabel: "Leistungen von Agency Luxury Self",
    slides: [
      {
        title: "Immobilien",
        description: "Beratung und Suche nach erstklassigen Wohnimmobilien und Investitionsmöglichkeiten – abgestimmt auf Lifestyle, Privatsphäre und langfristigen Wert.",
        cta: "Mehr anzeigen",
      },
      {
        title: "Immobilienverwaltung",
        description: "Umfassende operative Betreuung: Instandhaltung, Dienstleister, Personal, Vorbereitung der Immobilie und die Sicherheit des Eigentümers das ganze Jahr über.",
        cta: "Mehr anzeigen",
      },
      {
        title: "Interior Design",
        description: "Schlüsselfertige Transformationen, die Komfort und stimmige Gestaltung auf ein neues Niveau heben – vom Konzept bis zur Installation, mit sorgfältig ausgewählten Partnern.",
        cta: "Mehr anzeigen",
      },
    ],
  },
  fr: {
    statementLines: [
      "Nous sommes une marque intégrale de luxe et de style de vie qui accompagne les propriétaires et",
      "investisseurs internationaux en Espagne, en gérant chaque étape de leur résidence :",
      "de l’acquisition stratégique du bien immobilier jusqu’à sa conception, son exploitation et son entretien",
      "continu.",
    ],
    carouselLabel: "Services d’Agency Luxury Self",
    slides: [
      {
        title: "Immobilier",
        description: "Conseil et recherche de résidences premium et d’opportunités d’investissement, alignées avec le style de vie, la confidentialité et la valeur à long terme.",
        cta: "Voir plus",
      },
      {
        title: "Gestion de Propriétés",
        description: "Prise en charge opérationnelle complète : entretien, fournisseurs, personnel, préparation de la propriété et sérénité du propriétaire tout au long de l’année.",
        cta: "Voir plus",
      },
      {
        title: "Design d’Intérieur",
        description: "Transformations clés en main qui rehaussent le confort et la cohérence, du concept à l’installation, avec des partenaires soigneusement sélectionnés.",
        cta: "Voir plus",
      },
    ],
  },
};

const LOCALE_FLAGS = {
  es: "/assets/source/brand/flags/es.svg",
  en: "/assets/source/brand/flags/en.svg",
  de: "/assets/source/brand/flags/de.svg",
  fr: "/assets/source/brand/flags/fr.svg",
};

const HEADER_LOCALES = ["en", "es", "de", "fr"];
const MENU_KEYS = ["about", "properties", "services", "interiors", "atelier", "blog", "contact"];

const sourcePageCopy = {
  es: {
    contactHeroEyebrow: "Atención personal y discreta",
    contactHeroTitle: "Estamos aquí para escucharle.",
    contactHeroLead: "Cuéntenos qué necesita y le acompañaremos con criterio, cercanía y absoluta confidencialidad.",
    locationTitle: "Dónde estamos",
    locationValue: "Sotogrande, Cádiz · Sur de España",
    callUs: "Llámenos",
    writeUs: "Escríbanos",
    contactFormEyebrow: "Solicitud privada",
    contactFormTitle: "Conversemos sobre lo que está buscando.",
    contactFormLead: "Complete el formulario y el equipo de Agency Luxury Self se pondrá en contacto con usted.",
    contactQuote: "Una buena decisión empieza por una conversación clara.",
    areaLabel: "Nuestro área de servicio",
    categories: "Categorías",
    recentPosts: "Artículos recientes",
    journalContact: "Hablemos",
    journalContactLead: "¿Necesita asesoramiento inmobiliario o residencial en el sur de España?",
    similarProperties: "Propiedades similares",
  },
  en: {
    contactHeroEyebrow: "Personal, discreet attention",
    contactHeroTitle: "We are here to listen.",
    contactHeroLead: "Tell us what you need and we will guide you with judgment, care and complete confidentiality.",
    locationTitle: "Where to find us",
    locationValue: "Sotogrande, Cádiz · Southern Spain",
    callUs: "Call us",
    writeUs: "Write to us",
    contactFormEyebrow: "Private request",
    contactFormTitle: "Let us talk about what you are looking for.",
    contactFormLead: "Complete the form and the Agency Luxury Self team will contact you personally.",
    contactQuote: "A good decision begins with a clear conversation.",
    areaLabel: "Our service area",
    categories: "Categories",
    recentPosts: "Recent articles",
    journalContact: "Let us talk",
    journalContactLead: "Need real-estate or residential advice in southern Spain?",
    similarProperties: "Similar properties",
  },
  de: {
    contactHeroEyebrow: "Persönlich und diskret",
    contactHeroTitle: "Wir nehmen uns Zeit für Sie.",
    contactHeroLead: "Erzählen Sie uns, was Sie suchen. Wir begleiten Sie mit Erfahrung, Sorgfalt und absoluter Vertraulichkeit.",
    locationTitle: "Wo Sie uns finden",
    locationValue: "Sotogrande, Cádiz · Südspanien",
    callUs: "Rufen Sie uns an",
    writeUs: "Schreiben Sie uns",
    contactFormEyebrow: "Private Anfrage",
    contactFormTitle: "Sprechen wir über Ihre Vorstellungen.",
    contactFormLead: "Füllen Sie das Formular aus und das Team von Agency Luxury Self meldet sich persönlich bei Ihnen.",
    contactQuote: "Eine gute Entscheidung beginnt mit einem klaren Gespräch.",
    areaLabel: "Unser Servicegebiet",
    categories: "Kategorien",
    recentPosts: "Neueste Artikel",
    journalContact: "Lassen Sie uns sprechen",
    journalContactLead: "Sie wünschen Immobilien- oder Wohnberatung in Südspanien?",
    similarProperties: "Ähnliche Immobilien",
  },
  fr: {
    contactHeroEyebrow: "Une attention personnelle et discrète",
    contactHeroTitle: "Nous sommes à votre écoute.",
    contactHeroLead: "Parlez-nous de votre projet. Nous vous accompagnons avec discernement, attention et une totale confidentialité.",
    locationTitle: "Où nous trouver",
    locationValue: "Sotogrande, Cádiz · Sud de l’Espagne",
    callUs: "Appelez-nous",
    writeUs: "Écrivez-nous",
    contactFormEyebrow: "Demande privée",
    contactFormTitle: "Parlons de ce que vous recherchez.",
    contactFormLead: "Complétez le formulaire et l’équipe Agency Luxury Self vous contactera personnellement.",
    contactQuote: "Une bonne décision commence par une conversation claire.",
    areaLabel: "Notre zone d’intervention",
    categories: "Catégories",
    recentPosts: "Articles récents",
    journalContact: "Parlons-en",
    journalContactLead: "Besoin d’un conseil immobilier ou résidentiel dans le sud de l’Espagne ?",
    similarProperties: "Propriétés similaires",
  },
};

const COVER_PAGES = new Set([
  "home",
  "properties",
  "property",
  "services",
  "interiors",
  "about",
  "atelier",
  "blog",
  "article",
  "contact",
]);

function useDialogA11y(open, onClose) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const animationFrame = window.requestAnimationFrame(() => {
      (dialog?.querySelector("[data-autofocus]") || dialog?.querySelector(focusableSelector))?.focus();
    });
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll(focusableSelector)].filter((item) => item.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open]);
  return dialogRef;
}

function useRuntimeState() {
  const [, setRevision] = useState(0);
  useEffect(() => subscribeRuntime(() => setRevision((value) => value + 1)), []);
  return {
    context: getRuntimeContext(),
    cart: getCartSnapshot(),
  };
}

function normalizedProducts(locale = "es") {
  const runtimeProducts = getRuntimeProducts();
  if (!runtimeProducts.length) return [{ ...atelierPreview, ...atelierPreviewCopy[locale] }];
  const runtimeContext = getRuntimeContext();
  const tenantCurrency = runtimeContext?.currency || runtimeContext?.data?.tenant?.currency || "EUR";
  return runtimeProducts.map((product) => {
    const firstImage =
      product.image?.url ||
      product.image ||
      product.featuredImage?.url ||
      product.media?.[0]?.url ||
      product.images?.[0]?.url ||
      product.images?.[0] ||
      "/assets/images/atelier-travertine-bowl.png";
    const basePrice = product.commerce?.finalPrice ?? product.salePrice ?? product.price ?? null;
    const variants = (product.variants || []).map((variant) => ({
      id: variant.id,
      label: [variant.name, variant.value].filter(Boolean).join(" — ") || variant.id,
      additionalPrice: Number(variant.additionalPrice || 0),
      stock: variant.stock ?? null,
    }));
    return {
      id: product.id,
      slug: product.slug || product.handle || product.id,
      name: product.name || product.title,
      description: product.description || product.shortDescription || "",
      image: firstImage,
      price: typeof basePrice === "number" ? basePrice : Number(basePrice),
      currency: tenantCurrency,
      variants,
      stock: product.stock ?? null,
      previewOnly: false,
    };
  });
}

function productSelection(product, variantId) {
  const variants = product?.variants || [];
  const variant = variants.find((item) => item.id === variantId)
    || variants.find((item) => item.stock === null || Number(item.stock) > 0)
    || variants[0]
    || null;
  const hasPrice = product?.price !== null && product?.price !== undefined && Number.isFinite(Number(product.price));
  const basePrice = hasPrice ? Number(product.price) : null;
  return {
    variant,
    price: basePrice === null ? null : basePrice + Number(variant?.additionalPrice || 0),
    stock: variant?.stock ?? product?.stock ?? null,
  };
}

function orderStatusLabel(status, locale) {
  const labels = {
    es: { PENDING: "Pendiente", CONFIRMED: "Confirmado", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELED: "Cancelado" },
    en: { PENDING: "Pending", CONFIRMED: "Confirmed", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELED: "Canceled" },
    de: { PENDING: "Ausstehend", CONFIRMED: "Bestätigt", SHIPPED: "Versandt", DELIVERED: "Zugestellt", CANCELED: "Storniert" },
    fr: { PENDING: "En attente", CONFIRMED: "Confirmée", SHIPPED: "Expédiée", DELIVERED: "Livrée", CANCELED: "Annulée" },
  };
  return labels[locale]?.[String(status || "").toUpperCase()] || String(status || "");
}

function Logo({ locale = "es", tone = "dark" }) {
  return (
    <a className="brand" href={hrefFor(locale, "home")} aria-label="Agency Luxury Self">
      <img
        className="brand-logo"
        src={tone === "light" ? "/assets/source/brand/als-logo-light.webp" : "/assets/source/brand/als-logo-dark.webp"}
        alt="Agency Luxury Self"
      />
    </a>
  );
}

function LocaleSwitcher({ locale, tone = "header" }) {
  const t = copy[locale];
  const pathname = window.location.pathname;
  const [open, setOpen] = useState(false);
  const switcherRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (!switcherRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);

  return (
    <div ref={switcherRef} className={`locale-switcher locale-switcher--${tone}`}>
      <button
        className="locale-trigger"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t.languageSelector}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flag-frame"><img src={LOCALE_FLAGS[locale]} alt="" /></span>
        <CaretDown size={13} weight="bold" aria-hidden="true" />
      </button>
      {open ? (
        <nav className="locale-menu" aria-label={t.languageSelector}>
          {HEADER_LOCALES.map((item) => (
            <a
              key={item}
              className={item === locale ? "active" : ""}
              href={localizedHref(pathname, item)}
              lang={item}
              hrefLang={item}
              aria-current={item === locale ? "page" : undefined}
            >
              <span className="flag-frame"><img src={LOCALE_FLAGS[item]} alt="" /></span>
              <span>{copy[item].localeName}</span>
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

function Header({ locale, onMenu, overCover }) {
  const t = copy[locale];
  const pathname = window.location.pathname;
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, [pathname]);

  const transparent = overCover && !scrolled;
  return (
    <header className={`site-header ${transparent ? "site-header--transparent" : "site-header--solid"}`}>
      <div className="site-header-inner">
        <button className="icon-button mobile-menu-button" type="button" onClick={onMenu} aria-label={t.menu}>
          <List size={24} weight="light" />
        </button>
        <Logo locale={locale} tone={transparent ? "light" : "dark"} />
        <div className="header-actions">
          <LocaleSwitcher locale={locale} tone={transparent ? "cover" : "header"} />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ locale, open, onClose }) {
  const t = copy[locale];
  const dialogRef = useDialogA11y(open, onClose);
  if (!open) return null;
  return (
    <div ref={dialogRef} className="overlay-shell" role="dialog" aria-modal="true" aria-label={t.menu}>
      <div className="mobile-menu-panel">
        <div className="overlay-header">
          <Logo locale={locale} tone="light" />
          <button className="icon-button" type="button" onClick={onClose} aria-label={t.close} data-autofocus>
            <X size={24} weight="light" />
          </button>
        </div>
        <nav className="mobile-nav">
          {MENU_KEYS.map((key) => (
            <a key={key} href={hrefFor(locale, key)} onClick={onClose}>
              {t.nav[key]}
            </a>
          ))}
        </nav>
        <div className="mobile-menu-footer">
          <LocaleSwitcher locale={locale} tone="menu" />
          <a href="https://www.instagram.com/agency_luxuryself/" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
      <button className="overlay-backdrop" type="button" onClick={onClose} aria-label={t.close} />
    </div>
  );
}

function SearchOverlay({ locale, open, onClose }) {
  const t = copy[locale];
  const [query, setQuery] = useState("");
  const dialogRef = useDialogA11y(open, onClose);
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(locale);
    if (!term) return [];
    const propertyResults = propertiesForLocale(locale)
      .filter((property) => `${property.title} ${property.location}`.toLocaleLowerCase(locale).includes(term))
      .slice(0, 4)
      .map((property) => ({
        key: `property-${property.id}`,
        label: property.title,
        meta: property.location,
        href: hrefFor(locale, "properties", property.slug),
      }));
    const articleResults = articlesForLocale(locale)
      .filter((article) => `${article.title} ${article.description}`.toLocaleLowerCase(locale).includes(term))
      .slice(0, 4)
      .map((article) => ({
        key: `article-${article.id}`,
        label: article.title,
        meta: t.blogTitle,
        href: hrefFor(locale, "blog", article.slug),
      }));
    const serviceResults = Object.entries(serviceContent)
      .filter(([key, content]) => `${t.nav[key] || ""} ${content.title[locale]} ${content.eyebrow[locale]} ${key === "services" ? `${t.managementTitle} ${t.managementMeta}` : ""}`.toLocaleLowerCase(locale).includes(term))
      .map(([key, content]) => ({
        key: `service-${key}`,
        label: content.title[locale],
        meta: t.nav[key] || content.eyebrow[locale],
        href: hrefFor(locale, key),
      }));
    return [...propertyResults, ...serviceResults, ...articleResults].slice(0, 6);
  }, [locale, query, t.blogTitle]);
  if (!open) return null;
  return (
    <div ref={dialogRef} className="search-overlay" role="dialog" aria-modal="true" aria-label={t.search}>
      <div className="search-panel">
        <div className="search-row">
          <MagnifyingGlass size={24} weight="light" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.search}
          />
          <button className="icon-button" type="button" onClick={onClose} aria-label={t.close}>
            <X size={24} weight="light" />
          </button>
        </div>
        <div className="search-results" aria-live="polite">
          {query && !results.length ? <p>{t.noResults}</p> : null}
          {results.map((result) => (
            <a key={result.key} href={result.href}>
              <span>{result.label}</span>
              <small>{result.meta}</small>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function InquiryForm({ locale, context = { kind: "general", cta: "contact" }, compact = false, minimal = false }) {
  const t = copy[locale];
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await submitInquiry({
        fullName: `${form.get("name") || ""} ${form.get("surname") || ""}`.trim(),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        subject: String(form.get("interest") || ""),
        message: String(form.get("message") || ""),
        locale,
        privacyAccepted: form.get("privacy") === "on",
        context: { ...context, sourcePath: window.location.pathname },
      });
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setError(t.inquiryError);
    }
  }
  if (status === "sent") {
    return (
      <div className="form-success" role="status">
        <CheckCircle size={30} weight="light" />
        <p>{t.sent}</p>
      </div>
    );
  }
  return (
    <form className={`inquiry-form ${compact ? "compact" : ""}`} onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>{t.name}</span>
          <input name="name" autoComplete="given-name" required />
        </label>
        {!minimal ? (
          <label>
            <span>{t.surname}</span>
            <input name="surname" autoComplete="family-name" />
          </label>
        ) : null}
        <label>
          <span>{t.email}</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>{t.phone}</span>
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>
      {!minimal ? (
        <label>
          <span>{t.interest}</span>
          <select name="interest" defaultValue={context.kind || "general"}>
            <option value="property">{t.nav.properties}</option>
            <option value="service">{t.nav.services}</option>
            <option value="product">{t.nav.atelier}</option>
            <option value="general">{t.privateInquiry}</option>
          </select>
        </label>
      ) : null}
      <label>
        <span>{t.message}</span>
        <textarea name="message" rows={compact ? 3 : 6} required />
      </label>
      <label className="privacy-checkbox">
        <input name="privacy" type="checkbox" required />
        <span>
          <a href={hrefFor(locale, "privacy")}>{t.privacyConsent}</a>
        </span>
      </label>
      {status === "error" ? (
        <p className="form-error" role="alert">
          <WarningCircle size={18} /> {error || t.inquiryError}
        </p>
      ) : null}
      <button className="solid-button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}

function InquiryDrawer({ locale, open, onClose, context }) {
  const t = copy[locale];
  const dialogRef = useDialogA11y(open, onClose);
  if (!open) return null;
  return (
    <div ref={dialogRef} className="overlay-shell inquiry-shell" role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
      <aside className="inquiry-drawer">
        <div className="overlay-header">
          <span className="eyebrow">Agency Luxury Self</span>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t.close}>
            <X size={24} weight="light" />
          </button>
        </div>
        <h2 id="inquiry-title">{t.inquiryTitle}</h2>
        <p>{t.inquiryBody}</p>
        <InquiryForm locale={locale} context={context} compact />
      </aside>
      <button className="overlay-backdrop" type="button" onClick={onClose} aria-label={t.close} />
    </div>
  );
}

function Metric({ icon: Icon, value, label }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <span className="metric">
      <Icon size={17} weight="light" />
      <span>{value}</span>
      <small>{label}</small>
    </span>
  );
}

function HomeBrandStatement({ locale }) {
  const lines = homeSourceCopy[locale].statementLines;
  return (
    <section className="home-brand-statement" aria-label="Agency Luxury Self">
      <p>
        {lines.map((line, index) => (
          <span key={line}>
            {line}
            {index < lines.length - 1 ? (
              <>
                <br className="home-statement-break" />
                <span className="home-statement-mobile-space" aria-hidden="true"> </span>
              </>
            ) : null}
          </span>
        ))}
      </p>
    </section>
  );
}

function HomeServicesCarousel({ locale }) {
  const labels = commerceLabels[locale];
  const content = homeSourceCopy[locale];
  const slides = content.slides.map((slide, index) => ({ ...HOME_SERVICE_MEDIA[index], ...slide }));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [locale]);

  const showPrevious = () => setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <section className="home-services-carousel" aria-label={content.carouselLabel}>
      <div
        className="home-services-frame"
        role="region"
        aria-roledescription="carousel"
        aria-label={content.carouselLabel}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            showPrevious();
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            showNext();
          }
        }}
      >
        <div className="home-services-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
          {slides.map((slide, index) => (
            <article
              className="home-service-slide"
              key={slide.title}
              aria-hidden={index !== activeIndex}
              aria-label={`${index + 1} / ${slides.length}: ${slide.title}`}
            >
              <div className="home-service-copy">
                <div>
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                  <a
                    className="home-service-link"
                    href={hrefFor(locale, slide.page)}
                    tabIndex={index === activeIndex ? 0 : -1}
                  >
                    {slide.cta}
                  </a>
                </div>
              </div>
              <div className="home-service-image">
                <img src={slide.image} alt={slide.title} loading={index === 0 ? "eager" : "lazy"} />
              </div>
            </article>
          ))}
        </div>
        <button className="home-services-arrow home-services-arrow--previous" type="button" onClick={showPrevious} aria-label={labels.previous}>
          <CaretLeft size={28} weight="light" />
        </button>
        <button className="home-services-arrow home-services-arrow--next" type="button" onClick={showNext} aria-label={labels.next}>
          <CaretRight size={28} weight="light" />
        </button>
        <div className="home-services-dots" aria-label={content.carouselLabel}>
          {slides.map((slide, index) => (
            <button
              className={index === activeIndex ? "is-active" : ""}
              type="button"
              key={slide.title}
              onClick={() => setActiveIndex(index)}
              aria-label={`${index + 1}: ${slide.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomePage({ locale }) {
  const t = copy[locale];
  return (
    <main>
      <PageHero
        image={PAGE_COVERS.home}
        overlay="home"
        eyebrow="Agency Luxury Self"
        title={t.heroTitle}
        lead={t.heroBody}
      />
      <HomeBrandStatement locale={locale} />
      <HomeServicesCarousel locale={locale} />
      <JournalPreview locale={locale} />
    </main>
  );
}

function EditorialIntro({ locale }) {
  const t = copy[locale];
  const title = {
    es: "Un único interlocutor para cada etapa de su residencia.",
    en: "One trusted partner for every stage of your residence.",
    de: "Ein verlässlicher Partner für jede Phase Ihrer Residenz.",
    fr: "Un interlocuteur unique à chaque étape de votre résidence.",
  }[locale];
  return (
    <section className="editorial-intro section-pad">
      <span className="eyebrow">{t.editorialEyebrow}</span>
      <h2>{title}</h2>
      <p>{t.heroBody}</p>
      <div className="editorial-links">
        {["properties", "services", "interiors", "atelier"].map((key) => (
          <a key={key} href={hrefFor(locale, key)}>
            {t.nav[key]}
            <ArrowRight size={17} weight="light" />
          </a>
        ))}
      </div>
    </section>
  );
}

function JournalPreview({ locale }) {
  const t = copy[locale];
  const articles = articlesForLocale(locale).slice(0, 3);
  if (!articles.length) return null;
  return (
    <section className="journal-preview section-pad">
      <div className="section-heading-row">
        <div>
          <span className="eyebrow">{t.latest}</span>
          <h2>{t.blogTitle}</h2>
        </div>
        <a className="text-button" href={hrefFor(locale, "blog")}>
          {t.nav.blog} <ArrowRight size={16} weight="light" />
        </a>
      </div>
      <div className="article-grid">
        {articles.map((article) => (
          <ArticleCard key={article.id} locale={locale} article={article} />
        ))}
      </div>
    </section>
  );
}

function PageIntro({ eyebrow, title, lead }) {
  return (
    <section className="page-intro section-pad">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {lead ? <p>{lead}</p> : null}
    </section>
  );
}

function PageHero({ image, eyebrow, title, lead, overlay = "standard", children }) {
  return (
    <section className={`page-hero page-hero--${overlay}`} style={{ backgroundImage: `url("${image}")` }}>
      <div className="page-hero-content">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {lead ? <p>{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}

function PropertyCard({ locale, property }) {
  const t = copy[locale];
  return (
    <article className="property-card">
      <a className="property-image" href={hrefFor(locale, "properties", property.slug)}>
        <img src={property.heroImage} alt={property.title} loading="lazy" />
        {property.status ? <span className="image-label">{property.status}</span> : null}
      </a>
      <div className="property-card-body">
        <span className="eyebrow">{property.type || t.propertyCategory}</span>
        <h2>
          <a href={hrefFor(locale, "properties", property.slug)}>{property.title}</a>
        </h2>
        <p className="location-line">
          <MapPin size={16} weight="light" /> {property.location}
        </p>
        <div className="compact-metrics">
          <Metric icon={Bed} value={property.bedrooms} label={t.bedrooms} />
          <Metric icon={Bathtub} value={property.bathrooms} label={t.bathrooms} />
          <Metric icon={Ruler} value={property.areaM2 ? `${property.areaM2} m²` : null} label={t.area} />
        </div>
        <div className="card-footer-row">
          <strong>{formatMoney(property.price, property.currency, locale)}</strong>
          <a className="text-button" href={hrefFor(locale, "properties", property.slug)}>
            {t.viewProperty} <ArrowRight size={15} weight="light" />
          </a>
        </div>
      </div>
    </article>
  );
}

function PropertiesPage({ locale }) {
  const t = copy[locale];
  const localizedProperties = propertiesForLocale(locale);
  const [type, setType] = useState("all");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const locations = [...new Set(localizedProperties.map((property) => property.location).filter(Boolean))].sort();
  const filtered = localizedProperties.filter((property) => {
    const matchesType = propertyMatchesType(property, type);
    return matchesType && (!location || property.location === location) && (!minPrice || property.price >= minPrice);
  });
  return (
    <main>
      <PageHero image={PAGE_COVERS.properties} eyebrow={t.realEstateEyebrow} title={t.propertiesTitle} lead={t.propertiesLead} />
      <section className="filter-bar section-pad" aria-label={t.propertiesTitle}>
        <div className="filter-tabs">
          {[
            ["all", t.all],
            ["villa", t.villas],
            ["apartment", t.apartments],
          ].map(([value, label]) => (
            <button key={value} type="button" className={type === value ? "active" : ""} onClick={() => setType(value)}>
              {label}
            </button>
          ))}
        </div>
        <label>
          <span>{t.location}</span>
          <select value={location} onChange={(event) => setLocation(event.target.value)}>
            <option value="">{t.all}</option>
            {locations.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.minPrice}</span>
          <select value={minPrice} onChange={(event) => setMinPrice(Number(event.target.value))}>
            <option value="0">{t.all}</option>
            <option value="500000">{formatMoney(500000, "EUR", locale)}</option>
            <option value="1000000">{formatMoney(1000000, "EUR", locale)}</option>
            <option value="2000000">{formatMoney(2000000, "EUR", locale)}</option>
          </select>
        </label>
        <button className="text-button" type="button" onClick={() => { setType("all"); setLocation(""); setMinPrice(0); }}>
          {t.clearFilters}
        </button>
      </section>
      <section className="property-results section-pad">
        <p className="result-count">{filtered.length} {t.results}</p>
        <div className="property-grid">
          {filtered.map((property) => (
            <PropertyCard key={property.id} locale={locale} property={property} />
          ))}
        </div>
      </section>
    </main>
  );
}

function PropertyPage({ locale, slug, onInquiry }) {
  const t = copy[locale];
  const labels = commerceLabels[locale];
  const property = propertyForRoute(slug, locale);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const lightboxRef = useDialogA11y(galleryIndex !== null, () => setGalleryIndex(null));
  if (!property) return <NotFound locale={locale} />;
  const gallery = [property.heroImage, ...(property.gallery || [])];
  const relatedProperties = propertiesForLocale(locale).filter((item) => item.id !== property.id).slice(0, 3);
  return (
    <main>
      <section className="detail-hero">
        <img src={property.heroImage} alt={property.title} />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-copy">
          <span className="eyebrow">{property.status || t.propertyCategory}</span>
          <h1>{property.title}</h1>
          <p><MapPin size={17} weight="light" /> {property.location}</p>
        </div>
      </section>
      <section className="property-summary section-pad">
        <div>
          <span className="eyebrow">{property.type}</span>
          <strong className="detail-price">{formatMoney(property.price, property.currency, locale)}</strong>
        </div>
        <div className="detail-metrics">
          <Metric icon={Bed} value={property.bedrooms} label={t.bedrooms} />
          <Metric icon={Bathtub} value={property.bathrooms} label={t.bathrooms} />
          <Metric icon={Ruler} value={property.areaM2 ? `${property.areaM2} m²` : null} label={t.area} />
          <Metric icon={ArrowsOut} value={property.lotM2 ? `${property.lotM2} m²` : null} label={t.lot} />
        </div>
        <button className="solid-button" type="button" onClick={() => onInquiry({
          kind: "property",
          itemId: property.id,
          itemSlug: property.slug,
          itemName: property.title,
          cta: "property-detail",
        })}>
          {t.requestProperty}
        </button>
      </section>
      <section className="detail-content section-pad">
        <article className="rich-content" dangerouslySetInnerHTML={{ __html: property.bodyHtml }} />
      </section>
      {gallery.length > 1 ? (
        <section className="gallery-section section-pad">
          <div className="section-heading-row">
            <div><span className="eyebrow">{t.gallery}</span><h2>{property.title}</h2></div>
          </div>
          <div className="property-gallery">
            {gallery.map((image, index) => (
              <button key={`${image}-${index}`} type="button" onClick={() => setGalleryIndex(index)}>
                <img src={image} alt={`${property.title} — ${index + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {relatedProperties.length ? (
        <section className="related-section section-pad">
          <div className="section-heading-row">
            <div><span className="eyebrow">Agency Luxury Self</span><h2>{sourcePageCopy[locale].similarProperties}</h2></div>
          </div>
          <div className="property-grid property-related-grid">
            {relatedProperties.map((item) => <PropertyCard key={item.id} locale={locale} property={item} />)}
          </div>
        </section>
      ) : null}
      {galleryIndex !== null ? (
        <div ref={lightboxRef} className="lightbox" role="dialog" aria-modal="true" aria-label={t.gallery}>
          <button className="icon-button lightbox-close" type="button" onClick={() => setGalleryIndex(null)} aria-label={t.close}>
            <X size={28} weight="light" />
          </button>
          <button className="icon-button lightbox-prev" type="button" onClick={() => setGalleryIndex((galleryIndex - 1 + gallery.length) % gallery.length)} aria-label={labels.previous}>
            <CaretLeft size={30} weight="light" />
          </button>
          <img src={gallery[galleryIndex]} alt={`${property.title} — ${galleryIndex + 1}`} />
          <button className="icon-button lightbox-next" type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % gallery.length)} aria-label={labels.next}>
            <CaretRight size={30} weight="light" />
          </button>
        </div>
      ) : null}
    </main>
  );
}

function ProductCard({ locale, product }) {
  const t = copy[locale];
  const selection = productSelection(product);
  return (
    <article className="product-card">
      <a href={hrefFor(locale, "atelier", product.slug)} className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.previewOnly ? <span className="image-label">{t.previewProduct}</span> : null}
      </a>
      <div>
        <span className="eyebrow">{t.atelierCategory}</span>
        <h2><a href={hrefFor(locale, "atelier", product.slug)}>{product.name}</a></h2>
        <p>{product.description}</p>
        <div className="card-footer-row">
          <strong>{formatMoney(selection.price, product.currency, locale) || t.atelierSamplePrice}</strong>
          <a className="text-button" href={hrefFor(locale, "atelier", product.slug)}>
            {t.viewProduct} <ArrowRight size={15} weight="light" />
          </a>
        </div>
      </div>
    </article>
  );
}

function AtelierPage({ locale }) {
  const t = copy[locale];
  const products = normalizedProducts(locale);
  return (
    <main>
      <PageHero image={PAGE_COVERS.atelier} eyebrow="Agency Luxury Self Atelier" title={t.atelierTitle} lead={t.atelierLead} />
      <section className="product-grid section-pad">
        {products.map((product) => <ProductCard key={product.id} locale={locale} product={product} />)}
      </section>
    </main>
  );
}

function ProductPage({ locale, slug }) {
  const t = copy[locale];
  const labels = commerceLabels[locale];
  const localizedPreview = { ...atelierPreview, ...atelierPreviewCopy[locale] };
  const product = normalizedProducts(locale).find((item) => item.slug === slug) || (slug === atelierPreview.slug ? localizedPreview : null);
  const [added, setAdded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  if (!product) return <NotFound locale={locale} />;
  const selection = productSelection(product, selectedVariantId);
  const outOfStock = selection.stock !== null && Number(selection.stock) <= 0;
  async function addProduct() {
    if (product.previewOnly || outOfStock) return;
    await updateCart({
      action: "add",
      item: { productId: product.id, variantId: selection.variant?.id || undefined, quantity: 1 },
    });
    setAdded(true);
  }
  return (
    <main className="product-detail section-pad">
      <div className="product-detail-image"><img src={product.image} alt={product.name} /></div>
      <div className="product-detail-copy">
        <span className="eyebrow">{t.atelierCategory}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        {product.variants.length ? (
          <label className="product-variant-select">
            <span>{labels.variant}</span>
            <select
              value={selection.variant?.id || ""}
              onChange={(event) => { setSelectedVariantId(event.target.value); setAdded(false); }}
            >
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id} disabled={variant.stock !== null && Number(variant.stock) <= 0}>
                  {variant.label}{variant.stock !== null && Number(variant.stock) <= 0 ? ` — ${labels.soldOut}` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <strong className="detail-price">{formatMoney(selection.price, product.currency, locale) || t.atelierSamplePrice}</strong>
        {product.previewOnly ? <p className="preview-notice">{t.unavailableDemo}</p> : null}
        {outOfStock ? <p className="preview-notice">{labels.soldOut}</p> : null}
        <button className="solid-button" type="button" disabled={product.previewOnly || added || outOfStock} onClick={addProduct}>
          {outOfStock ? labels.soldOut : added ? t.cart : t.addToCart}
        </button>
      </div>
    </main>
  );
}

function formattedArticleDate(article, locale) {
  if (!article.publishedAt) return "";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(article.publishedAt));
}

function ArticleCard({ locale, article }) {
  const t = copy[locale];
  const date = formattedArticleDate(article, locale);
  return (
    <article className="article-card" id={`post-${article.slug}`}>
      <a href={hrefFor(locale, "blog", article.slug)} className="article-image">
        <img src={article.heroImage} alt={article.title} loading="lazy" />
      </a>
      <div>
        <span className="eyebrow">{article.category || t.blogTitle}</span>
        <h2><a href={hrefFor(locale, "blog", article.slug)}>{article.title}</a></h2>
        {date ? <p className="article-card-meta">{date} · {article.author}</p> : null}
        <p>{article.description}</p>
        <a className="text-button" href={hrefFor(locale, "blog", article.slug)}>
          {t.readArticle} <ArrowRight size={15} weight="light" />
        </a>
      </div>
    </article>
  );
}

function BlogSidebar({ locale, articles }) {
  const pageCopy = sourcePageCopy[locale];
  const categories = [...new Set(articles.map((article) => article.category).filter(Boolean))];
  const recent = articles.slice(0, 4);
  return (
    <aside className="blog-sidebar" aria-label={pageCopy.categories}>
      {categories.length ? (
        <section className="blog-sidebar-block">
          <h2>{pageCopy.categories}</h2>
          <nav className="blog-categories">
            {categories.map((category) => {
              const firstArticle = articles.find((article) => article.category === category);
              return <a key={category} href={`${hrefFor(locale, "blog")}#post-${firstArticle.slug}`}>{category}</a>;
            })}
          </nav>
        </section>
      ) : null}
      <section className="blog-sidebar-block">
        <h2>{pageCopy.recentPosts}</h2>
        <div className="recent-posts">
          {recent.map((article) => (
            <a key={article.id} href={hrefFor(locale, "blog", article.slug)}>
              <img src={article.heroImage} alt="" loading="lazy" />
              <span>
                <strong>{article.title}</strong>
                <small>{formattedArticleDate(article, locale)}</small>
              </span>
            </a>
          ))}
        </div>
      </section>
      <section
        className="sidebar-contact-card"
        style={{ backgroundImage: "url('/assets/source/blog/sidebar-contact-bg.webp')" }}
      >
        <div className="sidebar-contact-copy">
          <span className="eyebrow">Agency Luxury Self</span>
          <h2>{pageCopy.journalContact}</h2>
          <p>{pageCopy.journalContactLead}</p>
        </div>
        <InquiryForm
          locale={locale}
          context={{ kind: "service", cta: "blog-sidebar" }}
          compact
          minimal
        />
      </section>
    </aside>
  );
}

function BlogPage({ locale }) {
  const t = copy[locale];
  const articles = articlesForLocale(locale);
  return (
    <main>
      <PageHero image={PAGE_COVERS.blog} eyebrow="Agency Luxury Self Journal" title={t.blogTitle} lead={t.blogLead} />
      <section className="blog-layout article-index section-pad">
        <div className="article-grid blog-article-grid">
          {articles.map((article) => <ArticleCard key={article.id} locale={locale} article={article} />)}
        </div>
        <BlogSidebar locale={locale} articles={articles} />
      </section>
    </main>
  );
}

function ArticlePage({ locale, slug, onInquiry }) {
  const t = copy[locale];
  const article = articleForRoute(locale, slug);
  if (!article) return <NotFound locale={locale} />;
  const related = articlesForLocale(locale).filter((item) => item.id !== article.id).slice(0, 3);
  const date = article.publishedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(article.publishedAt))
    : null;
  return (
    <main>
      <PageHero
        image={article.heroImage}
        eyebrow={article.category || t.blogTitle}
        title={article.title}
        lead={article.description}
      />
      <section className="blog-layout article-page-layout section-pad">
        <article className="article-detail">
          <header className="article-header">
            <div className="article-meta">
              {date ? <span>{t.published}: {date}</span> : null}
              <span>{t.by}: {article.author}</span>
            </div>
          </header>
          <div className="article-body rich-content" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
          <div className="article-inquiry">
            <h2>{t.inquiryTitle}</h2>
            <button className="solid-button" type="button" onClick={() => onInquiry({
              kind: "service",
              itemId: article.id,
              itemSlug: article.slug,
              itemName: article.title,
              cta: "article-end",
            })}>{t.privateInquiry}</button>
          </div>
        </article>
        <BlogSidebar locale={locale} articles={articlesForLocale(locale)} />
      </section>
      <section className="related-section section-pad">
        <span className="eyebrow">{t.related}</span>
        <div className="article-grid">
          {related.map((item) => <ArticleCard key={item.id} locale={locale} article={item} />)}
        </div>
      </section>
    </main>
  );
}

const serviceContent = {
  services: {
    image: PAGE_COVERS.services,
    overlay: "management",
    eyebrow: {
      es: "Gestión de propiedades y lifestyle",
      en: "Property & lifestyle management",
      de: "Immobilien- & Lifestyle-Management",
      fr: "Gestion immobilière & art de vivre",
    },
    title: {
      es: "Su propiedad, impecable incluso cuando usted no está.",
      en: "Your property, impeccable even when you are away.",
      de: "Ihre Immobilie – makellos, auch wenn Sie nicht vor Ort sind.",
      fr: "Votre propriété, impeccable même en votre absence.",
    },
  },
  interiors: {
    image: PAGE_COVERS.interiors,
    overlay: "standard",
    eyebrow: {
      es: "Diseño de interiores",
      en: "Interior design",
      de: "Innenarchitektur",
      fr: "Design d’intérieur",
    },
    title: {
      es: "Interiores serenos, diseñados para vivir y perdurar.",
      en: "Calm interiors, designed to be lived in and to last.",
      de: "Ruhige Interieurs, zum Leben und Bleiben entworfen.",
      fr: "Des intérieurs sereins, conçus pour vivre et durer.",
    },
  },
  about: {
    image: PAGE_COVERS.about,
    overlay: "standard",
    eyebrow: {
      es: "Agency Luxury Self",
      en: "Agency Luxury Self",
      de: "Agency Luxury Self",
      fr: "Agency Luxury Self",
    },
    title: {
      es: "Criterio local, estándares internacionales y absoluta discreción.",
      en: "Local judgment, international standards and absolute discretion.",
      de: "Lokale Expertise, internationale Standards und absolute Diskretion.",
      fr: "Expertise locale, standards internationaux et discrétion absolue.",
    },
  },
};

function ServicePage({ locale, page }) {
  const t = copy[locale];
  const content = serviceContent[page];
  return (
    <main>
      <PageHero
        image={content.image}
        overlay={content.overlay}
        eyebrow={content.eyebrow[locale]}
        title={content.title[locale]}
        lead={page === "services" ? t.managementMeta : t.heroBody}
      />
      <section className="service-principles section-pad">
        {[t.nav.properties, t.nav.services, t.nav.interiors || t.nav.atelier].map((label, index) => (
          <article key={`${label}-${index}`}>
            <span>0{index + 1}</span>
            <h2>{label}</h2>
            <p>{t.heroBody}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function ContactPage({ locale }) {
  const t = copy[locale];
  const pageCopy = sourcePageCopy[locale];
  return (
    <main>
      <PageHero
        image={PAGE_COVERS.contact}
        overlay="contact"
        eyebrow={pageCopy.contactHeroEyebrow}
        title={pageCopy.contactHeroTitle}
        lead={pageCopy.contactHeroLead}
      />
      <section className="contact-strip section-pad">
        <article>
          <MapPin size={23} weight="light" />
          <span><small>{pageCopy.locationTitle}</small><strong>{pageCopy.locationValue}</strong></span>
        </article>
        <a href="tel:+34613277859">
          <WhatsappLogo size={23} weight="light" />
          <span><small>{pageCopy.callUs}</small><strong>+34 613 27 78 59</strong></span>
        </a>
        <a href="mailto:analucia@agencyluxuryself.com">
          <EnvelopeSimple size={23} weight="light" />
          <span><small>{pageCopy.writeUs}</small><strong>analucia@agencyluxuryself.com</strong></span>
        </a>
      </section>
      <section className="contact-main section-pad">
        <figure className="contact-visual">
          <img src="/assets/source/pages/contact-form-keys.webp" alt="" />
          <figcaption>{pageCopy.contactQuote}</figcaption>
        </figure>
        <div className="contact-form-panel">
          <span className="eyebrow">{pageCopy.contactFormEyebrow}</span>
          <h2>{pageCopy.contactFormTitle}</h2>
          <p>{pageCopy.contactFormLead}</p>
          <InquiryForm locale={locale} context={{ kind: "general", cta: "contact-page" }} />
        </div>
      </section>
      <a
        className="contact-map-band section-pad"
        href="https://www.google.com/maps/search/?api=1&query=Sotogrande%2C+C%C3%A1diz"
        target="_blank"
        rel="noreferrer"
      >
        <MapPin size={34} weight="light" />
        <span><small>{pageCopy.areaLabel}</small><strong>{pageCopy.locationValue}</strong></span>
        <ArrowRight size={20} weight="light" />
      </a>
    </main>
  );
}

function CartPage({ locale, cart }) {
  const t = copy[locale];
  const labels = commerceLabels[locale];
  const products = normalizedProducts(locale);
  const lines = cart.items.map((item) => ({
    item,
    product: products.find((product) => product.id === item.productId),
  })).filter((line) => line.product).map((line) => ({
    ...line,
    selection: productSelection(line.product, line.item.variantId),
  }));
  const subtotal = lines.reduce((total, line) => total + line.selection.price * line.item.quantity, 0);
  const currency = lines[0]?.product.currency || getRuntimeContext()?.currency || "EUR";
  return (
    <main>
      <PageIntro eyebrow="Atelier" title={t.cart} />
      <section className="cart-layout section-pad">
        {!lines.length ? (
          <div className="empty-state">
            <Handbag size={34} weight="light" />
            <p>{t.emptyCart}</p>
            <a className="solid-button" href={hrefFor(locale, "atelier")}>{t.continueShopping}</a>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {lines.map(({ item, product, selection }) => (
                <article key={`${item.productId}-${item.variantId || ""}`} className="cart-line">
                  <img src={product.image} alt={product.name} />
                  <div>
                    <h2>{product.name}</h2>
                    {selection.variant ? <small>{selection.variant.label}</small> : null}
                    <strong>{formatMoney(selection.price, product.currency, locale)}</strong>
                  </div>
                  <div className="quantity-control" aria-label={t.quantity}>
                    <button type="button" aria-label={labels.decrease} onClick={() => updateCart({ action: "setQuantity", item: { ...item, quantity: Math.max(1, item.quantity - 1) } })}><Minus size={15} /></button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={labels.increase}
                      disabled={selection.stock !== null && item.quantity >= Number(selection.stock)}
                      onClick={() => updateCart({ action: "setQuantity", item: { ...item, quantity: item.quantity + 1 } })}
                    ><Plus size={15} /></button>
                  </div>
                  <button className="icon-button" type="button" onClick={() => updateCart({ action: "remove", productId: item.productId, variantId: item.variantId })} aria-label={t.remove}><Trash size={20} weight="light" /></button>
                </article>
              ))}
            </div>
            <aside className="cart-summary">
              <div><span>{t.subtotal}</span><strong>{formatMoney(subtotal, currency, locale)}</strong></div>
              <a className="solid-button" href={hrefFor(locale, "checkout")}>{t.checkout}</a>
            </aside>
          </>
        )}
      </section>
    </main>
  );
}

function CheckoutPage({ locale, cart }) {
  const t = copy[locale];
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  async function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const result = await createOrder({
        customerName: String(data.get("name") || ""),
        customerEmail: String(data.get("email") || ""),
        customerPhone: String(data.get("phone") || ""),
        shippingLocationLabel: String(data.get("city") || ""),
        address: String(data.get("address") || ""),
        reference: String(data.get("reference") || ""),
        items: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
        })),
      });
      await updateCart({ action: "clear" });
      if (!result.confirmationToken) throw new Error("Nuklo no devolvió un token de confirmación seguro.");
      window.location.href = hrefFor(locale, "order", result.confirmationToken);
    } catch {
      setStatus("error");
      setError(commerceLabels[locale].checkoutError);
    }
  }
  return (
    <main>
      <PageIntro eyebrow={t.secureCheckout} title={t.checkoutTitle} />
      <form className="checkout-form section-pad" onSubmit={handleSubmit}>
        <label><span>{t.name}</span><input name="name" autoComplete="name" required /></label>
        <label><span>{t.email}</span><input name="email" type="email" autoComplete="email" required /></label>
        <label><span>{t.phone}</span><input name="phone" type="tel" autoComplete="tel" required /></label>
        <label><span>{t.location}</span><input name="city" autoComplete="address-level2" required /></label>
        <label className="full"><span>{t.address}</span><input name="address" autoComplete="street-address" required /></label>
        <label className="full"><span>{t.reference}</span><textarea name="reference" rows="3" /></label>
        {status === "error" ? <p className="form-error full"><WarningCircle size={18} /> {error}</p> : null}
        <button className="solid-button full" type="submit" disabled={!cart.items.length || status === "sending"}>{status === "sending" ? t.sending : t.checkout}</button>
      </form>
    </main>
  );
}

function OrderPage({ locale, context }) {
  const t = copy[locale];
  const labels = commerceLabels[locale];
  const order = context?.data?.order || null;
  return (
    <main className="order-confirmation section-pad">
      <CheckCircle size={48} weight="light" />
      <h1>{t.orderTitle}</h1>
      <p>{order ? labels.orderRecorded : t.orderPending}</p>
      {order ? (
        <dl className="order-summary">
          <div><dt>{labels.orderNumber}</dt><dd>{order.orderNumber}</dd></div>
          <div><dt>{labels.orderTotal}</dt><dd>{formatMoney(order.total, order.currency, locale)}</dd></div>
          <div><dt>{labels.orderStatus}</dt><dd>{orderStatusLabel(order.status, locale)}</dd></div>
        </dl>
      ) : null}
      <a className="solid-button" href={hrefFor(locale, "home")}>{t.discover}</a>
    </main>
  );
}

function LegalPage({ locale, page }) {
  const headings = {
    privacy: { es: "Política de privacidad", en: "Privacy policy", de: "Datenschutz", fr: "Politique de confidentialité" },
    cookies: { es: "Política de cookies", en: "Cookie policy", de: "Cookie-Richtlinie", fr: "Politique de cookies" },
    legal: { es: "Aviso legal", en: "Legal notice", de: "Impressum", fr: "Mentions légales" },
  };
  const content = legalPageContent(page, locale);
  return (
    <main>
      <PageIntro eyebrow="Agency Luxury Self" title={headings[page][locale]} />
      <section className="legal-copy section-pad">
        {content ? <article className="rich-content" dangerouslySetInnerHTML={{ __html: content.bodyHtml }} /> : (
          <>
            <p>Agency Luxury Self · analucia@agencyluxuryself.com · +34 613 27 78 59</p>
            <p>{copy[locale].footerClaim}</p>
          </>
        )}
      </section>
    </main>
  );
}

function NotFound({ locale }) {
  return (
    <main className="not-found section-pad">
      <span className="eyebrow">404</span>
      <h1>{copy[locale].noResults}</h1>
      <a className="solid-button" href={hrefFor(locale, "home")}>{copy[locale].discover}</a>
    </main>
  );
}

function Footer({ locale }) {
  const t = copy[locale];
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Logo locale={locale} tone="dark" />
        <div className="footer-contact-grid">
          <a href="https://wa.me/34613277859" target="_blank" rel="noreferrer">
            <WhatsappLogo size={20} weight="regular" aria-hidden="true" />
            <span>+34 613 27 78 59</span>
          </a>
          <a href="https://www.instagram.com/agency_luxuryself/" target="_blank" rel="noreferrer">
            <InstagramLogo size={20} weight="regular" aria-hidden="true" />
            <span>agency_luxuryself</span>
          </a>
          <a href="mailto:analucia@agencyluxuryself.com">
            <EnvelopeSimple size={20} weight="regular" aria-hidden="true" />
            <span>analucia@agencyluxuryself.com</span>
          </a>
          <a href="https://agencyluxuryself.com/" target="_blank" rel="noreferrer">
            <GlobeSimple size={20} weight="regular" aria-hidden="true" />
            <span>agencyluxuryself.com</span>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <nav>
          <a href={hrefFor(locale, "privacy")}>{routeLabel(locale, "privacy")}</a>
          <a href={hrefFor(locale, "cookies")}>{routeLabel(locale, "cookies")}</a>
          <a href={hrefFor(locale, "legal")}>{routeLabel(locale, "legal")}</a>
        </nav>
        <p>© {new Date().getFullYear()} Agency Luxury Self. {t.rights}</p>
      </div>
    </footer>
  );
}

function routeLabel(locale, page) {
  const labels = {
    privacy: { es: "Política de privacidad", en: "Privacy policy", de: "Datenschutz", fr: "Politique de confidentialité" },
    cookies: { es: "Política de cookies", en: "Cookie policy", de: "Cookie-Richtlinie", fr: "Politique de cookies" },
    legal: { es: "Aviso legal", en: "Legal", de: "Impressum", fr: "Mentions légales" },
  };
  return labels[page][locale];
}

function PageRenderer({ route, cart, context, onInquiry }) {
  const { locale, page } = route;
  if (page === "home") return <HomePage locale={locale} />;
  if (page === "properties") return <PropertiesPage locale={locale} />;
  if (page === "property") return <PropertyPage locale={locale} slug={route.slug} onInquiry={onInquiry} />;
  if (page === "atelier") return <AtelierPage locale={locale} />;
  if (page === "product") return <ProductPage locale={locale} slug={route.slug} />;
  if (page === "blog") return <BlogPage locale={locale} />;
  if (page === "article") return <ArticlePage locale={locale} slug={route.slug} onInquiry={onInquiry} />;
  if (["services", "interiors", "about"].includes(page)) return <ServicePage locale={locale} page={page} />;
  if (page === "contact") return <ContactPage locale={locale} />;
  if (page === "cart") return <CartPage locale={locale} cart={cart} />;
  if (page === "checkout") return <CheckoutPage locale={locale} cart={cart} />;
  if (page === "order") return <OrderPage locale={locale} context={context} />;
  if (["privacy", "cookies", "legal"].includes(page)) return <LegalPage locale={locale} page={page} />;
  return <NotFound locale={locale} />;
}

export function App() {
  const route = resolveRoute();
  const { cart, context } = useRuntimeState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inquiry, setInquiry] = useState({ open: false, context: { kind: "general", cta: "header" } });
  const locale = route.locale;
  const overCover = route.page === "property"
    ? Boolean(propertyForRoute(route.slug, locale))
    : COVER_PAGES.has(route.page);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.body.classList.toggle("overlay-open", menuOpen || searchOpen || inquiry.open);
    return () => document.body.classList.remove("overlay-open");
  }, [locale, menuOpen, searchOpen, inquiry.open]);

  function openInquiry(context = { kind: "general", cta: "header" }) {
    setMenuOpen(false);
    setInquiry({ open: true, context });
  }

  return (
    <div className={`app-shell ${overCover ? "app-shell--cover-header" : "app-shell--solid-header"}`}>
      <Header
        locale={locale}
        onMenu={() => setMenuOpen(true)}
        overCover={overCover}
      />
      <PageRenderer route={route} cart={cart} context={context} onInquiry={openInquiry} />
      <Footer locale={locale} />
      <MobileMenu
        locale={locale}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onInquiry={() => openInquiry()}
        onSearch={() => { setMenuOpen(false); setSearchOpen(true); }}
      />
      <SearchOverlay locale={locale} open={searchOpen} onClose={() => setSearchOpen(false)} />
      <InquiryDrawer locale={locale} open={inquiry.open} context={inquiry.context} onClose={() => setInquiry((value) => ({ ...value, open: false }))} />
    </div>
  );
}
