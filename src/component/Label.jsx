import React, { useEffect, useState } from "react";
import { fetchWildberriesSticker } from "../api/wildberriesApi";
import classes from "./Label.module.css";

const Label = (props) => {
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
          props.data.id,
          props.token,
          controller.signal
        );

        setSticker(loadedSticker);

        if (props.onLoaded) {
          props.onLoaded();
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        console.error(
          `Ошибка загрузки этикетки ${props.data.id}:`,
          requestError
        );

        setError(requestError.message);

        if (props.onError) {
          props.onError(requestError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadSticker();
    }, props.ind * 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [props.data.id, props.ind, props.token]);

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
            Ошибка загрузки задания {props.data.id}: {error}
          </div>
        </div>
      )}

      {!isLoading && !error && sticker && (
        <div className={classes.container}>
          <div className={classes.text}>
            <div className={classes.wrapper}>
              <span className={classes.textSpanSuper}>
                {props.data.article} -{" "}
              </span>

              <span className={classes.textSpan}>
                {props.data.name} -{" "}
              </span>

              <span className={classes.textSpanSuper}>
                {sticker.partB}
              </span>
            </div>
          </div>

          <img
            className={classes.img}
            src={`data:image/png;base64,${sticker.file}`}
            alt={`Этикетка задания ${props.data.id}`}
          />
        </div>
      )}
    </div>
  );
};

export default Label;