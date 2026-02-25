import Header from "./components/Header";
import ArticleList from "./components/ArticleList";

export default function App() {
  const handleSearch = (query) => {
    console.log("Search query:", query);
    // позже подключим фильтрацию
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <ArticleList />
    </>
  );
}
