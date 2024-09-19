const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middleware/isAuthenticated");
const prisma = new PrismaClient();
require("dotenv").config();

// つぶやき投稿API
router.post("/post", isAuthenticated, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "投稿内容がありません" });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId,
      },
      include: { author: { include: { profile: true } } },
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 最新つぶやき取得API
router.get("/get_latest_posts", async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { author: { include: { profile: true } } },
    });

    return res.status(200).json(latestPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ユーザー毎のつぶやき取得API
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userPosts = await prisma.post.findMany({
      where: { authorId: parseInt(userId) },
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });

    console.log(userPosts);

    return res.status(200).json(userPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
