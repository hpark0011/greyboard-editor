import { useEffect } from "react";
import { AppLayout } from "./components/layouts/app-layout";
import { useStore } from "./store";

export function App() {
  const restoreSession = useStore((state) => state.restoreSession);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return <AppLayout />;
}
