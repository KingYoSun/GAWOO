import { ReactNode } from "react";
import { Box } from "@mui/material";

const FlexRow = ({
  children,
  alignItems = "center",
  flexDirection = "row",
  justifyContent = "center",
  width = "100%",
  marginTop = "4px",
  marginBottom = "4px",
  ...props
}: {
  children: ReactNode;
  alignItems?: string;
  flexDirection?: string;
  justifyContent?: string;
  width?: string | number;
  marginTop?: string | number;
  marginBottom?: string | number;
}) => {
  return (
    <Box
      display="flex"
      alignItems={alignItems}
      width={width}
      justifyContent={justifyContent}
      sx={{
        marginTop: marginTop,
        marginBottom: marginBottom,
        flexDirection: flexDirection,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export { FlexRow };
