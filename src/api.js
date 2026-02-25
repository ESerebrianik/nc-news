const BASE_URL = "https://back-end-nc-news-ek5h.onrender.com/api";

export const fetchArticles = async (queries = "") => {
  const response = await fetch(`${BASE_URL}/articles${queries}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || "Failed to fetch articles");
  }

  return response.json(); 
};

export const fetchArticleById = async (articleId) => {
    const response = await fetch(`${BASE_URL}/articles/${articleId}`);
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Failed to fetch article");
    }
  
    const data = await response.json();
    return data.article;
  };
  
  
  export const fetchCommentsByArticleId = async (articleId) => {
    const response = await fetch(`${BASE_URL}/articles/${articleId}/comments`);
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Failed to fetch comments");
    }
  
    const data = await response.json();
    return data.comments;
  };
  
  
  export const postComment = async (articleId, { username, body }) => {
    const response = await fetch(`${BASE_URL}/articles/${articleId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, body }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Failed to post comment");
    }
  
    const data = await response.json();
    return data.comment;
  };

  export const patchArticleVotes = async (articleId, incVotes) => {
    const response = await fetch(`${BASE_URL}/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inc_votes: incVotes }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Failed to update votes");
    }
  
    const data = await response.json();
    return data.article; // { ... , votes: ... }
  };

  export const patchCommentVotes = async (commentId, incVotes) => {
    const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inc_votes: incVotes }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Failed to update comment votes");
    }
  
    const data = await response.json();
    return data.comment; // { comment_id, votes, ... }
  };