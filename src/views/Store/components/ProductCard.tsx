"use client";

import { Check, ShoppingBag, Zap } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { StoreProductSeed } from "@/data/store-catalog";

export type StoreProduct = StoreProductSeed;

export function ProductCard({
  item,
  owned,
  active,
  onPurchase,
  onApply,
  onDetails,
}: {
  item: StoreProduct;
  owned: boolean;
  active: boolean;
  onPurchase: (item: StoreProduct) => void;
  onApply: (item: StoreProduct) => void;
  onDetails: (item: StoreProduct) => void;
}) {
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:border-line-strong hover:shadow-[var(--shadow-sm)] motion-reduce:transition-none">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sunken">
        <img
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg-inverse)_72%,transparent),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <p className="type-caption m-0 line-clamp-1 text-[var(--text-on-primary)]">
            {item.meta}
          </p>
          {owned ? (
            <Badge tone={active ? "accent" : "success"}>
              {active ? "Applied" : "Owned"}
            </Badge>
          ) : (
            <Badge tone="neutral">{item.price.toLocaleString()} coins</Badge>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="type-caption m-0 text-faint">{item.category}</p>
          <h3 className="type-h4 mt-1 mb-0 text-ink">{item.title}</h3>
          <p className="type-small mt-1.5 mb-0 line-clamp-2 text-muted">
            {item.desc}
          </p>
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            className="min-h-11 flex-1"
            onClick={() => onDetails(item)}
          >
            Details
          </Button>
          {owned ? (
            <Button
              size="sm"
              variant={active ? "outline" : "primary"}
              className="min-h-11 flex-[1.4]"
              onClick={() => onApply(item)}
            >
              {active ? (
                <Check size={16} aria-hidden />
              ) : (
                <Zap size={16} aria-hidden />
              )}
              {active ? "Applied" : "Apply"}
            </Button>
          ) : (
            <Button
              size="sm"
              className="min-h-11 flex-[1.4]"
              onClick={() => onPurchase(item)}
            >
              <ShoppingBag size={16} aria-hidden />
              Unlock
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

export function ProductGrid({
  items,
  purchasedIds,
  activePlugin,
  onPurchase,
  onApply,
  onDetails,
}: {
  items: StoreProduct[];
  purchasedIds: string[];
  activePlugin: string;
  onPurchase: (item: StoreProduct) => void;
  onApply: (item: StoreProduct) => void;
  onDetails: (item: StoreProduct) => void;
}) {
  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          owned={purchasedIds.includes(item.id)}
          active={activePlugin === item.title}
          onPurchase={onPurchase}
          onApply={onApply}
          onDetails={onDetails}
        />
      ))}
    </ul>
  );
}
