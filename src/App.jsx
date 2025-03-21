import AppRoutes from "./routes";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <>
     <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
  <AppRoutes />
  </SnackbarProvider>
  </>
  )
}

export default App;
