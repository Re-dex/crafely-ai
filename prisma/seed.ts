import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

async function main() {
  const packages = [
    {
      name: "Free",
      description: "Perfect for getting started",
      price: 0,
      features: [
        "Up to 10 AI responses per month",
        "Basic support",
        "Single user",
      ],
      interval: "month",
    },
    {
      name: "Starter",
      description: "Great for individuals and small projects",
      price: 29,
      features: [
        "Up to 100 AI responses per month",
        "Priority support",
        "Advanced AI features",
        "Custom instructions",
      ],
      interval: "month",
    },
    {
      name: "Standard",
      description: "Perfect for growing businesses",
      price: 99,
      features: [
        "Up to 500 AI responses per month",
        "24/7 Priority support",
        "Advanced AI features",
        "Custom instructions",
        "Team collaboration",
        "API access",
      ],
      interval: "month",
    },
    {
      name: "Corporate",
      description: "For large organizations with custom needs",
      price: 299,
      features: [
        "Unlimited AI responses",
        "Dedicated support",
        "Advanced AI features",
        "Custom instructions",
        "Team collaboration",
        "API access",
        "Custom model training",
        "SSO Integration",
      ],
      interval: "month",
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg,
    });
  }

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
