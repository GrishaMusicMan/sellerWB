import React, { useEffect, useState } from "react";
import classes from "./Label.module.css";

const Label = (props) => {
  const [data, setData] = useState(null); // Данные по стикерам
  const [isLoading, setIsLoading] = useState(false); // Флаг загрузки

  const initData = async () => {
    if (isLoading) return; // Если уже идёт загрузка, не делаем новый запрос
    setIsLoading(true); // Устанавливаем флаг загрузки

    try {
      const response = await fetch(
        "https://marketplace-api.wildberries.ru/api/v3/orders/stickers?type=png&width=58&height=40",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: props.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orders: [Number(props.data.id)],
          }),
        }
      );
      const info = await response.json();
      setData(info.stickers);
      if (props.onLoaded) props.onLoaded()
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 500); // Минимальная задержка перед следующим запросом
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      initData();
    }, props.ind * 200); // Умножаем индекс на 200 для плавности запросов
    return () => clearTimeout(timer);
  }, [props.data.id]);

  return (
    <div className={classes.top}>
      {data ? (
        <div className={classes.container}>
          <p className={classes.text}>
            <p className={classes.wrapper}>
              <span className={classes.textSpanSuper}>
                {props.data.article} -{" "}
              </span>
              <span className={classes.textSpan}>{props.data.name} - </span>
              <span className={classes.textSpanSuper}>{data[0]?.partB}</span>
            </p>
          </p>
          <img
            className={classes.img}
            src={`data:image/jpeg;base64,${data[0]?.file}`}
            alt="Sticker"
          />
        </div>
      ) : (
        <div className={classes.container}>
          <span className={classes.loader}></span>{" "}
          <div className={classes.textLoader}>Загружаем этикетки</div>
        </div>
      )}
    </div>
  );
};

export default Label;
