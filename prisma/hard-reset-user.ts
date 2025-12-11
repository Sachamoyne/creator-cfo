import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "demo@creatorcfo.com";
  const password = "demo123";

  // Delete the old user
  await db.user.deleteMany({
    where: { email },
  });
  console.log("🗑️  Old user deleted");

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      currency: "EUR",
    },
  });

  console.log("✅ User RECREATED with password demo123");
  console.log("📧 Email:", user.email);
  console.log("🔑 Password:", password);
  console.log("🆔 User ID:", user.id);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

