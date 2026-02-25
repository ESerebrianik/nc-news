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
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import {
  fetchArticleById,
  fetchCommentsByArticleId,
  postComment,
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
  const [commentBody, setCommentBody] = useState("");

  const commentsRef = useRef(null);

  const dateLabel = useMemo(() => {
    if (!article?.created_at) return "";
    return new Date(article.created_at).toLocaleDateString("en-GB");
  }, [article]);

  useEffect(() => {
    if (!open || !articleId) return;
  
    let ignore = false;
  
    setError("");
    setArticle(null);
    setComments([]);
    setCommentBody("");
  
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
        setError(e.message || "Failed to load article");
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

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const body = commentBody.trim();
    if (!body) return;

    try {
      setPosting(true);
      const newComment = await postComment(articleId, {
        username: loggedInUser,
        body,
      });
      setComments((curr) => [newComment, ...curr]);
      setCommentBody("");
      setTimeout(
        () => commentsRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    } catch (e) {
      setError(e.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const votesLabel = typeof votes === "number" ? votes : article?.votes;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
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
        {loadingArticle && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {article && (
          <>
            {/* Meta + Like */}
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

              {/* ✅ Like синхронный */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  ml: "auto",
                }}
              >
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
                <Button type="submit" variant="contained" disabled={posting}>
                  {posting ? "Posting..." : "Post"}
                </Button>
              </Box>
            </Box>

            {loadingComments ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={22} />
              </Box>
            ) : comments.length === 0 ? (
              <Typography color="text.secondary">No comments yet.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {comments.map((c) => (
                  <Box
                    key={c.comment_id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2">{c.author}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(c.created_at).toLocaleDateString("en-GB")}
                      </Typography>
                    </Box>
                    <Typography sx={{ whiteSpace: "pre-line" }}>
                      {c.body}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
