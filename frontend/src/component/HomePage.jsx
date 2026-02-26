import "../style/HomePage.css";

export default function HomePage() {

  return (
    <div className="home-page">
      <h1 className="title">
        Machine Learning Application Home
        </h1>
        <li>
            <button className="classfication-button">
                <a href="/classification">
                  Classification
                </a>
            </button>
            <button className="clustering-button">
              <a href="/clustering">
                Clustering
              </a>
            </button>
        </li>
    </div>
  );
};