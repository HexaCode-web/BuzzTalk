import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import Portal from "./components/Portal/Portal";

import { useSelector } from "react-redux";

export const CreateToast = (text, type, duration = 5000) => {
  let value;
  switch (type) {
    case "success":
      value = toast.success;
      break;
    case "info":
      value = toast.info;
      break;
    case "warning":
      value = toast.warn;
      break;
    case "error":
      value = toast.error;
      break;
    default:
      value = toast;
      break;
  }
  return value(text, {
    position: "bottom-right",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
};

function App() {
  const user = useSelector((state) => ({ ...state.user }));

  const ProtectedRoute = ({ children }) => {
    if (!user.user) {
      return <Navigate to="/Portal" />;
    } else {
      return children;
    }
  };
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route
              index
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            ></Route>
            <Route path="Portal" element={<Portal />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
