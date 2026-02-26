import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./component/HomePage.jsx";
import Classification from "./component/classification.jsx";
import Tuning from "./component/tuning.jsx";
import Clustering from "./component/clustering.jsx";
import ClusteringTuning from "./component/ClusteringTuning.jsx";
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/classification" element={<Classification />} />
        <Route path="/tuning" element={<Tuning />} />
        <Route path="/clustering" element={<Clustering />} />
        <Route path="/clustTuning" element={<ClusteringTuning />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
