import React, { useEffect, useState } from "react";
import { fetchOzonLabel } from "../api/ozonApi";
import { convertPdfBlobToImage } from "../utils/pdfToImage";
import classes from "./Label.module.css";

const splitOzonPostingNumber = (postingNumber) => {
  const normalizedNumber = String(postingNumber || "").trim();

  const firstHyphenIndex = normalizedNumber.indexOf("-");

  if (firstHyphenIndex === -1) {
    return {
      beforeHighlighted: normalizedNumber,
      highlighted: "",
      afterHighlighted: "",
    };
  }

  const firstPart = normalizedNumber.slice(0, firstHyphenIndex);
  const highlighted = firstPart.slice(-4);
  const beforeHighlighted = firstPart.slice(0, -4);
  const afterHighlighted = normalizedNumber.slice(firstHyphenIndex);

  return {
    beforeHighlighted,
    highlighted,
    afterHighlighted,
  };
};

const OzonLabel = ({
  data,
  clientId,
  apiKey,
  ind,
  onLoaded,
  onError,
}) => {
  const [labelImage, setLabelImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const postingNumberParts = splitOzonPostingNumber(data.id);

  useEffect(() => {
    const controller = new AbortController();

    const loadLabel = async () => {
      setIsLoading(true);
      setError(null);
      setLabelImage(null);

      try {
        /*
         * Получаем PDF с этикеткой от Ozon.
         */
        const pdfBlob = await fetchOzonLabel(
          data.id,
          clientId,
          apiKey,
          controller.signal
        );

        /*
         * Превращаем первую страницу PDF в PNG.
         */
        const imageDataUrl = await convertPdfBlobToImage(pdfBlob);

        setLabelImage(imageDataUrl);

        if (onLoaded) {
          onLoaded();
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        console.error(
          `Ошибка загрузки этикетки Ozon ${data.id}:`,
          requestError
        );

        setError(requestError.message);

        if (onError) {
          onError(requestError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadLabel();
    }, ind * 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    data.id,
    clientId,
    apiKey,
    ind,
    onLoaded,
    onError,
  ]);

  return (
    <div className={classes.top}>
      {isLoading && (
        <div className={classes.container}>
          <span className={classes.loader}></span>

          <div className={classes.textLoader}>
            Загружаем этикетку Ozon {data.id}
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className={classes.container}>
          <div className={classes.textLoader}>
            Ошибка загрузки Ozon {data.id}: {error}
          </div>
        </div>
      )}

      {!isLoading && !error && labelImage && (
        <div className={classes.container}>
          <div className={classes.text}>
            <div className={classes.wrapper}>
              <span className={classes.textSpanSuper}>
                {data.article} -{" "}
              </span>

              <span className={classes.textSpan}>
                {data.name} -{" "}
              </span>

              <span className={classes.textSpanSuper}>
                {postingNumberParts.beforeHighlighted}

                {postingNumberParts.highlighted && (
                  <span className={classes.ozonHighlightedDigits}>
                    {postingNumberParts.highlighted}
                  </span>
                )}

                {postingNumberParts.afterHighlighted}
              </span>
            </div>
          </div>

          <img
            className={classes.img}
            src={labelImage}
            alt={`Этикетка Ozon ${data.id}`}
          />
        </div>
      )}
    </div>
  );
};

export default OzonLabel;