"use client";

import { useRef } from "react";

type Props = {
  productId: string;
  productName: string;
  verifyUrl: string;
};

export function QrPngPreviewButton({ productId, productName, verifyUrl }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const qrSrc = `/api/products/${productId}/qr`;

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="craft-btn-secondary min-h-[44px] px-3 py-2 text-sm"
      >
        QR (Preview)
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(100vw-2rem,26rem)] rounded-2xl border border-[var(--craft-border)] bg-[var(--craft-surface)] p-0 text-[var(--craft-ink)] shadow-2xl backdrop:bg-[var(--craft-ink)]/40"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            closeDialog();
          }
        }}
      >
        <div
          className="flex max-h-[min(90vh,36rem)] flex-col gap-4 overflow-y-auto p-5 sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="craft-heading text-lg">QR preview</h2>
              <p className="mt-0.5 truncate text-sm text-[var(--craft-muted)]" title={productName}>
                {productName}
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              className="craft-btn-ghost shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-stone-500"
              aria-label="Close preview"
            >
              <span aria-hidden>×</span>
            </button>
          </div>

          <div className="flex justify-center rounded-xl bg-[var(--craft-surface-muted)] p-4 ring-1 ring-[var(--craft-border)]">
            {/* API route returns PNG; no next/image sizing benefits for dynamic QR */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt={`QR code for ${productName} verification page`}
              width={280}
              height={280}
              className="h-auto max-w-full"
            />
          </div>

          <p className="break-all text-xs leading-relaxed text-[var(--craft-muted)]">{verifyUrl}</p>

          <div className="craft-divider flex flex-wrap gap-2 pt-2">
            <a
              href={qrSrc}
              download={`qr-${productId}.png`}
              className="craft-btn-primary min-h-[44px] px-4 text-sm"
            >
              Download PNG
            </a>
            <button
              type="button"
              onClick={closeDialog}
              className="craft-btn-secondary min-h-[44px] px-4 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
