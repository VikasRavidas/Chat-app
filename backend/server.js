const http = require("http");
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables from .env
const PORT = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY; // Use environment variable

app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// Sample users data
let users = [
  { id: 1, name: "John Doe", email: "b", password: bcrypt.hashSync("b", 10) },
  { id: 2, name: "Jane Doe", email: "c", password: bcrypt.hashSync("c", 10) },
  {
    id: 3,
    name: "Vikas Ravidas",
    email: "a",
    password: bcrypt.hashSync("a", 10),
  },
];

// Sample posts data
const posts = [
  {
    id: "1",
    content: "Post 1",
    user: { name: "John Doe" },
    likes: [],
    comments: [
      { id: 2, content: "Nice post!", likes: [], user: { name: "Jane Doe" } },
    ],
  },
  {
    id: "2",
    content: "Post 2",
    user: { name: "Jane Doe" },
    likes: [],
    comments: [],
  },
];

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split("Bearer ")[1];
  if (!token)
    return res
      .status(401)
      .json({ success: false, error: "Access denied, token missing!" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach decoded user data to the request
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
}

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication required"));

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.user.email);

  socket.on("join_room", (data) => {
    socket.join(data.chatroom);
    console.log(`${socket.user.email} joined room: ${data.chatroom}`);
  });

  socket.on("send_message", (data) => {
    io.to(data.chatroom).emit("receive_message", {
      message: data.message,
      user_email: socket.user.email,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.user.email);
  });
});

// Add this route to your server.js (before app.listen)
app.post("/api/v2/users/search", authenticateToken, (req, res) => {
  const { searchText } = req.body;
  const currentUserId = req.user.id;

  if (!searchText || searchText.trim() === "") {
    return res.json({ success: true, data: { users: [] } });
  }

  const filteredUsers = users.filter((user) => {
    // Exclude current user from search results
    if (user.id === currentUserId) return false;

    // Case-insensitive search in name or email
    const searchLower = searchText.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  // Remove passwords from response
  const sanitizedUsers = filteredUsers.map(({ id, name, email }) => ({
    id,
    name,
    email,
  }));

  res.json({
    success: true,
    data: { users: sanitizedUsers },
  });
});

// POST /api/v2/likes/toggle (Toggle like on post/comment - Requires Authentication)
app.post("/api/v2/likes/toggle", authenticateToken, (req, res) => {
  const { id, likeType } = req.body;
  const userId = req.user.id;

  if (!id || !likeType) {
    return res
      .status(400)
      .json({ success: false, error: "Missing id or likeType" });
  }

  if (likeType === "post") {
    const post = posts.find((p) => p.id === id.toString()); // Match ID type
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // Toggle like
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    return res.json({
      success: true,
      message: "Post like toggled",
      data: {
        likeable: post,
        userId,
        type: "post",
      },
    });
  } else if (likeType === "comment") {
    let foundComment = null;
    let parentPost = null;

    // Find comment across all posts
    for (const post of posts) {
      const comment = post.comments.find((c) => c.id === id.toString());
      if (comment) {
        foundComment = comment;
        parentPost = post;
        break;
      }
    }

    if (!foundComment) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    // Initialize likes array if it's a number (legacy data fix)
    if (typeof foundComment.likes === "number") {
      foundComment.likes = [];
    }

    // Toggle comment like
    const likeIndex = foundComment.likes.indexOf(userId);
    if (likeIndex === -1) {
      foundComment.likes.push(userId);
    } else {
      foundComment.likes.splice(likeIndex, 1);
    }

    return res.json({
      success: true,
      message: "Comment like toggled",
      data: {
        likeable: foundComment,
        userId,
        type: "comment",
        postId: parentPost.id,
      },
    });
  }

  return res.status(400).json({ success: false, error: "Invalid likeType" });
});

// GET /api/v2/posts (Paginated)
app.get("/api/v2/posts", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const slicedPosts = posts.slice(startIndex, endIndex);

  res.json({ success: true, data: { posts: slicedPosts } });
});

// POST /api/v2/users/login
app.post("/api/v2/users/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ success: true, message: "Login successful", token, user });
  } else {
    res
      .status(401)
      .json({ success: false, error: "Invalid email or password" });
  }
});

// POST /api/v2/users/signup
app.post("/api/v2/users/signup", (req, res) => {
  const { name, email, password } = req.body;

  // Check if email already exists
  if (users.find((u) => u.email === email)) {
    return res
      .status(400)
      .json({ success: false, error: "Email already in use" });
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword,
  };
  users.push(newUser);

  // Generate JWT Token
  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({
    success: true,
    message: "Signup successful",
    token,
    user: newUser,
  });
});

// POST /api/v2/users/editProfile (Requires Authentication)
app.post("/api/v2/users/edit", (req, res) => {
  const { id, name, password, confirmPassword } = req.body;

  // Find the user
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  // Validate passwords
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, error: "Passwords do not match" });
  }

  // Update name and password
  user.name = name;
  user.password = bcrypt.hashSync(password, 10); // Hash new password

  // Generate new JWT Token
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({
    success: true,
    message: "Profile updated successfully",
    token,
    user,
  });
});

// GET /api/v2/users/:id (Fetch user profile)
app.get("/api/v2/user/:id", (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === parseInt(id));

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  // Send user details (excluding password for security)
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// Sample friendships data
let friendships = [
  { user1: 1, user2: 3 },
  { user1: 2, user2: 3 }, // John Doe and Jane Doe are friends
];

app.get(
  "/api/v2/friendship/fetch_user_friends",
  authenticateToken,
  (req, res) => {
    const userId = req.user.id;

    // Find friends of the logged-in user
    const userFriends = friendships
      .filter((f) => f.user1 === userId || f.user2 === userId)
      .map((f) => {
        const friendId = f.user1 === userId ? f.user2 : f.user1;
        return users.find((u) => u.id === friendId);
      })
      .filter((friend) => friend && friend.id !== userId); // Ensure self is not included

    res.json({ success: true, friends: userFriends });
  }
);

// POST /api/v2/friendship/add (Requires Authentication)
app.post("/api/v2/friendship/add", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const friendId = Number(req.body.friendId);

  if (!friendId || friendId === userId) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid friend request" });
  }

  const friend = users.find((u) => u.id === friendId); // ✅ Fetch full friend object

  if (!friend) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  // Check if friendship already exists
  if (
    friendships.some(
      (f) =>
        (f.user1 === userId && f.user2 === friendId) ||
        (f.user1 === friendId && f.user2 === userId)
    )
  ) {
    return res.status(400).json({ success: false, error: "Already friends" });
  }

  // Add friendship
  friendships.push({ user1: userId, user2: friendId });

  // ✅ Return the full friend object instead of just `{ user1, user2 }`
  res.json({ success: true, message: "Friend added successfully", friend });
});

app.post("/api/v2/friendship/remove", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const friendId = Number(req.body.friendId);

  if (!friendId || friendId === userId) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid friend removal request" });
  }

  // Check if friendship exists
  const friendshipIndex = friendships.findIndex(
    (f) =>
      (f.user1 === userId && f.user2 === friendId) ||
      (f.user1 === friendId && f.user2 === userId)
  );

  if (friendshipIndex === -1) {
    return res.status(400).json({ success: false, error: "Not friends" });
  }

  // Remove friendship
  friendships.splice(friendshipIndex, 1);

  // ✅ Find and return the full friend object
  const removedFriend = users.find((u) => u.id === friendId);

  res.json({
    success: true,
    message: "Friend removed successfully",
    friend: removedFriend,
  });
});

app.post("/api/v2/posts/create", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res
      .status(400)
      .json({ success: false, error: "Post content cannot be empty" });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const newPost = {
    id: (posts.length + 1).toString(), // Convert to string
    content,
    user: { name: user.name }, // Include user object
    likes: [],
    comments: [],
  };

  posts.push(newPost);

  res.json({
    success: true,
    message: "Post created successfully",
    post: newPost,
  });
});

// POST /api/v2/comments (Create a new comment - Requires Authentication)
app.post("/api/v2/comments", authenticateToken, (req, res) => {
  const { content, postId } = req.body;
  const userId = req.user.id;

  // Find the user making the comment
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  // Find the target post
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return res.status(404).json({ success: false, error: "Post not found" });
  }

  // Create new comment
  const newComment = {
    id: `c${post.comments.length + 1}`, // Simple ID generation based on comment count
    content,
    user: { name: user.name }, // Store user info
    likes: 0, // Initialize likes count
  };

  // Add comment to the post
  post.comments.push(newComment);

  res.json({
    success: true,
    message: "Comment added successfully",
    comment: newComment,
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
