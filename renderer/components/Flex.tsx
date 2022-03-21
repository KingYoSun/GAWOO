import { MutableRefObject, ReactNode } from "react";
import { Box } from "@mui/material";

const FlexRow = ({
  children,
  alignItems = "center",
  flexDirection = "row",
  justifyContent = "center",
  width = "100%",
  maxWidth = "100%",
  marginTop = "4px",
  marginBottom = "4px",
  marginLeft = "0px",
  marginRight = "0px",
  flexRef = null,
  ...props
}: {
  children: ReactNode;
  alignItems?: string;
  flexDirection?: string;
  justifyContent?: string;
  width?: string | number;
  maxWidth?: string | number;
  marginTop?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  marginRight?: string | number;
  flexRef?: MutableRefObject<any>;
}) => {
  return (
    <Box
      display="flex"
      alignItems={alignItems}
      width={width}
      maxWidth={maxWidth}
      justifyContent={justifyContent}
      sx={{
        marginTop: marginTop,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        marginRight: marginRight,
        flexDirection: flexDirection,
      }}
      ref={flexRef}
      {...props}
    >
      {children}
    </Box>
  );
};

export { FlexRow };
