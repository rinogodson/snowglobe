import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:name" element=<TheActualApp /> />
        <Route path="/" element={<TheActualApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

const TheActualApp = () => {
  const { name } = useParams();

  return <div>{name ? name : "Hello"}</div>;
};
