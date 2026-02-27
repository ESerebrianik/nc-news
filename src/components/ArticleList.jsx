import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Alert, Typography, Pagination } from "@mui/material";
import { fetchArticles, patchArticleVotes } from "../api";
import ArticleCard from "./ArticleCard";
import ArticleModal from "./ArticleModal";

export default function ArticleList({ search, topic = "", author ="", onSelectTopic, onSelectAuthor }) {
  const [articles, setArticles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [selectedArticleId, setSelectedArticleId] = useState(null);

  const [likedIds, setLikedIds] = useState(() => new Set());
  const [likingIds, setLikingIds] = useState(() => new Set());

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [topic, search, author]);

  useEffect(() => {
    setLoading(true);
    setErr(null);

    const params = {
      topic,
      author,
      q: search,
      limit,
      p: page,
      sort_by: "created_at",
      order: "desc",
    };

    fetchArticles(params)
      .then((data) => {
        setArticles(data.articles);
        setTotalCount(data.total_count || 0);
      })
      .catch((error) => setErr(error.message))
      .finally(() => setLoading(false));
  }, [topic, search, author, page]);

  const pageCount = Math.max(1, Math.ceil(totalCount / limit));

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);

  const selectedArticleFromList = useMemo(
    () => articles.find((a) => a.article_id === selectedArticleId) || null,
    [articles, selectedArticleId]
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

  return (
    <>
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          mt: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography sx={{ mb: 0.5 }} color="text.secondary">
          Showing {articles.length} of {totalCount} results
        </Typography>

        {!articles.length ? (
          <Typography sx={{ mt: 3, textAlign: "center" }}>
            No articles found.
          </Typography>
        ) : (
          <>
            {articles.map((article) => (
              <ArticleCard
                key={article.article_id}
                article={article}
                votes={article.votes}
                liked={isLiked(article.article_id)}
                likeDisabled={likingIds.has(article.article_id)}
                onToggleLike={() => handleToggleLike(article.article_id)}
                onClick={() => setSelectedArticleId(article.article_id)}
                onSelectTopic={onSelectTopic}
                onSelectAuthor={onSelectAuthor}
              />
            ))}

            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, value) => setPage(value)}
              />
            </Box>
          </>
        )}
      </Box>

      <ArticleModal
        open={Boolean(selectedArticleId)}
        articleId={selectedArticleId}
        onClose={() => setSelectedArticleId(null)}
        loggedInUser="butter_bridge"
        votes={selectedArticleFromList?.votes}
        liked={selectedArticleId ? isLiked(selectedArticleId) : false}
        likeDisabled={selectedArticleId ? likingIds.has(selectedArticleId) : false}
        onToggleLike={() =>
          selectedArticleId && handleToggleLike(selectedArticleId)
        }
      />
    </>
  );
}