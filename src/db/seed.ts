import mongoose from "mongoose";
import { config } from "../config/index.js";
import { Submission } from "../modules/submissions/submission.model.js";
import { Notification } from "../modules/notifications/notification.model.js";

// ─── Data Pools ────────────────────────────────────────

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael",
  "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan",
  "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen",
  "Charles", "Lisa", "Daniel", "Nancy", "Matthew", "Betty", "Anthony",
  "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly",
  "Andrew", "Emily", "Paul", "Donna", "Joshua", "Michelle", "Kenneth",
  "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa",
  "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca",
  "Jason", "Sharon", "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob",
  "Kathleen", "Gary", "Amy", "Nicholas", "Angela", "Eric", "Shirley",
  "Jonathan", "Anna", "Stephen", "Brenda", "Larry", "Pamela", "Justin",
  "Emma", "Scott", "Nicole", "Brandon", "Helen", "Benjamin", "Samantha",
  "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
  "Frank", "Rachel", "Alexander", "Carolyn", "Patrick", "Janet",
  "Jack", "Catherine", "Dennis", "Maria", "Jerry", "Heather",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz",
  "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris",
  "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan",
];

const COMPANIES = [
  "Acme Corp", "TechFlow Inc", "DataBridge Solutions", "NovaStar Systems",
  "CloudPeak Technologies", "Vertex Digital", "Horizon Labs", "Quantum Dynamics",
  "SkyLine Software", "Pinnacle Group", "Atlas Ventures", "Nexus Innovations",
  "Catalyst Partners", "Forge Analytics", "Prism Solutions", "Summit AI",
  "Vanguard Tech", "Blueprint Systems", "Meridian Data", "Apex Engineering",
  "Cobalt Industries", "Ember Creative", "Fusion Works", "Genesis Digital",
  "Helix Technologies", "Ionic Solutions", "Keystone Labs", "Lunar Systems",
  "Matrix Consulting", "Nebula Software", "Onyx Group", "Pulse Digital",
  "Radiant Tech", "Stratos AI", "Titan Innovations", "Unity Solutions",
  "Vector Labs", "Waveform Inc", "Zenith Partners", "Aurora Networks",
  "BrightPath Solutions", "CoreLogic Systems", "DawnTech", "EchoPoint Digital",
  "FrontLine AI", "GreenField Data", "HighTower Systems", "InnoVault",
  "JetStream Solutions", "KinetikLabs",
];

const JOB_TITLES = [
  "CEO", "CTO", "VP of Engineering", "Head of Product", "Director of Marketing",
  "Senior Engineer", "Product Manager", "Engineering Manager", "Design Lead",
  "Data Scientist", "DevOps Lead", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "UX Designer", "QA Lead", "Scrum Master",
  "Technical Lead", "Solutions Architect", "Cloud Engineer", "VP of Sales",
  "Marketing Manager", "Operations Director", "Chief Revenue Officer",
  "Head of Growth", "Customer Success Manager", "Account Executive",
  "Business Analyst", "Project Manager", "Software Consultant",
];

const TESTIMONIAL_TEMPLATES = [
  "This product has completely transformed how our team operates. We've seen a {percent}% improvement in productivity since adopting it.",
  "Incredible platform! The ease of use and powerful features make it stand out from everything else we've tried. Highly recommended.",
  "We switched from {competitor} and couldn't be happier. The integration was seamless and our team was up and running in days.",
  "The customer support team is outstanding. They went above and beyond to help us customize the platform for our specific needs.",
  "After evaluating {count} different solutions, we chose this one and it was the best decision we made all year.",
  "Our team loves working with this tool. It's intuitive, fast, and has all the features we need to stay organized.",
  "The ROI has been remarkable. Within {months} months, we recouped our investment and then some. A game-changer for our business.",
  "Simple yet powerful. The interface is clean and the automation features save us hours every week.",
  "We've been using this for over a year and it keeps getting better. The regular updates and new features show a team that really cares.",
  "Outstanding product. It solved problems we didn't even know we had. The analytics dashboard alone is worth the price.",
  "Perfect for growing teams. As we scaled from {start} to {end} people, the platform grew with us effortlessly.",
  "The API is well-documented and easy to integrate with. Our developers had everything connected within a sprint.",
  "Best-in-class solution for our industry. The domain-specific features show deep understanding of our challenges.",
  "We were skeptical at first, but the free trial convinced us. Now our entire organization relies on it daily.",
  "Exceptional value for the price. Enterprise-grade features without the enterprise-grade complexity or cost.",
  "The onboarding process was smooth and well-guided. Our team adopted it quickly without any major hiccups.",
  "Reliable and performant. We process thousands of transactions daily and have never experienced downtime.",
  "This tool has become essential to our workflow. I can't imagine going back to how we did things before.",
  "Great collaboration features. It brought our remote team closer together and improved communication across departments.",
  "The security features give us peace of mind. SOC 2 compliance and encrypted data storage are must-haves for us.",
  "Love the mobile experience. Being able to manage everything on the go has been incredibly useful for our field team.",
  "The reporting capabilities are top-notch. Custom dashboards and automated reports save our leadership hours each week.",
  "We've tried many tools over the years, but this is the one that stuck. It just works, and it works well.",
  "Fantastic product for startups. The pricing is fair and the features scale well as your business grows.",
  "The integration ecosystem is impressive. It connects with all our existing tools seamlessly.",
];

const COMPETITORS = [
  "the old system", "a competitor", "spreadsheets", "manual processes",
  "our previous tool", "an in-house solution", "another platform",
];

const VIDEO_URLS = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://vimeo.com/123456789",
  "https://www.youtube.com/watch?v=example1",
  "https://www.loom.com/share/abc123",
  "https://www.youtube.com/watch?v=example2",
];

const SOCIAL_URLS = [
  "https://twitter.com/user/status/123456789",
  "https://www.linkedin.com/posts/user_activity-123456789",
  "https://x.com/user/status/987654321",
  "https://www.linkedin.com/feed/update/urn:li:activity:123456789",
];

const REVIEW_URLS = [
  "https://www.g2.com/products/example/reviews/123456",
  "https://www.capterra.com/p/example/reviews/123456",
  "https://www.trustpilot.com/reviews/123456",
  "https://www.producthunt.com/products/example/reviews",
];

// ─── Helpers ───────────────────────────────────────────

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(months: number): Date {
  const now = Date.now();
  const past = now - months * 30 * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

function generateTestimonialText(): string {
  let text = randomItem(TESTIMONIAL_TEMPLATES);
  text = text.replace("{percent}", String(randomInt(15, 85)));
  text = text.replace("{competitor}", randomItem(COMPETITORS));
  text = text.replace("{count}", String(randomInt(3, 15)));
  text = text.replace("{months}", String(randomInt(2, 8)));
  text = text.replace("{start}", String(randomInt(10, 50)));
  text = text.replace("{end}", String(randomInt(100, 500)));
  return text;
}

function weightedRating(): number {
  // Weighted toward higher ratings (realistic distribution)
  const weights = [0.05, 0.1, 0.15, 0.30, 0.40]; // 1-5
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) return i + 1;
  }
  return 5;
}

type TestimonialType = "WRITTEN" | "VIDEO" | "SOCIAL" | "REVIEW";
type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

function weightedType(): TestimonialType {
  const rand = Math.random();
  if (rand < 0.50) return "WRITTEN";
  if (rand < 0.75) return "VIDEO";
  if (rand < 0.90) return "SOCIAL";
  return "REVIEW";
}

function weightedStatus(): SubmissionStatus {
  const rand = Math.random();
  if (rand < 0.60) return "PENDING";
  if (rand < 0.85) return "APPROVED";
  return "REJECTED";
}

function getSourceUrl(type: TestimonialType): string | undefined {
  switch (type) {
    case "VIDEO":
      return randomItem(VIDEO_URLS);
    case "SOCIAL":
      return randomItem(SOCIAL_URLS);
    case "REVIEW":
      return randomItem(REVIEW_URLS);
    default:
      return undefined;
  }
}

// ─── Main Seed Function ────────────────────────────────

async function seed() {
  const TOTAL = 20_000;
  const BATCH_SIZE = 1_000;

  console.log("Connecting to MongoDB...");
  await mongoose.connect(config.mongodbUri);
  console.log("Connected.");

  // Clear existing data
  console.log("Clearing existing data...");
  await Promise.all([
    Submission.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log(`Generating ${TOTAL.toLocaleString()} submissions...`);

  let created = 0;
  const startTime = Date.now();

  for (let batch = 0; batch < TOTAL / BATCH_SIZE; batch++) {
    const submissions = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const firstName = randomItem(FIRST_NAMES);
      const lastName = randomItem(LAST_NAMES);
      const type = weightedType();
      const status = weightedStatus();
      const createdAt = randomDate(6);

      submissions.push({
        customer: {
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}@example.com`,
          company: randomItem(COMPANIES),
          jobTitle: randomItem(JOB_TITLES),
        },
        rating: weightedRating(),
        testimonial: {
          text: generateTestimonialText(),
          type,
          sourceUrl: getSourceUrl(type),
        },
        status,
        ...(status !== "PENDING" && {
          reviewedBy: "reviewer@proofdesk.local",
          reviewedAt: new Date(
            createdAt.getTime() + randomInt(1, 72) * 60 * 60 * 1000
          ),
        }),
        createdAt,
        updatedAt: createdAt,
      });
    }

    await Submission.insertMany(submissions);
    created += BATCH_SIZE;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `  ${created.toLocaleString()} / ${TOTAL.toLocaleString()} (${elapsed}s)`
    );
  }

  // Generate some notifications for already-reviewed submissions
  console.log("Generating notifications for reviewed submissions...");
  const reviewed = await Submission.find({
    status: { $in: ["APPROVED", "REJECTED"] },
  })
    .select({ _id: 1, "customer.email": 1, status: 1 })
    .lean();

  const notificationBatches = [];
  for (let i = 0; i < reviewed.length; i += BATCH_SIZE) {
    const batch = reviewed.slice(i, i + BATCH_SIZE).map((sub) => ({
      submissionId: sub._id,
      recipientEmail: sub.customer.email,
      type: sub.status as "APPROVED" | "REJECTED",
      message:
        sub.status === "APPROVED"
          ? "Your testimonial has been approved. Thank you for your feedback!"
          : "Your testimonial has been reviewed and was not approved at this time.",
    }));
    notificationBatches.push(Notification.insertMany(batch));
  }

  await Promise.all(notificationBatches);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const counts = await Submission.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  console.log("\n─── Seed Complete ───");
  console.log(`Total: ${TOTAL.toLocaleString()} submissions`);
  counts.forEach((c) => console.log(`  ${c._id}: ${c.count.toLocaleString()}`));
  console.log(`  Notifications: ${reviewed.length.toLocaleString()}`);
  console.log(`  Time: ${totalTime}s`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
