
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";

import CommentCard from "./CommentCard";

import {
    fetchArticleById,
    fetchCommentsByArticleId,
    postComment,
    patchCommentVotes,
    deleteCommentById,
  } from "../api";

export default function ArticleModal({
  open,
  articleId,
  onClose,
  loggedInUser = "butter_bridge",
  votes,
  liked,
  onToggleLike,
  likeDisabled,
}) {
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);

  const [loadingArticle, setLoadingArticle] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [commentBody, setCommentBody] = useState("");

  const commentsRef = useRef(null);

  const [commentReactions, setCommentReactions] = useState(() => {
    try {
      const raw = localStorage.getItem("commentReactions");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [reactingCommentIds, setReactingCommentIds] = useState(() => new Set());
  const [deletingCommentIds, setDeletingCommentIds] = useState(() => new Set());

  useEffect(() => {
    try {
      localStorage.setItem("commentReactions", JSON.stringify(commentReactions));
    } catch {
      // ignore
    }
  }, [commentReactions]);

  const getReaction = (commentId) => commentReactions[commentId] ?? null;

  useEffect(() => {
    if (!open || !articleId) return;

    let ignore = false;

    setError("");
    setArticle(null);
    setComments([]);
    setCommentBody("");
    setNotFound(false);

    const load = async () => {
      try {
        setLoadingArticle(true);
        setLoadingComments(true);

        const [a, c] = await Promise.all([
          fetchArticleById(articleId),
          fetchCommentsByArticleId(articleId),
        ]);

        if (ignore) return;
        setArticle(a);
        setComments(c);
      } catch (e) {
        if (ignore) return;
        const msg = e?.message || "Failed to load article";
        const looksLikeNotFound =
          msg.toLowerCase().includes("not found") ||
          msg.includes("404");
      
        setNotFound(looksLikeNotFound);
        setError(looksLikeNotFound ? "" : msg);
      } finally {
        if (ignore) return;
        setLoadingArticle(false);
        setLoadingComments(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [open, articleId]);

  const dateLabel = useMemo(() => {
    if (!article?.created_at) return "";
    return new Date(article.created_at).toLocaleDateString("en-GB");
  }, [article]);

  const votesLabel = typeof votes === "number" ? votes : article?.votes;
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const body = commentBody.trim();
    if (!body) return;

    try {
      setPosting(true);
      setError("");

      const newComment = await postComment(articleId, {
        username: loggedInUser,
        body,
      });

      setComments((curr) => [newComment, ...curr]);
      setCommentBody("");

      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (e2) {
      setError(e2.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const toggleCommentReaction = async (commentId, target) => {
    if (reactingCommentIds.has(commentId)) return;

    const prev = getReaction(commentId); // "like" | "dislike" | null

    let inc = 0;
    let next = null;

    if (prev === target) {
      next = null;
      inc = target === "like" ? -1 : +1;
    } else {
      next = target;
      if (prev === null) inc = target === "like" ? +1 : -1;
      else if (prev === "like" && target === "dislike") inc = -2;
      else if (prev === "dislike" && target === "like") inc = +2;
    }

    setReactingCommentIds((s) => {
      const ns = new Set(s);
      ns.add(commentId);
      return ns;
    });

    // optimistic votes
    setComments((curr) =>
      curr.map((c) =>
        c.comment_id === commentId ? { ...c, votes: (c.votes ?? 0) + inc } : c
      )
    );

    // optimistic reaction
    setCommentReactions((curr) => {
      const copy = { ...curr };
      if (next === null) delete copy[commentId];
      else copy[commentId] = next;
      return copy;
    });

    try {
      const updated = await patchCommentVotes(commentId, inc);
      setComments((curr) =>
        curr.map((c) =>
          c.comment_id === commentId ? { ...c, votes: updated.votes } : c
        )
      );
    } catch (e) {
      // rollback votes
      setComments((curr) =>
        curr.map((c) =>
          c.comment_id === commentId ? { ...c, votes: (c.votes ?? 0) - inc } : c
        )
      );

      // rollback reaction
      setCommentReactions((curr) => {
        const copy = { ...curr };
        if (prev === null) delete copy[commentId];
        else copy[commentId] = prev;
        return copy;
      });

      setError(e.message || "Failed to update comment reaction");
    } finally {
      setReactingCommentIds((s) => {
        const ns = new Set(s);
        ns.delete(commentId);
        return ns;
      });
    }
  };


  const handleDeleteComment = async (commentId) => {
    if (deletingCommentIds.has(commentId)) return;

    const target = comments.find((c) => c.comment_id === commentId);
    if (!target) return;

    if (target.author !== loggedInUser) return; 

    setError("");

    // optimistic remove
    setDeletingCommentIds((s) => {
      const ns = new Set(s);
      ns.add(commentId);
      return ns;
    });

    setComments((curr) => curr.filter((c) => c.comment_id !== commentId));

    try {
        await deleteCommentById(commentId);
    } catch (e) {
      setComments((curr) => [target, ...curr]);
      setError(e.message || "Failed to delete comment");
    } finally {
      setDeletingCommentIds((s) => {
        const ns = new Set(s);
        ns.delete(commentId);
        return ns;
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ pr: 2 }}>
          {article ? article.title : "Loading..."}
        </Typography>

        <IconButton onClick={onClose} aria-label="Close modal">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "75vh" }}>
        {(loadingArticle || loadingComments) && !article && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !notFound && (
          <Typography color="error" sx={{ mb: 2 }}>
            Something went wrong. Please try again.
          </Typography>
        )}
        {notFound && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Article not found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              It may have been removed or the link is incorrect.
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                bgcolor: "black",
                "&:hover": { bgcolor: "#111" },
              }}
            >
              Close
            </Button>
          </Box>
        )}

        {article && !notFound &&(
          <>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                mb: 2,
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Topic: <b>{article.topic}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Author: <b>{article.author}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: <b>{dateLabel}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comments: <b>{article.comment_count}</b>
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
                <IconButton
                  size="small"
                  disabled={likeDisabled}
                  onClick={onToggleLike}
                  aria-label={liked ? "Unlike article" : "Like article"}
                >
                  {liked ? (
                    <ThumbUpAltIcon fontSize="small" />
                  ) : (
                    <ThumbUpAltOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
                <Typography variant="body2">{votesLabel}</Typography>
              </Box>
            </Box>

            {/* Image */}
            {article.article_img_url && (
              <Box
                component="img"
                src={article.article_img_url}
                alt={article.title}
                sx={{
                  width: "100%",
                  height: { xs: 180, sm: 260 },
                  objectFit: "cover",
                  borderRadius: 2,
                  mb: 2,
                }}
              />
            )}

            {/* Body */}
            <Typography sx={{ whiteSpace: "pre-line", mb: 3 }}>
              {article.body}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box ref={commentsRef} />

            <Typography variant="h6" sx={{ mb: 1 }}>
              Comments
            </Typography>

            {/* Add comment */}
            <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 2 }}>
              <TextField
                label="Add a comment"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={posting}
                sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    bgcolor: "black",
                    "&:hover": { bgcolor: "#111" },
                }}
                >
                {posting ? "Posting..." : "Post"}
                </Button>
              </Box>
            </Box>

            {/* Comments list */}
            {loadingComments ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={22} />
              </Box>
            ) : comments.length === 0 ? (
              <Typography color="text.secondary">No comments yet.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {comments.map((c) => (
                  <CommentCard
                    key={c.comment_id}
                    comment={c}
                    likeState={getReaction(c.comment_id)} // "like" | "dislike" | null
                    disabled={
                      reactingCommentIds.has(c.comment_id) ||
                      deletingCommentIds.has(c.comment_id)
                    }
                    onToggleLike={() => toggleCommentReaction(c.comment_id, "like")}
                    onToggleDislike={() => toggleCommentReaction(c.comment_id, "dislike")}
                    loggedInUser={loggedInUser}
                    deleting={deletingCommentIds.has(c.comment_id)}
                    onDelete={() => handleDeleteComment(c.comment_id)}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}