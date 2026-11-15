import React from "react";

interface NoDataWidgetProps {
  message?: string;
  imageSrc?: string;
}

const NoDataWidget: React.FC<NoDataWidgetProps> = ({
  message = "No data available at the moment.",
  imageSrc,
}) => {
  return (
    <div className="no-data-widget">
      {imageSrc && (
        <img src={imageSrc} alt="No data" width={250} height={250} />
      )}
      <h6 className="text-center">{message}</h6>
    </div>
  );
};

export default NoDataWidget;
