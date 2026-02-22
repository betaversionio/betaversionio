import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// NOTE: In production, passwords should be properly hashed using bcrypt or argon2.
// This placeholder hash is for seed/development purposes only.
const PLACEHOLDER_PASSWORD_HASH =
  "$2b$10$placeholder.hash.for.seed.data.only.do.not.use.in.production00";

async function main() {
  console.log("Seeding database...");

  // ─── Clean up existing data ───────────────────────────────────────────────
  await prisma.postHashtag.deleteMany();
  await prisma.hashtag.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.resumeVersion.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.resumeTemplate.deleteMany();
  await prisma.projectVote.deleteMany();
  await prisma.projectComment.deleteMany();
  await prisma.projectMaker.deleteMany();
  await prisma.project.deleteMany();
  await prisma.techStackItem.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ────────────────────────────────────────────────────────────────

  const alice = await prisma.user.create({
    data: {
      email: "alice@devcom.test",
      username: "alice_dev",
      passwordHash: PLACEHOLDER_PASSWORD_HASH,
      name: "Alice Johnson",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      emailVerified: true,
      profile: {
        create: {
          bio: "Full-stack developer passionate about open source and building developer tools. Love TypeScript and Rust.",
          headline: "Senior Full-Stack Engineer",
          location: "San Francisco, CA",
          website: "https://alicejohnson.dev",
        },
      },
      socialLinks: {
        create: [
          {
            platform: "Github",
            url: "https://github.com/alice-dev",
          },
          {
            platform: "Linkedin",
            url: "https://linkedin.com/in/alice-johnson-dev",
          },
          {
            platform: "Twitter",
            url: "https://twitter.com/alice_dev",
          },
        ],
      },
      techStack: {
        create: [
          {
            name: "TypeScript",
            category: "Language",
            proficiency: "Expert",
          },
          {
            name: "React",
            category: "Framework",
            proficiency: "Expert",
          },
          {
            name: "Node.js",
            category: "Framework",
            proficiency: "Advanced",
          },
          {
            name: "PostgreSQL",
            category: "Database",
            proficiency: "Advanced",
          },
          {
            name: "Docker",
            category: "Devops",
            proficiency: "Intermediate",
          },
          {
            name: "AWS",
            category: "Cloud",
            proficiency: "Intermediate",
          },
        ],
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@devcom.test",
      username: "bob_codes",
      passwordHash: PLACEHOLDER_PASSWORD_HASH,
      name: "Bob Martinez",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      emailVerified: true,
      profile: {
        create: {
          bio: "Backend engineer with a focus on distributed systems and cloud-native architectures. Golang enthusiast.",
          headline: "Backend Engineer & Cloud Architect",
          location: "Austin, TX",
          website: "https://bobmartinez.io",
        },
      },
      socialLinks: {
        create: [
          {
            platform: "Github",
            url: "https://github.com/bob-codes",
          },
          {
            platform: "Linkedin",
            url: "https://linkedin.com/in/bob-martinez-eng",
          },
          {
            platform: "Devto",
            url: "https://dev.to/bob_codes",
          },
        ],
      },
      techStack: {
        create: [
          {
            name: "Go",
            category: "Language",
            proficiency: "Expert",
          },
          {
            name: "Python",
            category: "Language",
            proficiency: "Advanced",
          },
          {
            name: "Kubernetes",
            category: "Devops",
            proficiency: "Expert",
          },
          {
            name: "MongoDB",
            category: "Database",
            proficiency: "Advanced",
          },
          {
            name: "GCP",
            category: "Cloud",
            proficiency: "Advanced",
          },
          {
            name: "TensorFlow",
            category: "AiMl",
            proficiency: "Beginner",
          },
        ],
      },
    },
  });

  console.log(`Created users: ${alice.name}, ${bob.name}`);

  // ─── Projects ─────────────────────────────────────────────────────────────

  const projectDevtools = await prisma.project.create({
    data: {
      title: "DevCom CLI Tools",
      slug: "devcom-cli-tools",
      description:
        "A suite of CLI tools for developers to streamline their workflow. Includes scaffolding generators, code formatters, and project health checkers. Built with TypeScript and published as npm packages.",
      tagline: "CLI tools suite for developer workflow automation",
      techStack: ["TypeScript", "Node.js", "Commander.js", "Vitest"],
      tags: ["cli", "developer-tools", "automation"],
      links: [
        "https://github.com/alice-dev/devcom-cli-tools",
        "https://www.npmjs.com/package/devcom-cli",
      ],
      images: [
        "https://picsum.photos/seed/devcom-cli-1/1200/800",
        "https://picsum.photos/seed/devcom-cli-2/1200/800",
      ],
      isOpenSource: true,
      status: "Active",
      phase: "Production",
      productionType: "OpenSource",
      upvotesCount: 12,
      authorId: alice.id,
      makers: {
        create: [
          { userId: alice.id, role: "Creator" },
          { userId: bob.id, role: "Contributor" },
        ],
      },
    },
  });

  const projectCloudDash = await prisma.project.create({
    data: {
      title: "CloudDash - Infrastructure Monitor",
      slug: "clouddash-infra-monitor",
      description:
        "Real-time infrastructure monitoring dashboard built with Go microservices and a React frontend. Supports AWS, GCP, and Azure. Features include cost tracking, uptime monitoring, and alerting via Slack and email.",
      tagline: "Real-time cloud infrastructure monitoring dashboard",
      techStack: ["Go", "React", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
      tags: ["monitoring", "cloud", "infrastructure", "devops"],
      links: [
        "https://github.com/bob-codes/clouddash",
        "https://clouddash-demo.bobmartinez.io",
      ],
      images: [
        "https://picsum.photos/seed/clouddash-1/1200/800",
      ],
      isOpenSource: true,
      status: "Active",
      phase: "Beta",
      productionType: "Startup",
      upvotesCount: 34,
      authorId: bob.id,
      makers: {
        create: [
          { userId: bob.id, role: "Creator" },
          { userId: alice.id, role: "Frontend Lead" },
        ],
      },
    },
  });

  console.log(
    `Created projects: ${projectDevtools.title}, ${projectCloudDash.title}`
  );

  // ─── Resume Templates ────────────────────────────────────────────────────

  const templateModern = await prisma.resumeTemplate.create({
    data: {
      name: "Modern Developer",
      description:
        "A clean, modern resume template designed for software developers. Features a sidebar for skills and contact info with a main content area for experience and projects.",
      thumbnail: "https://picsum.photos/seed/resume-modern/400/560",
      isDefault: true,
      structure: {
        layout: "two-column",
        sections: [
          {
            id: "header",
            type: "header",
            label: "Header",
            fields: ["name", "headline", "email", "phone", "location", "website"],
          },
          {
            id: "summary",
            type: "text",
            label: "Professional Summary",
            maxLength: 500,
          },
          {
            id: "experience",
            type: "list",
            label: "Work Experience",
            fields: ["company", "role", "startDate", "endDate", "description", "highlights"],
          },
          {
            id: "education",
            type: "list",
            label: "Education",
            fields: ["institution", "degree", "field", "startDate", "endDate", "gpa"],
          },
          {
            id: "skills",
            type: "tags",
            label: "Technical Skills",
            categories: ["languages", "frameworks", "tools", "platforms"],
          },
          {
            id: "projects",
            type: "list",
            label: "Projects",
            fields: ["name", "description", "techStack", "url"],
          },
          {
            id: "certifications",
            type: "list",
            label: "Certifications",
            fields: ["name", "issuer", "date", "url"],
          },
        ],
        theme: {
          primaryColor: "#2563eb",
          fontFamily: "Inter",
          fontSize: "11pt",
        },
      },
    },
  });

  const templateMinimal = await prisma.resumeTemplate.create({
    data: {
      name: "Minimal Clean",
      description:
        "A minimalist single-column resume template that puts content first. Perfect for experienced developers who want to highlight their work history.",
      thumbnail: "https://picsum.photos/seed/resume-minimal/400/560",
      isDefault: false,
      structure: {
        layout: "single-column",
        sections: [
          {
            id: "header",
            type: "header",
            label: "Header",
            fields: ["name", "headline", "email", "phone", "website", "github"],
          },
          {
            id: "experience",
            type: "list",
            label: "Experience",
            fields: ["company", "role", "startDate", "endDate", "description", "highlights"],
          },
          {
            id: "projects",
            type: "list",
            label: "Open Source & Projects",
            fields: ["name", "description", "techStack", "url"],
          },
          {
            id: "skills",
            type: "tags",
            label: "Skills",
            categories: ["languages", "frameworks", "tools"],
          },
          {
            id: "education",
            type: "list",
            label: "Education",
            fields: ["institution", "degree", "field", "year"],
          },
        ],
        theme: {
          primaryColor: "#111827",
          fontFamily: "IBM Plex Sans",
          fontSize: "10pt",
        },
      },
    },
  });

  console.log(
    `Created resume templates: ${templateModern.name}, ${templateMinimal.name}`
  );

  // ─── Posts & Comments ─────────────────────────────────────────────────────

  const hashtagTypescript = await prisma.hashtag.create({
    data: { name: "typescript", postsCount: 1 },
  });

  const hashtagWebdev = await prisma.hashtag.create({
    data: { name: "webdev", postsCount: 1 },
  });

  const hashtagGolang = await prisma.hashtag.create({
    data: { name: "golang", postsCount: 1 },
  });

  const hashtagDevops = await prisma.hashtag.create({
    data: { name: "devops", postsCount: 1 },
  });

  const hashtagOpensource = await prisma.hashtag.create({
    data: { name: "opensource", postsCount: 2 },
  });

  const postAlice = await prisma.post.create({
    data: {
      authorId: alice.id,
      type: "Snippet",
      title: "TypeScript Tip: Branded Types for Type Safety",
      content:
        "Here is a pattern I use all the time to prevent mixing up string IDs in large codebases. Branded types create nominal typing in TypeScript's structural type system, ensuring you can't accidentally pass a UserId where a PostId is expected.",
      codeSnippet: `type Brand<K, T> = K & { __brand: T };

type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;

function createUserId(id: string): UserId {
  return id as UserId;
}

function createPostId(id: string): PostId {
  return id as PostId;
}

function getUser(id: UserId) {
  // TypeScript will error if you pass a PostId here
  console.log("Fetching user:", id);
}

const userId = createUserId("user_123");
const postId = createPostId("post_456");

getUser(userId); // OK
// getUser(postId); // Error! Type 'PostId' is not assignable to type 'UserId'`,
      codeLanguage: "typescript",
      likesCount: 12,
      commentsCount: 2,
      postHashtags: {
        create: [
          { hashtagId: hashtagTypescript.id },
          { hashtagId: hashtagWebdev.id },
          { hashtagId: hashtagOpensource.id },
        ],
      },
    },
  });

  const postBob = await prisma.post.create({
    data: {
      authorId: bob.id,
      type: "Article",
      title: "Why I Switched from Microservices to a Modular Monolith",
      content:
        "After running 15+ microservices in production for two years, we made the bold decision to consolidate into a modular monolith. Here is what we learned.\n\n## The Problem\n\nOur team of 6 engineers was spending more time on infrastructure and inter-service communication than on actual features. Debugging distributed transactions was a nightmare, and our deployment pipeline had become a complex web of dependencies.\n\n## The Solution\n\nWe adopted a modular monolith architecture using Go with clear module boundaries. Each module has its own internal package structure, and communication happens through well-defined interfaces rather than HTTP/gRPC calls.\n\n## Key Benefits\n\n1. **Simplified debugging** - One process, one log stream, easy stack traces\n2. **Faster development** - No need to spin up 15 services locally\n3. **Reduced infrastructure costs** - 60% reduction in cloud spend\n4. **Easier refactoring** - The compiler catches breaking changes across modules\n\n## When Microservices Still Make Sense\n\nThis is not an anti-microservices post. If you have a large org with many teams, different scaling requirements per service, or polyglot needs, microservices are still the right choice. But for small-to-medium teams, a modular monolith gives you most of the benefits with far less operational overhead.\n\nHappy to discuss our migration strategy in the comments!",
      likesCount: 34,
      commentsCount: 3,
      postHashtags: {
        create: [
          { hashtagId: hashtagGolang.id },
          { hashtagId: hashtagDevops.id },
          { hashtagId: hashtagOpensource.id },
        ],
      },
    },
  });

  // Comments on Alice's post
  await prisma.comment.create({
    data: {
      postId: postAlice.id,
      authorId: bob.id,
      content:
        "This is a great pattern! I have been using something similar in our Go codebase with custom types. The compiler-level safety is invaluable in large projects.",
    },
  });

  const aliceReply = await prisma.comment.create({
    data: {
      postId: postAlice.id,
      authorId: alice.id,
      content:
        "Thanks Bob! Yeah, Go has the advantage of nominal typing built in. In TypeScript we have to work around the structural type system, but the result is just as effective.",
    },
  });

  // Comments on Bob's post
  await prisma.comment.create({
    data: {
      postId: postBob.id,
      authorId: alice.id,
      content:
        "Great write-up! We went through a similar transition at my previous company. The key insight for us was that module boundaries in a monolith can later become service boundaries if you truly need to scale independently. Start simple, split later.",
    },
  });

  const bobReplyOnOwnPost = await prisma.comment.create({
    data: {
      postId: postBob.id,
      authorId: bob.id,
      content:
        "Exactly! That is what we call the 'modular monolith to microservices' escape hatch. If a module needs independent scaling, you can extract it into its own service with minimal refactoring since the interfaces are already clean.",
    },
  });

  // A nested reply
  await prisma.comment.create({
    data: {
      postId: postBob.id,
      authorId: alice.id,
      content:
        "That escape hatch approach is exactly what Martin Fowler recommends too. Monolith-first, then extract when there is a clear need.",
      parentId: bobReplyOnOwnPost.id,
    },
  });

  // Reactions
  await prisma.reaction.createMany({
    data: [
      { postId: postAlice.id, userId: bob.id, type: "Like" },
      { postId: postAlice.id, userId: bob.id, type: "Insightful" },
      { postId: postBob.id, userId: alice.id, type: "Like" },
      { postId: postBob.id, userId: alice.id, type: "Celebrate" },
    ],
  });

  console.log(`Created posts: "${postAlice.title}", "${postBob.title}" with comments and reactions`);

  // ─── Project Votes ───────────────────────────────────────────────────────

  await prisma.projectVote.createMany({
    data: [
      { projectId: projectDevtools.id, userId: bob.id, value: 1 },
      { projectId: projectCloudDash.id, userId: alice.id, value: 1 },
    ],
  });

  console.log("\nSeeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
