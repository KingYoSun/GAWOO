import { Container, styled, Typography } from "@mui/material";
import MoodBadIcon from "@mui/icons-material/MoodBad";

const useStyles = styled(Container)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: theme.spacing(30),
  flex: 1,
  flexDirection: "column",
}));

const ErrorPage = (): JSX.Element => {
  const classes = useStyles;
  return (
    <div className={classes.name}>
      <Typography variant="h3">Ooops, something went wrong...</Typography>
      <MoodBadIcon fontSize="large" />
    </div>
  );
};

export default ErrorPage;
