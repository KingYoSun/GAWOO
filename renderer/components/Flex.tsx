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
  myRef = null,
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
  myRef?: MutableRefObject<any>;
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
        flexDirection: flexDirection,
      }}
      ref={myRef}
      {...props}
    >
      {children}
    </Box>
  );
};

export { FlexRow };
