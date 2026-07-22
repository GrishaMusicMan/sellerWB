export const MARKETPLACES = {
  WILDBERRIES: "wildberries",
  OZON: "ozon",
};

export function detectMarketplace(orderId) {
  const normalizedOrderId = String(orderId).trim();

  if (normalizedOrderId.includes("-")) {
    return MARKETPLACES.OZON;
  }

  return MARKETPLACES.WILDBERRIES;
}