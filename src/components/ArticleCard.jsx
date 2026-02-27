import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const topicColors = {
  coding: { bg: "#EEF2FF", text: "#3730A3" },
  football: { bg: "#ECFDF5", text: "#065F46" },
  cooking: { bg: "#FFF7ED", text: "#9A3412" },
  default: { bg: "#F3F4F6", text: "#374151" },
};

export default function ArticleCard({
  article,
  onClick,
  votes,
  liked,
  onToggleLike,
  likeDisabled,
  onSelectTopic,
  onSelectAuthor,
}) {
  const {
    title,
    author,
    topic,
    created_at,
    comment_count,
    article_img_url,
    body,
  } = article;
  const navigate = useNavigate();

  const topicStyle = topicColors[topic] || topicColors.default;
  const dateLabel = new Date(created_at).toLocaleDateString("en-GB");

  return (
    <Card
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      sx={{
        cursor: "pointer",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, 
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        component="img"
        src={article_img_url}
        alt={title}
        sx={{ 
          width: { xs: "100%", sm: 200 },
          objectFit: "cover", 
          flexShrink: 0 }}
      />

      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: 0,
          p: 3,
          pb: "12px !important",
          minHeight: { sm: 160},
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexShrink: 0 }}
          >
            {dateLabel}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={topic}
            size="small"
            clickable
            onClick={(e) => {
              e.stopPropagation();
              onSelectTopic?.(topic);
            }}
            sx={{
              backgroundColor: topicStyle.bg,
              color: topicStyle.text,
              fontWeight: 600,
            }}
          />
          <Chip
            label={author}
            size="small"
            variant="outlined"
            clickable
            onClick={(e) => {
              e.stopPropagation();
              onSelectAuthor?.(author);
            }}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: { xs: 3, sm: 2 },
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {body}
        </Typography>

        <Box
          sx={{
            mt: "auto",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.01 }}>
            <IconButton size="small">
              <ChatBubbleOutlineIcon
                sx={{ fontSize: 18, position: "relative", top: "2px" }}
              />
            </IconButton>
            <Typography variant="body2" component="span">
              {comment_count}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.01 }}>
            <IconButton
              size="small"
              disabled={likeDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike?.();
              }}
              aria-label={liked ? "Unlike article" : "Like article"}
            >
              {liked ? (
                <ThumbUpAltIcon fontSize="small" />
              ) : (
                <ThumbUpAltOutlinedIcon fontSize="small" />
              )}
            </IconButton>
            <Typography variant="body2">{votes}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
