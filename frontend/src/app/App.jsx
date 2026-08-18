import React, { useEffect, useRef } from "react";
import "./App.css";
import { RouterProvider } from "react-router";
import { routes } from "./Routes";
import { store } from "./app.store";
import { Provider, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";

const AppContent = () => {
  const { user } = useSelector((state) => state.auth);
  const { getMeHandler } = useAuth();
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    if (user !== null || hasCheckedSession.current) return;

    hasCheckedSession.current = true;

    (async () => {
      try {
        const res = await getMeHandler();
        console.log("res from me api", res);
      } catch (error) {
        console.log("getMe error", error);
      }
    })();
  }, [getMeHandler, user]);

  return <RouterProvider router={routes} />;
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
