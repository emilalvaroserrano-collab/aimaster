export type StudioProduct = {
  code: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  commissionBps: number;
  windowDays: number;
  guidelines: string;
};

export const PRODUCT_CATALOG: StudioProduct[] = [];

export const DEFAULT_POLICY = {
  creatorShareBps: 5000,
  creatorBasis: "net" as const,
  affiliateMemberShareBps: 7000,
  note: "Creator share is half of net eligible revenue received. Affiliate member share is 70% of the merchant commission, not a second membership bonus.",
};

export function productByCode(code: string) {
  return PRODUCT_CATALOG.find((item) => item.code === code) ?? null;
}
