import {IconButton} from '@mui/material';
import Brightness2 from '@mui/icons-material/Brightness2';
import WbSunny from '@mui/icons-material/WbSunny';

import {useThemeContext} from '../context/ThemeContext';

const ThemeToggler = (): JSX.Element => {
  const {themeType, setThemeType} = useThemeContext();
  return (
    <IconButton
      onClick={() => setThemeType(themeType === 'dark' ? 'light' : 'dark')}
    >
      {themeType === 'dark' ? (
        <WbSunny />
      ) : (
        <Brightness2 sx={{color: (theme) => theme.palette.primary.contrastText}} />
      )}
    </IconButton>
  );
};

export default ThemeToggler;
