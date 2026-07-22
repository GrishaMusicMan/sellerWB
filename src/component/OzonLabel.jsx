import React from "react";
import classes from "./Label.module.css";

const OzonLabel = ({ data }) => {
  return (
    <div className={classes.top}>
      <div className={classes.container}>
        <div className={classes.text}>
          <div className={classes.wrapper}>
            <span className={classes.textSpanSuper}>
              Ozon
            </span>

            <span className={classes.textSpan}>
              Отправление: {data.id}
            </span>

            {data.article && (
              <span className={classes.textSpanSuper}>
                Артикул: {data.article}
              </span>
            )}

            {data.name && (
              <span className={classes.textSpan}>
                {data.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OzonLabel;