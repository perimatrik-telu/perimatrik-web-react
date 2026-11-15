import React from "react";

interface NoDataWidgetProps {
  message?: string;
  imageSrc?: string;
}

export const NoDataWidget: React.FC<NoDataWidgetProps> = ({
  message = "No data available at the moment.",
  imageSrc, // Image is now optional
}) => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {imageSrc && ( // Conditionally render the image
        <img
          src={imageSrc}
          alt="No data"
          width={250}
          height={250}
          style={{ marginBottom: "20px" }}
        />
      )}
      <h6>{message}</h6>
    </div>
  );
};


