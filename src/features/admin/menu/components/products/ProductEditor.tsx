import type { Locale } from "@/shared/i18n";
import { localized } from "@/features/menu/lib/i18n";
import type { MenuAddOn, MenuCategory, MenuIssue, MenuProduct, MenuSize } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { L10nField } from "../fields/L10nField";
import { NumberField } from "../fields/NumberField";
import { SelectField } from "../fields/SelectField";
import { Toggle } from "../fields/Toggle";
import { UrlField } from "../fields/UrlField";
import { RelationPicker } from "./RelationPicker";
import { SizesEditor } from "./SizesEditor";
import { FieldError } from "../fields/FieldError";

interface ProductEditorProps {
  product: MenuProduct;
  index: number;
  categories: MenuCategory[];
  addOns: MenuAddOn[];
  products: MenuProduct[];
  locale: Locale;
  copy: MenuAdminStrings;
  issues: MenuIssue[];
  onChange: (product: MenuProduct) => void;
  onDone: () => void;
  onCancel: () => void;
  onRequestRemoveSize: (size: MenuSize) => void;
}

export function ProductEditor({ product, index, categories, addOns, products, locale, copy, issues, onChange, onDone, onCancel, onRequestRemoveSize }: ProductEditorProps) {
  const base = `products.${index}`;
  const update = (patch: Partial<MenuProduct>) => onChange({ ...product, ...patch });
  const categoryError = issues.some((issue) => issue.path === `${base}.categoryId`) ? copy.referenceInvalid : undefined;
  const priceIssue = issues.find((issue) => issue.path === `${base}.price`);
  const priceError = priceIssue ? priceIssue.code === "integer" ? copy.fieldInvalid : copy.fieldInvalid : undefined;
  const addOnOptions = addOns.map((addOn) => ({ id: addOn.id, label: localized(addOn.name, locale), disabled: !addOn.enabled }));
  const productOptions = products.filter((entry) => entry.id !== product.id).map((entry) => ({ id: entry.id, label: localized(entry.name, locale) }));

  return (
    <section className="grid gap-5 rounded-2xl border border-navy/15 bg-white p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-navy/10 pb-3">
        <div>
          <h3 className="text-subheading font-bold text-navy">{localized(product.name, locale) || copy.productName}</h3>
          <p className="mt-1 break-all text-caption text-navy/45">{product.id}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="min-h-10 rounded-full border border-navy/15 px-4 text-caption font-semibold text-navy hover:bg-mist">{copy.cancel}</button>
          <button type="button" onClick={onDone} className="min-h-10 rounded-full bg-navy px-4 text-caption font-bold text-white hover:bg-navy/90">{copy.save}</button>
        </div>
      </div>

      <L10nField label={copy.productName} value={product.name} onChange={(name) => update({ name })} path={`${base}.name`} issues={issues} copy={copy} maxLength={60} required />
      <L10nField label={copy.description} value={product.description} onChange={(description) => update({ description })} path={`${base}.description`} issues={issues} copy={copy} maxLength={500} multiline />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <SelectField id={`product-${product.id}-category`} label={copy.category} value={product.categoryId} onChange={(categoryId) => update({ categoryId })} options={[{ value: "", label: copy.chooseCategory }, ...categories.map((category) => ({ value: category.id, label: localized(category.title, locale) || category.id }))]} error={categoryError} />
        </div>
        <NumberField id={`product-${product.id}-price`} label={copy.price} value={product.price} onChange={(price) => update({ price })} max={99999999} hint={copy.priceOnRequest} error={priceError} />
      </div>
      <UrlField label={copy.image} value={product.image} onChange={(image) => update({ image })} path={`${base}.image`} issues={issues} copy={copy} hint="Use a root-relative path or HTTPS URL." />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle checked={product.inStock} onChange={(inStock) => update({ inStock })} label={copy.stock} />
        <Toggle checked={product.isNew} onChange={(isNew) => update({ isNew })} label={copy.newBadge} />
      </div>
      <SizesEditor sizes={product.sizes} issues={issues} copy={copy} path={`${base}.sizes`} onChange={(sizes) => update({ sizes })} onRequestRemove={onRequestRemoveSize} />
      <div className="grid gap-4 lg:grid-cols-2">
        <RelationPicker label={copy.addOns} options={addOnOptions} selected={product.baristaAddOns} onChange={(baristaAddOns) => update({ baristaAddOns })} emptyLabel={copy.noAddons} />
        <RelationPicker label={copy.excludedAddOns} options={addOnOptions} selected={product.excludedAddOns} onChange={(excludedAddOns) => update({ excludedAddOns })} emptyLabel={copy.noAddons} />
      </div>
      <RelationPicker label={copy.oftenOrdered} options={productOptions} selected={product.oftenOrderedWith} onChange={(oftenOrderedWith) => update({ oftenOrderedWith })} emptyLabel={copy.noFeaturedProducts} />
      <FieldError message={issues.some((issue) => issue.path === base) ? copy.fieldInvalid : undefined} />
    </section>
  );
}
