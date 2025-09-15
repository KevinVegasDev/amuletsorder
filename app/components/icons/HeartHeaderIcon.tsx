import React from "react";

interface HeartHeaderIconProps {
  className?: string;
  width?: number;
  height?: number;
  fill?: string;
}

const HeartHeaderIcon: React.FC<HeartHeaderIconProps> = ({
  className = "",
  width = 25,
  height = 21,
  fill = "#212121",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      className={className}
      {...props}
    >
      <path
        fill={fill}
        d="M12.571 20.878a.748.748 0 0 1-.364-.094c-.122-.068-3.029-1.697-5.977-4.153-1.748-1.455-3.142-2.898-4.146-4.29C.785 10.542.132 8.81.143 7.196c.012-1.88.71-3.647 1.963-4.977C3.381.866 5.082.122 6.896.122c2.326 0 4.452 1.257 5.675 3.25 1.224-1.993 3.35-3.25 5.675-3.25 1.715 0 3.35.671 4.606 1.892 1.378 1.338 2.16 3.23 2.148 5.19-.01 1.612-.676 3.34-1.977 5.139-1.007 1.39-2.4 2.833-4.14 4.288-2.938 2.455-5.824 4.084-5.945 4.152a.749.749 0 0 1-.367.095Z"
      />
    </svg>
  );
};

export default HeartHeaderIcon;
