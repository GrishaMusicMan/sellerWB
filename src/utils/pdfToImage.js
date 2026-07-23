import {
  getDocument,
  GlobalWorkerOptions,
} from "pdfjs-dist/legacy/build/pdf";

import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

GlobalWorkerOptions.workerSrc = pdfWorker;

export async function convertPdfBlobToImage(pdfBlob) {
  if (!pdfBlob) {
    throw new Error("Не получен PDF-файл этикетки Ozon");
  }

  const pdfData = await pdfBlob.arrayBuffer();

  const loadingTask = getDocument({
    data: pdfData,
  });

  const pdfDocument = await loadingTask.promise;

  if (pdfDocument.numPages < 1) {
    throw new Error("PDF Ozon не содержит страниц");
  }

  const page = await pdfDocument.getPage(1);

  /*
   * scale = 2 делает изображение достаточно чётким
   * для просмотра и печати.
   */
  const viewport = page.getViewport({
    scale: 4,
  });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Не удалось создать canvas для этикетки Ozon");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  const imageDataUrl = canvas.toDataURL("image/png");

  await pdfDocument.destroy();

  return imageDataUrl;
}