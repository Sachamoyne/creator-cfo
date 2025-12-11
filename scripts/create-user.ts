import { db } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "demo@creatorcfo.com";
  const password = "demo123"; // Mot de passe par défaut

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      currency: "EUR",
    },
  });

  console.log("✅ User created/updated:", user.email);
  console.log("📧 Email:", email);
  console.log("🔑 Password:", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

