import React from "react";
import classes from "./Footer.module.css";

const Footer = () => {
  return (
    <div className={classes.wrapper}>
      {/* <div className={classes.dop}></div> */}
      <span className={classes.text}>
        Проект направлен на помощь Селлерам Wildberries и OZON
      </span>
      <span className={classes.text}>Сделал Meexss & Grisha</span>
    </div>
  );
};

export default Footer;
