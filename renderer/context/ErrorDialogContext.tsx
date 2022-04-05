import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { createContext, useReducer } from "react";

type ErrorDialogProviderProps = { children: React.ReactNode };

export const ErrorDialogContext = createContext(null);

function reducer(state, action) {
  switch (action?.type) {
    case "open":
      console.log("payload!: ", action.payload);
      return action.payload;
    case "close":
      return "";
    default:
      return state;
  }
}

export default function ErrorDialogContextProvider({
  children,
}: ErrorDialogProviderProps): JSX.Element {
  const [errorDialog, dispatchErrorDialog] = useReducer(reducer, "");

  return (
    <ErrorDialogContext.Provider value={{ errorDialog, dispatchErrorDialog }}>
      {children}
      <Dialog
        open={!!errorDialog}
        onClose={() =>
          dispatchErrorDialog({
            type: "close",
          })
        }
        PaperProps={{
          sx: {
            minWidth: "500px",
          },
        }}
        sx={{
          borderRadius: "30px",
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">エラー！</DialogTitle>
        <DialogContent id="alert-dialog-description">
          {errorDialog}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              dispatchErrorDialog({
                type: "close",
              })
            }
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorDialogContext.Provider>
  );
}
