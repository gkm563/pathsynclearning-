"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRightLeft,
  Coins,
  CreditCard,
  Landmark,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  FormField,
  IconButton,
  Input,
  PageHeader,
  PasswordInput,
  Section,
  StatCard,
  useToast,
} from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api";
import { routes } from "@/lib/routes";

type CoinPack = {
  id: string;
  name: string;
  coins: number;
  cost: number;
  popular: boolean;
  badge: string;
};

type CashOutOption = {
  coins: number;
  value: number;
  desc: string;
};

type WalletTx = {
  id: string;
  type: string;
  title: string;
  value: string;
  date: string;
  details: string;
};

const COIN_PACKS: CoinPack[] = [
  {
    id: "pack_starter",
    name: "SDE Starter Refill",
    coins: 500,
    cost: 4.99,
    popular: false,
    badge: "Starter",
  },
  {
    id: "pack_pro",
    name: "Pro Developer Bundle",
    coins: 1500,
    cost: 12.99,
    popular: true,
    badge: "Most Popular",
  },
  {
    id: "pack_elite",
    name: "Elite Builder Pack",
    coins: 3500,
    cost: 24.99,
    popular: false,
    badge: "Best Value",
  },
  {
    id: "pack_mega",
    name: "Mega Vault Refill",
    coins: 8000,
    cost: 49.99,
    popular: false,
    badge: "Ultimate",
  },
];

const CASH_OUT_OPTIONS: CashOutOption[] = [
  { coins: 1000, value: 5.0, desc: "Standard Cashout" },
  { coins: 2000, value: 10.0, desc: "Developer Cashout" },
  { coins: 5000, value: 25.0, desc: "Executive Cashout" },
];

const DEFAULT_TRANSACTIONS: WalletTx[] = [
  {
    id: "t_init",
    type: "system",
    title: "Welcome Bonus",
    value: "+500 Coins",
    date: "Jul 21, 2026",
    details: "Initial platform bonus",
  },
  {
    id: "t_init_cash",
    type: "deposit",
    title: "Account Pre-load",
    value: "+$45.00",
    date: "Jul 22, 2026",
    details: "Dummy balance seed",
  },
];

function mapWalletTx(tx: {
  id?: string;
  kind?: string;
  amount_coins?: number;
  amount_cash?: number | string;
  meta?: Record<string, unknown>;
  created_at?: string;
}): WalletTx {
  const coins = Number(tx.amount_coins) || 0;
  const cash = Number(tx.amount_cash) || 0;
  let value = "—";
  if (coins !== 0) value = coins > 0 ? `+${coins} Coins` : `${coins} Coins`;
  else if (cash !== 0)
    value = cash > 0 ? `+$${cash.toFixed(2)}` : `-$${Math.abs(cash).toFixed(2)}`;

  const date = tx.created_at
    ? new Date(tx.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const title =
    (typeof tx.meta?.title === "string" && tx.meta.title) ||
    (tx.kind ? tx.kind.replace(/_/g, " ") : "Transaction");

  const details =
    (typeof tx.meta?.details === "string" && tx.meta.details) ||
    (tx.meta && Object.keys(tx.meta).length ? JSON.stringify(tx.meta) : "");

  return {
    id: tx.id || `tx_${Date.now()}`,
    type: tx.kind || "system",
    title,
    value,
    date,
    details,
  };
}

export default function WalletExchange() {
  const router = useRouter();
  const toast = useToast();

  const [coins, setCoins] = useState(3480);
  const [cashWallet, setCashWallet] = useState(45.0);
  const [transactions, setTransactions] = useState<WalletTx[]>(DEFAULT_TRANSACTIONS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{
          wallet?: { coins?: number; cash_balance?: number | string };
          transactions?: unknown[];
        }>("/api/me/wallet");
        if (cancelled) return;
        if (data.wallet) {
          setCoins(Number(data.wallet.coins) || 0);
          setCashWallet(Number(data.wallet.cash_balance) || 0);
        }
        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          setTransactions(
            data.transactions.map((tx) =>
              mapWalletTx(tx as Parameters<typeof mapWalletTx>[0]),
            ),
          );
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("20");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");

  const addTransaction = (
    type: string,
    title: string,
    value: string,
    details: string,
  ) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const newTx: WalletTx = {
      id: `tx_${Date.now()}`,
      type,
      title,
      value,
      date: formattedDate,
      details,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDepositSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) {
      toast.error("Invalid deposit amount.");
      return;
    }

    try {
      const result = await apiSend<{
        wallet: { coins: number; cash_balance: string | number };
      }>("/api/me/wallet", "POST", {
        action: "deposit",
        amountCash: val,
      });
      setCashWallet(Number(result.wallet.cash_balance));
      addTransaction(
        "deposit",
        "Deposited Funds",
        `+$${val.toFixed(2)}`,
        "Simulated Card Transaction",
      );
      toast.success(`Deposited $${val.toFixed(2)} to cash wallet.`);
      setShowDepositModal(false);
    } catch {
      toast.error("Could not complete deposit.");
    }
  };

  const handleBuyCoins = async (pack: CoinPack) => {
    if (cashWallet < pack.cost) {
      toast.error({
        title: "Insufficient cash balance",
        description: "Deposit simulated funds first.",
      });
      return;
    }

    try {
      const result = await apiSend<{
        wallet: { coins: number; cash_balance: string | number };
      }>("/api/me/wallet", "POST", {
        action: "buy_coins",
        packId: pack.id,
      });
      setCashWallet(Number(result.wallet.cash_balance));
      setCoins(Number(result.wallet.coins));
      addTransaction(
        "coin_buy",
        `Purchased ${pack.coins} Coins`,
        `-${pack.cost} Cash`,
        `Exchanged Cash to Coins (${pack.name})`,
      );
      toast.success(
        `Purchased ${pack.coins.toLocaleString()} coins.`,
      );
    } catch {
      toast.error("Could not purchase coin pack.");
    }
  };

  const handleCashOut = async (exch: CashOutOption) => {
    if (coins < exch.coins) {
      toast.error("Insufficient coins to convert.");
      return;
    }

    try {
      const exchangeId =
        exch.coins === 1000
          ? "out_1000"
          : exch.coins === 2000
            ? "out_2000"
            : "out_5000";
      const result = await apiSend<{
        wallet: { coins: number; cash_balance: string | number };
      }>("/api/me/wallet", "POST", {
        action: "cash_out",
        exchangeId,
      });
      setCoins(Number(result.wallet.coins));
      setCashWallet(Number(result.wallet.cash_balance));
      addTransaction(
        "cashout",
        "Exchanged Coins to Cash",
        `+$${exch.value.toFixed(2)}`,
        `Converted ${exch.coins.toLocaleString()} Coins`,
      );
      toast.success(
        `Cashed out ${exch.coins.toLocaleString()} coins for $${exch.value.toFixed(2)}.`,
      );
    } catch {
      toast.error("Could not cash out coins.");
    }
  };

  const clearHistory = () => {
    setTransactions([]);
    toast.info("Transaction history cleared.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Store"
        title="Wallet & exchange"
        description="Hold cash credits, buy developer coins, or convert coins back to cash. Checkout is simulated — no real charges."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => router.push(routes.app.store)}
            >
              <ArrowLeft size={16} aria-hidden />
              Back to store
            </Button>
            <Button className="min-h-11" onClick={() => setShowDepositModal(true)}>
              <Plus size={16} aria-hidden />
              Add cash
            </Button>
          </div>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Cash wallet"
          value={`$${cashWallet.toFixed(2)}`}
          hint="Used to buy PathEd developer coins."
          icon={<Landmark size={18} />}
        />
        <StatCard
          label="Coins"
          value={coins.toLocaleString()}
          hint="Redeemable for premium roadmaps, packs, and templates."
          icon={<Coins size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Section
            title="Buy coins"
            description="Spend cash wallet funds to receive coins instantly."
          >
            <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
              {COIN_PACKS.map((pack) => (
                <li key={pack.id} className="min-w-0">
                  <Card className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="type-h3 m-0 text-ink">
                          {pack.coins.toLocaleString()} coins
                        </p>
                        <p className="type-small mt-1 mb-0 text-muted">
                          {pack.name}
                        </p>
                      </div>
                      <Badge tone={pack.popular ? "accent" : "neutral"}>
                        {pack.badge}
                      </Badge>
                    </div>
                    <p className="type-small m-0 text-muted">
                      Credit {pack.coins.toLocaleString()} developer coins to
                      your balance.
                    </p>
                    <Button
                      className="mt-auto min-h-11 w-full"
                      onClick={() => void handleBuyCoins(pack)}
                    >
                      Get pack · ${pack.cost}
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="Exchange coins"
            description="Convert coins back into cash credits."
          >
            <ul className="flex list-none flex-col gap-2 p-0">
              {CASH_OUT_OPTIONS.map((exch) => (
                <li key={exch.coins}>
                  <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunken text-muted">
                        <ArrowRightLeft size={16} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="type-h4 m-0 text-ink">
                          Convert {exch.coins.toLocaleString()} coins
                        </p>
                        <p className="type-small mt-0.5 mb-0 text-muted">
                          {exch.desc} · +${exch.value.toFixed(2)} USD
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="min-h-11 shrink-0"
                      onClick={() => void handleCashOut(exch)}
                    >
                      Cash out
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <Card className="flex min-w-0 flex-col gap-4 lg:self-start">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-muted" aria-hidden />
              <h2 className="type-h4 m-0 text-ink">Transaction history</h2>
            </div>
            {transactions.length > 0 ? (
              <IconButton
                label="Clear transaction history"
                variant="ghost"
                onClick={clearHistory}
              >
                <Trash2 size={16} className="text-danger" aria-hidden />
              </IconButton>
            ) : null}
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              compact
              icon={<Receipt size={18} aria-hidden />}
              title="No transactions"
              description="Deposits, coin packs, and cash-outs will appear here."
            />
          ) : (
            <ul className="m-0 flex max-h-[60vh] list-none flex-col gap-2 overflow-y-auto p-0">
              {transactions.map((tx) => {
                const positive = tx.value.startsWith("+");
                return (
                  <li
                    key={tx.id}
                    className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-sunken px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="type-small m-0 font-semibold text-ink">
                        {tx.title}
                      </p>
                      <p className="type-caption mt-0.5 mb-0 text-muted">
                        {tx.details}
                        {tx.date ? ` · ${tx.date}` : ""}
                      </p>
                    </div>
                    <span
                      className={
                        positive
                          ? "type-caption type-numeric shrink-0 font-semibold text-success"
                          : "type-caption type-numeric shrink-0 font-semibold text-danger"
                      }
                    >
                      {tx.value}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Dialog
        open={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Deposit USD cash credits"
        description="Simulated checkout. No real money is charged."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDepositModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="wallet-deposit-form">
              Authorize deposit
            </Button>
          </>
        }
      >
        <form
          id="wallet-deposit-form"
          onSubmit={(e) => void handleDepositSubmit(e)}
          className="flex flex-col gap-4"
        >
          <Alert tone="info" title="Simulated gateway">
            This is a simulated checkout. No real money will be charged to your
            card.
          </Alert>
          <FormField label="Deposit amount ($ USD)" required>
            {(props) => (
              <Input
                {...props}
                type="number"
                required
                min={5}
                max={1000}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            )}
          </FormField>
          <FormField label="Card number" required>
            {(props) => (
              <Input
                {...props}
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            )}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Expiry date" required>
              {(props) => (
                <Input
                  {...props}
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                />
              )}
            </FormField>
            <FormField label="CVV / CVC" required>
              {(props) => (
                <PasswordInput
                  {...props}
                  required
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                />
              )}
            </FormField>
          </div>
        </form>
      </Dialog>
    </>
  );
}
