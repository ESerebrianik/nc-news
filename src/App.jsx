import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Header from "./components/Header";
import ArticleList from "./components/ArticleList";
import NotFoundPage from "./components/NotFoundPage";

function TopicPage({ search, onSelectTopic, onSelectAuthor }) {
  const { slug } = useParams();

  return (
    <ArticleList
      search={search}
      topic={slug}
      onSelectTopic={onSelectTopic}
      onSelectAuthor={onSelectAuthor}
    />
  );
}

function AuthorPage({ search, onSelectTopic, onSelectAuthor }) {
  const { username } = useParams();

  return (
    <ArticleList
      search={search}
      author={username}
      onSelectTopic={onSelectTopic}
      onSelectAuthor={onSelectAuthor}
    />
  );
}

export default function App() {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const selectedTopic = location.pathname.startsWith("/topics/")
    ? location.pathname.split("/")[2] || ""
    : "";

  const handleSearch = (value) => setSearch(value);

  const handleGoHome = () => navigate("/");

  const handleSelectTopic = (slug) => {
    if (!slug) navigate("/");
    else navigate(`/topics/${slug}`);
  };

  const handleSelectAuthor = (username) => {
    if (!username) return;
    navigate(`/users/${username}`);
  };

  return (
    <>
      <Header
        onSearch={handleSearch}
        selectedTopic={selectedTopic}
        onSelectTopic={handleSelectTopic}
        onGoHome={handleGoHome}
      />

      <Routes>
        <Route
          path="/"
          element={
            <ArticleList
              search={search}
              topic=""
              onSelectTopic={handleSelectTopic}
              onSelectAuthor={handleSelectAuthor}
            />
          }
        />

        <Route
          path="/topics/:slug"
          element={
            <TopicPage
              search={search}
              onSelectTopic={handleSelectTopic}
              onSelectAuthor={handleSelectAuthor}
            />
          }
        />

        <Route
          path="/users/:username"
          element={
            <AuthorPage
              search={search}
              onSelectTopic={handleSelectTopic}
              onSelectAuthor={handleSelectAuthor}
            />
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}