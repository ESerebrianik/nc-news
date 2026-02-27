import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Alert, Typography, Pagination, Button, Menu, MenuItem } from "@mui/material";
import { fetchArticles, patchArticleVotes } from "../api";
import ArticleCard from "./ArticleCard";
import ArticleModal from "./ArticleModal";
import SwapVertIcon from "@mui/icons-material/SwapVert";

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
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");        
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const sortOpen = Boolean(sortAnchorEl);
  const openSortMenu = (e) => setSortAnchorEl(e.currentTarget);
  const closeSortMenu = () => setSortAnchorEl(null);
  const applySort = (nextSortBy, nextOrder) => {
    setSortBy(nextSortBy);
    setOrder(nextOrder);
    setPage(1);
    closeSortMenu();
  };

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
      sort_by: sortBy,
      order,
    };

    console.log("FETCH /articles params:", { topic, q: search, limit, p: page, sort_by: sortBy, order });
    
    fetchArticles(params)
      .then((data) => {
        setArticles(data.articles);
        setTotalCount(data.total_count || 0);
      })
      .catch((error) => {
        const msg = String(error?.message || "");
      
        if (msg.toLowerCase().includes("topic not found")) {
          setErr("This topic doesn’t exist.");
          return;
        }
      
        if (msg.toLowerCase().includes("user not found")) {
          setErr("This user doesn’t exist.");
          return;
        }
      
        setErr("Something went wrong while loading articles.");
      })
      .finally(() => setLoading(false));
  }, [topic, search, author, page, sortBy, order]);

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
          width: {xs: "90%", sm:"100%"},
          maxWidth: 900,
          mx: "auto",
          mt: 2,
          px: { xs: 1, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          
        }}
      >

          <Box
            sx={{
              width: {xs: "100%", sm:"100%"},
              mt: 1,
              px: { xs: 0, sm: 0 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
            Showing {articles.length} of {totalCount} results
          </Typography>

          <Button
            onClick={openSortMenu}
            variant="text"
            endIcon={<SwapVertIcon />}
            color="text.secondary"
            sx={{ textTransform: "none", "& .MuiButton-endIcon": {marginLeft: "4px",}}}
          >
            Sort by
          </Button>

          <Menu 
            anchorEl={sortAnchorEl} 
            open={sortOpen} 
            onClose={closeSortMenu} 
            MenuListProps={{
              sx: { "& .MuiMenuItem-root": { fontSize: 14 } },
            }}>
            <MenuItem onClick={() => applySort("created_at", "desc")}>
              Date (newest)
            </MenuItem>
            <MenuItem onClick={() => applySort("created_at", "asc")}>
              Date (oldest)
            </MenuItem>

            <MenuItem onClick={() => applySort("comment_count", "desc")}>
              Comments (high → low)
            </MenuItem>
            <MenuItem onClick={() => applySort("comment_count", "asc")}>
              Comments (low → high)
            </MenuItem>

            <MenuItem onClick={() => applySort("votes", "desc")}>
              Votes (high → low)
            </MenuItem>
            <MenuItem onClick={() => applySort("votes", "asc")}>
              Votes (low → high)
            </MenuItem>
          </Menu>
        </Box>

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