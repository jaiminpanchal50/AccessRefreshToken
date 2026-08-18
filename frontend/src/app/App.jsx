import React from "react";
import "./App.css";
import { RouterProvider } from "react-router";
import { routes } from "./Routes";
import { store } from "./app.store";
import { Provider } from "react-redux";

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={routes} />
    </Provider>
  );
};

export default App;
