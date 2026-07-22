import React, { useEffect, useState } from "react";
import { fetchWildberriesSticker } from "../api/wildberriesApi";
import classes from "./Label.module.css";

const WildberriesLabel = ({
  data,
  token,
  ind,
  onLoaded,
  onError,
}) => {
  const [sticker, setSticker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSticker = async () => {
      setIsLoading(true);
      setError(null);
      setSticker(null);

      try {
        const loadedSticker = await fetchWildberriesSticker(
          data.id,
          token,
          controller.signal
        );

        setSticker(loadedSticker);

        if (onLoaded) {
          onLoaded();
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        console.error(
          `Ошибка загрузки этикетки ${data.id}:`,
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
      loadSticker();
    }, ind * 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [data.id, ind, token, onLoaded, onError]);

  return (
    <div className={classes.top}>
      {isLoading && (
        <div className={classes.container}>
          <span className={classes.loader}></span>
          <div className={classes.textLoader}>Загружаем этикетку</div>
        </div>
      )}

      {!isLoading && error && (
        <div className={classes.container}>
          <div className={classes.textLoader}>
            Ошибка загрузки задания {data.id}: {error}
          </div>
        </div>
      )}

      {!isLoading && !error && sticker && (
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
                {sticker.partB}
              </span>
            </div>
          </div>

          <img
            className={classes.img}
            src={`data:image/png;base64,${sticker.file}`}
            alt={`Этикетка задания ${data.id}`}
          />
        </div>
      )}
    </div>
  );
};

export default WildberriesLabel;