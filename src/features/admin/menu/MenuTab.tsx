import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/shared/i18n";
import { useLocale } from "@/shared/i18n";
import type { MenuAddOn, MenuCategory, MenuData, MenuPairing, MenuProduct, MenuSize } from "@/features/menu/types";
import { Toast } from "../components/Toast";
import { AddOnEditor } from "./components/addons/AddOnEditor";
import { AddOnList } from "./components/addons/AddOnList";
import { CategoryEditor } from "./components/categories/CategoryEditor";
import { CategoryList } from "./components/categories/CategoryList";
import { ConfirmActionDialog } from "./components/ConfirmActionDialog";
import { ConflictDialog } from "./components/ConflictDialog";
import { MenuHeader } from "./components/MenuHeader";
import { MenuStates } from "./components/MenuStates";
import { PairingsEditor } from "./components/featured/PairingsEditor";
import { SignaturesEditor } from "./components/featured/SignaturesEditor";
import { PopupEditor } from "./components/popup/PopupEditor";
import { ProductEditor } from "./components/products/ProductEditor";
import { ProductList } from "./components/products/ProductList";
import { PublishBar } from "./components/PublishBar";
import { SectionSwitcher } from "./components/SectionSwitcher";
import { strings } from "./data/strings";
import { createMenuId } from "./config";
import { discardMenuDraft, importStarterMenu, keepMenuDraft, loadMenuDraft, publishMenuDraft, reloadLatestMenu, updateMenuDraft } from "./menuDraft";
import type { MenuSection } from "./types";
import { useMenuDraft } from "./hooks/useMenuDraft";

void loadMenuDraft();

type EditingItem = { kind: "product" | "category" | "addon"; id: string; original: MenuData };
type ConfirmAction = { title: string; message: string; confirmLabel: string; action: () => void };

function moveItem<T extends { id: string; sortOrder: number }>(items: T[], id: string, direction: -1 | 1): T[] {
  const next = [...items];
  const index = next.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= next.length) return items;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, sortOrder) => ({ ...item, sortOrder }));
}

function emptyProduct(sortOrder: number): MenuProduct {
  return { id: createMenuId("product"), categoryId: "", name: { en: "", ar: "" }, description: { en: "", ar: "" }, price: null, sizes: [], image: "", baristaAddOns: [], excludedAddOns: [], oftenOrderedWith: [], isNew: false, inStock: true, sortOrder };
}

function emptyCategory(sortOrder: number): MenuCategory {
  return { id: createMenuId("category"), kind: "drink", pill: { en: "", ar: "" }, title: { en: "", ar: "" }, subtitle: { en: "", ar: "" }, image: "", sortOrder };
}

function emptyAddOn(sortOrder: number): MenuAddOn {
  return { id: createMenuId("addon"), name: { en: "", ar: "" }, price: 0, appliesTo: "all", enabled: true, sortOrder };
}

export function MenuTab() {
  const locale = useLocale();
  const copy = strings[locale];
  const state = useMenuDraft();
  const [section, setSection] = useState<MenuSection>("products");
  const [editing, setEditing] = useState<EditingItem | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmAction | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "default" | "error" } | null>(null);
  const draft = state.draft;
  const categoryCounts = useMemo(() => draft.products.reduce<Record<string, number>>((counts, product) => {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    return counts;
  }, {}), [draft.products]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const announce = (message: string, tone: "default" | "error" = "default") => setToast({ message, tone });
  const ask = (title: string, message: string, confirmLabel: string, action: () => void) => setConfirmation({ title, message, confirmLabel, action });
  const closeEditor = () => setEditing(null);
  const cancelEditor = () => {
    if (!editing) return;
    if (JSON.stringify(state.draft) === JSON.stringify(editing.original)) {
      setEditing(null);
      return;
    }
    ask(copy.confirmTitle, copy.confirmDelete, copy.discard, () => {
      updateMenuDraft(() => editing.original);
      setEditing(null);
    });
  };

  const addProduct = () => {
    const original = structuredClone(draft);
    const product = emptyProduct(draft.products.length);
    updateMenuDraft((menu) => ({ ...menu, products: [...menu.products, product] }));
    setSection("products");
    setEditing({ kind: "product", id: product.id, original });
  };
  const addCategory = () => {
    const original = structuredClone(draft);
    const category = emptyCategory(draft.categories.length);
    updateMenuDraft((menu) => ({ ...menu, categories: [...menu.categories, category] }));
    setSection("categories");
    setEditing({ kind: "category", id: category.id, original });
  };
  const addAddOn = () => {
    const original = structuredClone(draft);
    const addOn = emptyAddOn(draft.addOns.length);
    updateMenuDraft((menu) => ({ ...menu, addOns: [...menu.addOns, addOn] }));
    setSection("addons");
    setEditing({ kind: "addon", id: addOn.id, original });
  };

  const requestProductDelete = (product: MenuProduct) => ask(copy.confirmTitle, copy.confirmDelete, copy.delete, () => {
    updateMenuDraft((menu) => ({
      ...menu,
      signatures: menu.signatures.filter((id) => id !== product.id),
      pairings: menu.pairings.filter((pairing) => !pairing.items.includes(product.id)).map((item, sortOrder) => ({ ...item, sortOrder })),
      products: menu.products.filter((item) => item.id !== product.id).map((item, sortOrder) => ({ ...item, oftenOrderedWith: item.oftenOrderedWith.filter((id) => id !== product.id), sortOrder })),
    }));
  });
  const requestCategoryDelete = (category: MenuCategory) => {
    if ((categoryCounts[category.id] ?? 0) > 0) {
      announce(copy.categoryInUse, "error");
      return;
    }
    ask(copy.confirmTitle, copy.confirmDelete, copy.delete, () => updateMenuDraft((menu) => ({ ...menu, categories: menu.categories.filter((item) => item.id !== category.id).map((item, sortOrder) => ({ ...item, sortOrder })) })));
  };
  const requestAddOnDelete = (addOn: MenuAddOn) => ask(copy.confirmTitle, copy.confirmDelete, copy.delete, () => updateMenuDraft((menu) => ({
    ...menu,
    addOns: menu.addOns.filter((item) => item.id !== addOn.id).map((item, sortOrder) => ({ ...item, sortOrder })),
    products: menu.products.map((product) => ({ ...product, baristaAddOns: product.baristaAddOns.filter((id) => id !== addOn.id), excludedAddOns: product.excludedAddOns.filter((id) => id !== addOn.id) })),
  })));

  const requestDiscard = () => ask(copy.confirmTitle, copy.confirmDelete, copy.discard, discardMenuDraft);
  const requestImport = () => ask(copy.confirmTitle, copy.confirmImport, copy.importStarter, () => {
    importStarterMenu();
    setEditing(null);
  });
  const publish = async () => {
    const outcome = await publishMenuDraft();
    if (outcome.status === "saved") announce(copy.publishSuccess);
    else if (outcome.status === "invalid") announce(copy.validationSummary, "error");
    else if (outcome.status === "error") announce(copy.publishError, "error");
  };

  const product = editing?.kind === "product" ? draft.products.find((item) => item.id === editing.id) : undefined;
  const category = editing?.kind === "category" ? draft.categories.find((item) => item.id === editing.id) : undefined;
  const addOn = editing?.kind === "addon" ? draft.addOns.find((item) => item.id === editing.id) : undefined;
  const productIndex = product ? draft.products.findIndex((item) => item.id === product.id) : -1;
  const categoryIndex = category ? draft.categories.findIndex((item) => item.id === category.id) : -1;
  const addOnIndex = addOn ? draft.addOns.findIndex((item) => item.id === addOn.id) : -1;
  const stringsLocale = locale as Locale;

  return (
    <section dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} className="flex h-full min-h-0 flex-col bg-mist">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto grid w-full max-w-6xl gap-5">
          <MenuHeader draft={draft} published={state.published} dirty={state.dirty} locale={stringsLocale} copy={copy} />
          <MenuStates status={state.status} message={state.loadError} copy={copy} onRetry={() => { void loadMenuDraft(true); }} />
          {state.status === "ready" && <>
            <SectionSwitcher active={section} copy={copy} onChange={setSection} />
            {state.issues.length > 0 && <div className="rounded-2xl border border-error/15 bg-error/5 p-4 text-caption text-error" role="alert"><p className="font-bold">{copy.validationSummary}</p><ul className="mt-2 grid gap-1">{state.issues.slice(0, 8).map((issue, index) => <li key={`${issue.path}-${issue.code}-${index}`} className="break-all">{issue.path || "menu"}: {copy.fieldInvalid}</li>)}</ul></div>}
            {section === "products" && (product ? <ProductEditor product={product} index={productIndex} categories={draft.categories} addOns={draft.addOns} products={draft.products} locale={stringsLocale} copy={copy} issues={state.issues} onChange={(next) => updateMenuDraft((menu) => ({ ...menu, products: menu.products.map((item) => item.id === next.id ? next : item) }))} onDone={closeEditor} onCancel={cancelEditor} onRequestRemoveSize={(size: MenuSize) => ask(copy.confirmTitle, copy.confirmDelete, copy.delete, () => updateMenuDraft((menu) => ({ ...menu, products: menu.products.map((item) => item.id === product.id ? { ...item, sizes: item.sizes.filter((entry) => entry.id !== size.id).map((entry, sortOrder) => ({ ...entry, sortOrder })) } : item) })))} /> : <ProductList products={draft.products} categories={draft.categories} locale={stringsLocale} copy={copy} onAdd={addProduct} onEdit={(item) => setEditing({ kind: "product", id: item.id, original: structuredClone(draft) })} onDelete={requestProductDelete} onMove={(id, direction) => updateMenuDraft((menu) => ({ ...menu, products: moveItem(menu.products, id, direction) }))} />)}
            {section === "categories" && (category ? <CategoryEditor category={category} index={categoryIndex} locale={stringsLocale} copy={copy} issues={state.issues} onChange={(next) => updateMenuDraft((menu) => ({ ...menu, categories: menu.categories.map((item) => item.id === next.id ? next : item) }))} onDone={closeEditor} onCancel={cancelEditor} /> : <CategoryList categories={draft.categories} locale={stringsLocale} copy={copy} productCounts={categoryCounts} onAdd={addCategory} onEdit={(item) => setEditing({ kind: "category", id: item.id, original: structuredClone(draft) })} onDelete={requestCategoryDelete} onMove={(id, direction) => updateMenuDraft((menu) => ({ ...menu, categories: moveItem(menu.categories, id, direction) }))} />)}
            {section === "addons" && (addOn ? <AddOnEditor addOn={addOn} index={addOnIndex} locale={stringsLocale} copy={copy} issues={state.issues} onChange={(next) => updateMenuDraft((menu) => ({ ...menu, addOns: menu.addOns.map((item) => item.id === next.id ? next : item) }))} onDone={closeEditor} onCancel={cancelEditor} /> : <AddOnList addOns={draft.addOns} locale={stringsLocale} copy={copy} onAdd={addAddOn} onEdit={(item) => setEditing({ kind: "addon", id: item.id, original: structuredClone(draft) })} onDelete={requestAddOnDelete} onMove={(id, direction) => updateMenuDraft((menu) => ({ ...menu, addOns: moveItem(menu.addOns, id, direction) }))} />)}
            {section === "featured" && <div className="grid gap-4"><SignaturesEditor products={draft.products} selected={draft.signatures} locale={stringsLocale} copy={copy} onChange={(signatures) => updateMenuDraft((menu) => ({ ...menu, signatures }))} /><PairingsEditor pairings={draft.pairings} products={draft.products} locale={stringsLocale} copy={copy} issues={state.issues} onChange={(pairings) => updateMenuDraft((menu) => ({ ...menu, pairings }))} onRequestRemove={(pairing: MenuPairing) => ask(copy.confirmTitle, copy.confirmDelete, copy.delete, () => updateMenuDraft((menu) => ({ ...menu, pairings: menu.pairings.filter((item) => item.id !== pairing.id).map((item, sortOrder) => ({ ...item, sortOrder })) })))} /></div>}
            {section === "popup" && <PopupEditor popup={draft.popup} locale={stringsLocale} copy={copy} issues={state.issues} onChange={(popup) => updateMenuDraft((menu) => ({ ...menu, popup }))} />}
          </>}
          {state.status === "ready" && <PublishBar dirty={state.dirty} saving={state.saving} issues={state.issues} copy={copy} onImport={requestImport} onDiscard={requestDiscard} onPublish={() => { void publish(); }} />}
        </div>
      </div>
      <Toast message={toast?.message ?? null} tone={toast?.tone} dismissLabel={copy.close} onDismiss={() => setToast(null)} />
      <ConflictDialog open={state.conflictOpen} revision={state.conflictRevision} copy={copy} onReload={() => { void reloadLatestMenu(); }} onKeepEditing={keepMenuDraft} />
      <ConfirmActionDialog open={Boolean(confirmation)} title={confirmation?.title ?? copy.confirmTitle} message={confirmation?.message ?? copy.confirmDelete} confirmLabel={confirmation?.confirmLabel ?? copy.delete} cancelLabel={copy.cancel} onCancel={() => setConfirmation(null)} onConfirm={() => { const action = confirmation?.action; setConfirmation(null); action?.(); }} />
    </section>
  );
}
