import { Button, Typography } from "@mui/material";
import Brightness2 from "@mui/icons-material/Brightness2";
import WbSunny from "@mui/icons-material/WbSunny";

import { useThemeContext } from "../context/ThemeContext";

const ThemeToggler = (): JSX.Element => {
  const { themeType, setThemeType } = useThemeContext();
  return (
    <Button
      onClick={() => setThemeType(themeType === "dark" ? "light" : "dark")}
    >
      {themeType === "light" ? (
        <WbSunny
          sx={{
            color: (theme) => theme.palette.primary.contrastText,
            marginRight: (theme) => theme.spacing(1),
          }}
        />
      ) : (
        <Brightness2
          sx={{
            color: (theme) => theme.palette.primary.light,
            marginRight: (theme) => theme.spacing(1),
          }}
        />
      )}
    </Button>
  );
};

export default ThemeToggler;
