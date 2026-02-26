import { useState } from "react";
import Header from "./components/Header";
import ArticleList from "./components/ArticleList";

export default function App() {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleSelectTopic = (slug) => {
    setTopic(slug);
  };

  const handleGoHome = () => {
    setTopic("");
  };

  return (
    <>
      <Header
        onSearch={handleSearch}
        onSelectTopic={handleSelectTopic}
        onGoHome={handleGoHome}
        selectedTopic={topic}
      />

      <ArticleList
        search={search}
        topic={topic}
      />
    </>
  );
}
