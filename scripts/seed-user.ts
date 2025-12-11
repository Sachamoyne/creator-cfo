import { db } from "../lib/db";

async function main() {
  const user = await db.user.upsert({
    where: { email: "demo@creatorcfo.com" },
    update: {},
    create: {
      email: "demo@creatorcfo.com",
      currency: "EUR",
    },
  });

  console.log("User created/updated:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

