import React from "react";
import {
  detectMarketplace,
  MARKETPLACES,
} from "../utils/marketplace";
import WildberriesLabel from "./WildberriesLabel";
import OzonLabel from "./OzonLabel";

const Label = (props) => {
  const marketplace = detectMarketplace(props.data.id);

  switch (marketplace) {
    case MARKETPLACES.WILDBERRIES:
      return <WildberriesLabel {...props} />;

    case MARKETPLACES.OZON:
      return <OzonLabel {...props} />;

    default:
      return (
        <div>
          Не удалось определить маркетплейс для задания {props.data.id}
        </div>
      );
  }
};

export default Label;