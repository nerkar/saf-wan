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
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-800 hover:bg-stone-50"
      >
        QR (Preview)
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(100vw-2rem,26rem)] rounded-xl border border-stone-200 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-stone-900/50"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            closeDialog();
          }
        }}
      >
        <div
          className="flex max-h-[min(90vh,36rem)] flex-col gap-4 overflow-y-auto p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-stone-900">QR preview</h2>
              <p className="mt-0.5 truncate text-sm text-stone-600" title={productName}>
                {productName}
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              className="shrink-0 rounded-md px-2 py-1 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              aria-label="Close preview"
            >
              <span aria-hidden>×</span>
            </button>
          </div>

          <div className="flex justify-center rounded-lg bg-stone-50 p-4 ring-1 ring-stone-100">
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

          <p className="break-all text-xs leading-relaxed text-stone-500">{verifyUrl}</p>

          <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-4">
            <a
              href={qrSrc}
              download={`qr-${productId}.png`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
            >
              Download PNG
            </a>
            <button
              type="button"
              onClick={closeDialog}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-800 hover:bg-stone-50"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
