"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookmarkCheck,
  Check,
  Coins,
  Compass,
  CreditCard,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import {
  Alert,
  Button,
  CardGridSkeleton,
  ConfirmDialog,
  DescriptionList,
  Dialog,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  TabPanel,
  Tabs,
  Toolbar,
  useToast,
} from "@/components/ui";
import { STORE_CATALOG } from "@/data/store-catalog";
import { apiGet, apiSend } from "@/lib/api";
import { routes } from "@/lib/routes";
import { ProductGrid, type StoreProduct } from "./components/ProductCard";

type StoreTab = "browse" | "purchased";

export default function Store() {
  const router = useRouter();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<StoreTab>("browse");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");

  const [catalog, setCatalog] = useState<StoreProduct[]>(STORE_CATALOG);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [activePlugin, setActivePlugin] = useState("None");
  const [cashWallet, setCashWallet] = useState(0);

  const [purchasingItem, setPurchasingItem] = useState<StoreProduct | null>(
    null,
  );
  const [applyingItem, setApplyingItem] = useState<StoreProduct | null>(null);
  const [viewingDetailItem, setViewingDetailItem] =
    useState<StoreProduct | null>(null);

  const loadStore = async (signal?: { cancelled: boolean }) => {
    setLoadingCatalog(true);
    setCatalogError(null);
    try {
      const [store, wallet] = await Promise.all([
        apiGet<{
          products: StoreProduct[];
          purchasedIds: string[];
          activePlugin: string | null;
        }>("/api/store/products"),
        apiGet<{
          wallet: { coins: number; cash_balance: string | number };
        }>("/api/me/wallet").catch(() => null),
      ]);
      if (signal?.cancelled) return;
      if (store.products?.length) setCatalog(store.products);
      else setCatalog(STORE_CATALOG);
      setPurchasedIds(store.purchasedIds || []);
      setActivePlugin(store.activePlugin || "None");
      if (wallet?.wallet) {
        setCoins(Number(wallet.wallet.coins) || 0);
        setCashWallet(Number(wallet.wallet.cash_balance) || 0);
      }
    } catch (err) {
      if (signal?.cancelled) return;
      setCatalog(STORE_CATALOG);
      setCatalogError(
        err instanceof Error ? err.message : "Couldn't load the store catalog.",
      );
    } finally {
      if (!signal?.cancelled) setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    const signal = { cancelled: false };
    void loadStore(signal);
    return () => {
      signal.cancelled = true;
    };
  }, []);

  const handlePurchaseClick = (item: StoreProduct) => {
    if (purchasedIds.includes(item.id)) {
      toast.info("You already own this item.");
      return;
    }
    setPurchasingItem(item);
  };

  const handleConfirmPurchase = async () => {
    if (!purchasingItem) return;

    if (coins < purchasingItem.price) {
      toast.error({
        title: "Insufficient coins",
        description: "Refill coins in the wallet or complete challenges.",
        action: {
          label: "Open wallet",
          onClick: () => router.push(routes.app.wallet),
        },
      });
      setPurchasingItem(null);
      return;
    }

    try {
      const result = await apiSend<{ ok: boolean; coins: number }>(
        "/api/store/products",
        "POST",
        { productId: purchasingItem.id },
      );
      setCoins(Number(result.coins));
      setPurchasedIds((prev) =>
        prev.includes(purchasingItem.id) ? prev : [...prev, purchasingItem.id],
      );
      toast.success({
        title: `Purchased ${purchasingItem.title}`,
        description: "Find it under Purchased packs.",
        action: { label: "View", onClick: () => setActiveTab("purchased") },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purchase failed.");
    }
    setPurchasingItem(null);
  };

  const handleApplyClick = (item: StoreProduct) => {
    setApplyingItem(item);
  };

  const handleConfirmApply = async () => {
    if (!applyingItem) return;

    if (applyingItem.category === "AI Marketplace Modules") {
      try {
        await apiSend("/api/me/settings", "PUT", {
          activePlugin: applyingItem.title,
        });
        setActivePlugin(applyingItem.title);
      } catch {
        setActivePlugin(applyingItem.title);
      }
    }

    toast.success(`Applied ${applyingItem.title} to your student profile.`);
    setApplyingItem(null);
  };

  const handleClearPlugin = async () => {
    try {
      await apiSend("/api/me/settings", "PUT", { activePlugin: null });
    } catch {
      // keep UI responsive
    }
    setActivePlugin("None");
    toast.info("System profile reset to default configuration.");
  };

  const categories = useMemo(
    () => ["All", ...new Set(catalog.map((item) => item.category))],
    [catalog],
  );

  const matchesQuery = (item: StoreProduct) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.meta.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  };

  const browseItems = catalog.filter((item) => {
    if (selectedCategory !== "All" && item.category !== selectedCategory) {
      return false;
    }
    return matchesQuery(item);
  });

  const purchasedItems = catalog.filter(
    (item) => purchasedIds.includes(item.id) && matchesQuery(item),
  );

  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Resource store"
        description="Redeem coins earned from challenges and roadmap milestones to unlock blueprints, planners, modules, and platform upgrades."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => router.push(routes.app.wallet)}
            >
              <Coins size={16} aria-hidden />
              {coins.toLocaleString()} coins
            </Button>
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => router.push(routes.app.wallet)}
            >
              <CreditCard size={16} aria-hidden />
              ${cashWallet.toFixed(2)} cash
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => router.push(routes.app.wallet)}
            >
              <Wallet size={16} aria-hidden />
              Wallet
            </Button>
          </div>
        }
      />

      {activePlugin !== "None" ? (
        <Alert
          title="Active module"
          tone="info"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{activePlugin} is applied to your profile recommendations.</span>
            <Button variant="ghost" size="sm" onClick={() => void handleClearPlugin()}>
              Reset to default
            </Button>
          </div>
        </Alert>
      ) : null}

      <Tabs<StoreTab>
        items={[
          { id: "browse", label: "Browse", icon: <Compass size={16} aria-hidden /> },
          {
            id: "purchased",
            label: "Purchased",
            icon: <BookmarkCheck size={16} aria-hidden />,
            badge: purchasedIds.length,
          },
        ]}
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel="Store sections"
        className="mt-6 mb-6"
      />

      {catalogError && catalog.length === 0 ? (
        <ErrorState
          title="Couldn't load the store"
          description="The catalog didn't come back. Retry, and if it keeps failing the store is temporarily unavailable."
          detail={catalogError}
          action={
            <Button variant="secondary" onClick={() => void loadStore()}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <Toolbar>
            <SearchInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search packs, roadmaps, modules"
              aria-label="Search store catalog"
              className="basis-full sm:basis-72"
            />
            {activeTab === "browse" ? (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? "primary" : "ghost"}
                    className="min-h-11"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            ) : null}
          </Toolbar>

          <TabPanel active={activeTab === "browse"}>
            {loadingCatalog ? (
              <CardGridSkeleton count={6} withMedia />
            ) : browseItems.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag size={20} aria-hidden />}
                title="No packs match"
                description="Try another category or clear the search to see the full catalog."
                action={
                  query || selectedCategory !== "All" ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setQuery("");
                        setSelectedCategory("All");
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ProductGrid
                items={browseItems}
                purchasedIds={purchasedIds}
                activePlugin={activePlugin}
                onPurchase={handlePurchaseClick}
                onApply={handleApplyClick}
                onDetails={setViewingDetailItem}
              />
            )}
          </TabPanel>

          <TabPanel active={activeTab === "purchased"}>
            {loadingCatalog ? (
              <CardGridSkeleton count={3} withMedia />
            ) : purchasedItems.length === 0 ? (
              <EmptyState
                icon={<BookmarkCheck size={20} aria-hidden />}
                title="No purchases yet"
                description="Unlock modules, planners, and templates in Browse using your student coins."
                action={
                  <Button onClick={() => setActiveTab("browse")}>
                    Browse store
                  </Button>
                }
              />
            ) : (
              <ProductGrid
                items={purchasedItems}
                purchasedIds={purchasedIds}
                activePlugin={activePlugin}
                onPurchase={handlePurchaseClick}
                onApply={handleApplyClick}
                onDetails={setViewingDetailItem}
              />
            )}
          </TabPanel>
        </>
      )}

      <Dialog
        open={Boolean(purchasingItem)}
        onClose={() => setPurchasingItem(null)}
        title="Confirm unlock"
        description={
          purchasingItem
            ? `Unlock ${purchasingItem.title} with student coins.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setPurchasingItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmPurchase()}
              disabled={
                !purchasingItem || coins < purchasingItem.price
              }
            >
              Confirm unlock
            </Button>
          </>
        }
      >
        {purchasingItem ? (
          <div className="flex flex-col gap-4">
            {coins < purchasingItem.price ? (
              <Alert tone="error" title="Insufficient coins">
                Exchange USD to coins in the wallet before unlocking.
              </Alert>
            ) : null}
            <DescriptionList
              items={[
                {
                  label: "Current balance",
                  value: `${coins.toLocaleString()} coins`,
                },
                {
                  label: "Pack price",
                  value: `−${purchasingItem.price.toLocaleString()} coins`,
                },
                {
                  label: "Remaining",
                  value: `${(coins - purchasingItem.price).toLocaleString()} coins`,
                },
              ]}
            />
          </div>
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={Boolean(applyingItem)}
        onClose={() => setApplyingItem(null)}
        onConfirm={handleConfirmApply}
        title="Apply resource to profile"
        description={
          applyingItem
            ? `Apply ${applyingItem.title} to your account path context. This calibrates roadmap recommendations, daily challenge constraints, and dashboard widgets for ${applyingItem.meta}.`
            : undefined
        }
        confirmLabel="Confirm and apply"
      />

      <Dialog
        open={Boolean(viewingDetailItem)}
        onClose={() => setViewingDetailItem(null)}
        title={viewingDetailItem?.title ?? "Pack specifications"}
        description={viewingDetailItem?.meta}
        size="lg"
        footer={
          viewingDetailItem ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setViewingDetailItem(null)}
              >
                Close
              </Button>
              {purchasedIds.includes(viewingDetailItem.id) ? (
                <Button
                  onClick={() => {
                    const item = viewingDetailItem;
                    setViewingDetailItem(null);
                    handleApplyClick(item);
                  }}
                >
                  Apply to profile
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const item = viewingDetailItem;
                    setViewingDetailItem(null);
                    handlePurchaseClick(item);
                  }}
                >
                  Unlock for {viewingDetailItem.price.toLocaleString()} coins
                </Button>
              )}
            </>
          ) : null
        }
      >
        {viewingDetailItem ? (
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-line bg-sunken">
              <img
                src={viewingDetailItem.image}
                alt=""
                className="aspect-[16/7] w-full object-cover"
              />
            </div>
            <p className="type-body m-0 text-muted">{viewingDetailItem.desc}</p>
            {viewingDetailItem.included?.length ? (
              <div>
                <h3 className="type-label m-0 text-ink">What&apos;s included</h3>
                <ul className="mt-2 mb-0 flex list-none flex-col gap-2 p-0">
                  {viewingDetailItem.included.map((inc) => (
                    <li key={inc} className="flex gap-2 text-muted">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-success"
                        aria-hidden
                      />
                      <span className="type-small">{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
