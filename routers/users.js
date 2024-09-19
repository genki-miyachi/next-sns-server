const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middleware/isAuthenticated");

const prisma = new PrismaClient();

router.get("/find", isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: "ユーザーが見つかりませんでした。" });
    }

    res.status(200).json({
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ error: "ユーザーが見つかりませんでした。" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
