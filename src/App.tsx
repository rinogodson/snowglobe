import { BrowserRouter, Routes, Route } from "react-router-dom";
import TheActualApp from "./ActualApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TheActualApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
