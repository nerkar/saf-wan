type Props = {
  shopAddress: string | null;
  marketplaceUrl: string | null;
  className?: string;
};

const MARKETPLACE_LINK_DISPLAY_MAX = 50;
const MARKETPLACE_ELLIPSIS = "...";

function truncateMarketplaceLabel(url: string): string {
  if (url.length <= MARKETPLACE_LINK_DISPLAY_MAX) {
    return url;
  }
  const keep = MARKETPLACE_LINK_DISPLAY_MAX - MARKETPLACE_ELLIPSIS.length;
  return `${url.slice(0, keep)}${MARKETPLACE_ELLIPSIS}`;
}

/**
 * Shared block for physical shop + online marketplace (home, dashboard, verify).
 */
export function ProductShopAndMarketplace({
  shopAddress,
  marketplaceUrl,
  className = "",
}: Props) {
  if (!shopAddress && !marketplaceUrl) {
    return null;
  }

  return (
    <div className={`space-y-1.5 text-sm text-stone-600 ${className}`.trim()}>
      {shopAddress ? (
        <p className="text-pretty">
          <span className="font-medium text-stone-700">Shop address</span>
          <span className="text-stone-500"> · </span>
          {shopAddress}
        </p>
      ) : null}
      {marketplaceUrl ? (
        <p className="min-w-0">
          <span className="font-medium text-stone-700">Marketplace</span>
          <span className="text-stone-500"> · </span>
          <a
            href={marketplaceUrl}
            title={marketplaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-800 underline decoration-stone-300 underline-offset-2 hover:text-stone-900"
          >
            {truncateMarketplaceLabel(marketplaceUrl)}
          </a>
        </p>
      ) : null}
    </div>
  );
}
