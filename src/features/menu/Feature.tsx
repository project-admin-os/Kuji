import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/shared/i18n";
import type { MenuCategory, MenuPairing, MenuProduct } from "./types";
import { strings } from "./data/strings";
import { useMenu, refreshMenu } from "./menuStore";
import { addPairingOrder, addProductOrder, useOrder } from "./orderStore";
import { buildCatalog } from "./lib/catalog";
import { localized } from "./lib/i18n";
import { Header } from "./components/Header";
import { Sections } from "./components/Sections";
import { ItemSheet } from "./components/ItemSheet";
import { OfferSheet } from "./components/OfferSheet";
import { CategorySheet } from "./components/CategorySheet";
import { SearchOverlay } from "./components/SearchOverlay";
import { OrderBar } from "./components/OrderBar";
import { OrderSheet } from "./components/OrderSheet";
import { PromoPopup } from "./components/PromoPopup";
import { useScrollSpy } from "./components/hooks/useScrollSpy";
import { useIdle } from "./components/hooks/useIdle";

export function Feature() {
  const locale = useLocale();
  const copy = strings[locale];
  const menuState = useMenu();
  const order = useOrder();
  const { menu } = menuState;
  const catalog = useMemo(() => buildCatalog(menu), [menu]);
  const categoryNav = catalog.categories.filter((entry) => entry.products.length > 0);
  const categoryIds = categoryNav.map(({ category }) => category.id);
  const ready = useIdle();
  const activeCategory = useScrollSpy(ready ? categoryIds : []);

  const [searchOpen, setSearchOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [selectedPairing, setSelectedPairing] = useState<MenuPairing | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    document.title = locale === "ar" ? "القائمة | كوجي" : "Menu | Kuji";
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute("content", locale === "ar" ? "استكشف قائمة كوجي." : "Explore the Kuji menu.");
  }, [locale]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const closeProduct = useCallback(() => setSelectedProduct(null), [setSelectedProduct]);
  const closePairing = useCallback(() => setSelectedPairing(null), [setSelectedPairing]);
  const closeCategory = useCallback(() => setSelectedCategory(null), [setSelectedCategory]);
  const closeSearch = useCallback(() => setSearchOpen(false), [setSearchOpen]);
  const closeOrder = useCallback(() => setOrderOpen(false), [setOrderOpen]);

  const openProduct = useCallback((product: MenuProduct) => {
    setSelectedPairing(null);
    setSelectedCategory(null);
    setSearchOpen(false);
    setOrderOpen(false);
    setSelectedProduct(product);
  }, [setOrderOpen, setSearchOpen, setSelectedCategory, setSelectedPairing, setSelectedProduct]);

  const openPairing = useCallback((pairing: MenuPairing) => {
    setSelectedProduct(null);
    setSelectedCategory(null);
    setSearchOpen(false);
    setOrderOpen(false);
    setSelectedPairing(pairing);
  }, [setOrderOpen, setSearchOpen, setSelectedCategory, setSelectedPairing, setSelectedProduct]);

  const openCategory = useCallback((category: MenuCategory) => {
    setSelectedProduct(null);
    setSelectedPairing(null);
    setSelectedCategory(category);
  }, [setSelectedCategory, setSelectedPairing, setSelectedProduct]);

  const handleProductAdd = useCallback((product: MenuProduct, sizeId: string | null, addOnIds: string[]) => {
    addProductOrder(product.id, sizeId, addOnIds);
    setSelectedProduct(null);
    setNotice(`${localized(product.name, locale)} · ${copy.added}`);
  }, [copy.added, locale, setNotice, setSelectedProduct]);

  const handlePairingAdd = useCallback((pairing: MenuPairing, products: Parameters<typeof addPairingOrder>[1]) => {
    addPairingOrder(pairing.id, products);
    setSelectedPairing(null);
    setNotice(copy.added);
  }, [copy.added, setNotice, setSelectedPairing]);

  const scrollToCategory = (id: string) => {
    document.getElementById(`menu-section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const activePairingProducts = selectedPairing
    ? catalog.pairings.find((entry) => entry.pairing.id === selectedPairing.id)?.products ?? null
    : null;
  const showModal = searchOpen || orderOpen || Boolean(selectedProduct || selectedPairing || selectedCategory);

  return (
    <main lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-mist text-navy">
      <Header strings={copy} onSearch={() => setSearchOpen(true)} />
      {menuState.source === "seed" || menuState.refreshFailed || menuState.unpublished ? (
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 text-small text-navy/65 sm:px-8 lg:px-12" role="status">
          <span>{menuState.refreshFailed ? copy.refreshFailed : menuState.unpublished ? copy.menuNotPublished : copy.starterMenu}</span>
          {menuState.refreshFailed && <button type="button" onClick={() => void refreshMenu(true)} className="min-h-10 rounded-full bg-white px-4 font-semibold text-navy hover:bg-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{copy.retry}</button>}
        </div>
      ) : null}
      {menuState.refreshing && menuState.source !== "seed" && <p className="sr-only" role="status">{copy.loading}</p>}
      {categoryNav.length > 0 && <nav aria-label={copy.categories} className="sticky top-0 z-20 border-b border-navy/10 bg-mist/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] sm:px-8 lg:px-12">
          {categoryNav.map(({ category }) => <button key={category.id} type="button" onClick={() => scrollToCategory(category.id)} aria-current={activeCategory === category.id ? "location" : undefined} className={`min-h-10 shrink-0 rounded-full px-4 text-small font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${activeCategory === category.id ? "bg-navy text-white" : "bg-white text-navy hover:bg-yellow"}`}>
            {localized(category.pill, locale) || localized(category.title, locale)}
          </button>)}
        </div>
      </nav>}
      {ready ? (
        <Sections menu={menu} catalog={catalog} locale={locale} strings={copy} onSelectProduct={openProduct} onSelectPairing={openPairing} onSelectCategory={openCategory} />
      ) : (
        <div className="mx-auto max-w-6xl px-5 py-16 text-center text-small text-navy/50 sm:px-8" role="status">{copy.loading}</div>
      )}
      <footer className="border-t border-navy/10 px-5 py-8 text-center text-caption text-navy/45">
        <a href="/" className="font-semibold text-navy/65">{copy.brand}</a>
      </footer>
      {notice && <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-2xl bg-navy px-4 py-3 text-center text-small font-semibold text-white shadow-lg" role="status" aria-live="polite">{notice}</div>}
      <OrderBar lines={order.lines} menu={menu} locale={locale} strings={copy} onOpen={() => setOrderOpen(true)} />
      <ItemSheet key={selectedProduct?.id ?? "no-product"} product={selectedProduct} menu={menu} locale={locale} strings={copy} onClose={closeProduct} onAdd={handleProductAdd} onSelectProduct={openProduct} />
      <OfferSheet key={selectedPairing?.id ?? "no-pairing"} pairing={selectedPairing} products={activePairingProducts} menu={menu} locale={locale} strings={copy} onClose={closePairing} onAdd={handlePairingAdd} />
      <CategorySheet category={selectedCategory} products={selectedCategory ? catalog.categories.find((entry) => entry.category.id === selectedCategory.id)?.products ?? [] : []} locale={locale} strings={copy} onClose={closeCategory} onSelectProduct={openProduct} />
      <SearchOverlay open={searchOpen} menu={menu} locale={locale} strings={copy} onClose={closeSearch} onSelectProduct={openProduct} />
      <OrderSheet open={orderOpen} menu={menu} locale={locale} strings={copy} onClose={closeOrder} />
      <PromoPopup popup={menu.popup} locale={locale} strings={copy} suspend={showModal} />
    </main>
  );
}
