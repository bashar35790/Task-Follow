import { PrismaClient, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with sample tasks...");

  // Clean existing tasks
  await prisma.task.deleteMany();

  const now = new Date();
  const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago (overdue)
  const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days in future

  const sampleTasks = [
    {
      title: "Review Acme AI Assessment Guidelines",
      description: "Carefully read all scoring rubrics, architectural constraints, and deliverables.",
      status: TaskStatus.completed,
      priority: TaskPriority.high,
      dueDate: pastDate,
    },
    {
      title: "Implement Task-Flow Core Architecture",
      description: "Build Next.js frontend, Express backend, and Neon PostgreSQL persistence layer.",
      status: TaskStatus.pending,
      priority: TaskPriority.high,
      dueDate: pastDate, // overdue pending task
    },
    {
      title: "Run Integration Tests & Prepare Demonstration",
      description: "Execute backend Vitest suite and verify responsive UI across mobile and desktop viewports.",
      status: TaskStatus.pending,
      priority: TaskPriority.medium,
      dueDate: futureDate,
    },
  ];

  for (const task of sampleTasks) {
    const created = await prisma.task.create({
      data: task,
    });
    console.log(`Created sample task: "${created.title}" [${created.priority}] (${created.status})`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
