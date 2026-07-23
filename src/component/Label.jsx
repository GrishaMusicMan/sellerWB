import React from "react";
import WildberriesLabel from "./WildberriesLabel";
import OzonLabel from "./OzonLabel";
import {
  detectMarketplace,
  MARKETPLACES,
} from "../utils/marketplace";

const Label = (props) => {
  const marketplace = detectMarketplace(props.data.id);

  switch (marketplace) {
    case MARKETPLACES.WILDBERRIES:
      return (
        <WildberriesLabel
          data={props.data}
          token={props.token}
          ind={props.ind}
          onLoaded={props.onLoaded}
          onError={props.onError}
        />
      );

    case MARKETPLACES.OZON:
      return (
        <OzonLabel
          data={props.data}
          clientId={props.ozonClientId}
          apiKey={props.ozonApiKey}
          ind={props.ind}
          onLoaded={props.onLoaded}
          onError={props.onError}
        />
      );

    default:
      return null;
  }
};

export default Label;