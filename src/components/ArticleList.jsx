import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { fetchArticles, patchArticleVotes } from "../api";
import ArticleCard from "./ArticleCard";
import ArticleModal from "./ArticleModal";

export default function ArticleList({ search = "", topic = "" }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [likingIds, setLikingIds] = useState(() => new Set());

  useEffect(() => {
    setLoading(true);
    setErr(null);

    const params = new URLSearchParams();
    if (topic) params.set("topic", topic);

    const qs = params.toString();
    const queries = qs ? `?${qs}` : "";

    fetchArticles(queries)
      .then((data) => setArticles(data.articles))
      .catch((error) => setErr(error.message))
      .finally(() => setLoading(false));
  }, [topic]);

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;

    return articles.filter((a) => {
      return (
        a.title?.toLowerCase().includes(q) ||
        a.author?.toLowerCase().includes(q) ||
        a.topic?.toLowerCase().includes(q)
      );
    });
  }, [articles, search]);

  const selectedArticleFromList = useMemo(
    () => filteredArticles.find((a) => a.article_id === selectedArticleId) || null,
    [filteredArticles, selectedArticleId]
  );

  const isLiked = (id) => likedIds.has(id);

  const handleToggleLike = async (articleId) => {
    if (likingIds.has(articleId)) return;

    const alreadyLiked = isLiked(articleId);
    const inc = alreadyLiked ? -1 : 1;

    setLikingIds((prev) => new Set(prev).add(articleId));

    setArticles((curr) =>
      curr.map((a) =>
        a.article_id === articleId ? { ...a, votes: (a.votes ?? 0) + inc } : a
      )
    );

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (alreadyLiked) next.delete(articleId);
      else next.add(articleId);
      return next;
    });

    try {
      const updated = await patchArticleVotes(articleId, inc);
      setArticles((curr) =>
        curr.map((a) =>
          a.article_id === articleId ? { ...a, votes: updated.votes } : a
        )
      );
    } catch (e) {
      // rollback
      setArticles((curr) =>
        curr.map((a) =>
          a.article_id === articleId ? { ...a, votes: (a.votes ?? 0) - inc } : a
        )
      );
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (alreadyLiked) next.add(articleId);
        else next.delete(articleId);
        return next;
      });
      setErr(e.message || "Failed to update like");
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (err) return <Alert severity="error">{err}</Alert>;
  if (!filteredArticles.length) return <Typography>No articles found.</Typography>;

  return (
    <>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredArticles.map((article) => (
          <ArticleCard
            key={article.article_id}
            article={article}
            votes={article.votes}
            liked={isLiked(article.article_id)}
            likeDisabled={likingIds.has(article.article_id)}
            onToggleLike={() => handleToggleLike(article.article_id)}
            onClick={() => setSelectedArticleId(article.article_id)}
          />
        ))}
      </Box>

      <ArticleModal
        open={Boolean(selectedArticleId)}
        articleId={selectedArticleId}
        onClose={() => setSelectedArticleId(null)}
        loggedInUser="butter_bridge"
        votes={selectedArticleFromList?.votes}
        liked={selectedArticleId ? isLiked(selectedArticleId) : false}
        likeDisabled={selectedArticleId ? likingIds.has(selectedArticleId) : false}
        onToggleLike={() => selectedArticleId && handleToggleLike(selectedArticleId)}
      />
    </>
  );
}