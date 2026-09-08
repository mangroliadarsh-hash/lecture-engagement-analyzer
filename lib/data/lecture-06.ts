import { defineLecture } from "./build-lecture"
import { toSeconds as s } from "@/lib/format"
import type { Hotspot, QuestionCluster, Recommendation } from "./types"

const hotspots: Hotspot[] = [
  {
    id: "h6-1204",
    start: s("11:40"),
    end: s("12:50"),
    peak: s("12:04"),
    topic: "Probability Basics",
    label: "Question cluster",
    primarySignal: "questions",
    severity: "medium",
    questionCount: 14,
    rewatchIncrease: 16,
    engagementDelta: -6,
    difficulty: {
      score: 58,
      complexity: "Medium",
      concepts: ["Conditional probability", "Independence"],
      prerequisites: ["Fractions", "Set notation"],
      rationale:
        "Medium difficulty detected because conditional probability notation is introduced without a concrete example.",
      confidence: 0.8,
    },
    evidence: [
      { signal: "questions", label: "14 related questions" },
      { signal: "rewatch", label: "16% re-watch increase" },
      { signal: "engagement", label: "6% engagement decline" },
    ],
    interpretation:
      "Students ask what the vertical bar in P(A|B) means, suggesting the notation itself is the barrier.",
    recommendation:
      "Read P(A|B) aloud as 'probability of A given B' every time it appears for the first five minutes.",
    confidence: 0.82,
  },
  {
    id: "h6-2846",
    start: s("28:20"),
    end: s("29:30"),
    peak: s("28:46"),
    topic: "Bayes' Theorem",
    label: "High confusion",
    primarySignal: "confusion",
    severity: "high",
    questionCount: 22,
    rewatchIncrease: 29,
    engagementDelta: -11,
    dropoffStudents: 18,
    difficulty: {
      score: 79,
      complexity: "High",
      concepts: ["Bayes' Theorem", "Prior", "Posterior", "Likelihood"],
      prerequisites: ["Conditional probability", "Algebraic rearrangement"],
      rationale:
        "High difficulty detected because four named terms are introduced in a single formula.",
      confidence: 0.87,
    },
    evidence: [
      { signal: "questions", label: "22 related questions" },
      { signal: "rewatch", label: "29% re-watch increase" },
      { signal: "engagement", label: "11% engagement decline" },
      { signal: "difficulty", label: "High AI-estimated difficulty (79/100)" },
    ],
    interpretation:
      "Students can follow the algebra but ask what prior and posterior mean in practice. The vocabulary, not the math, is the obstacle.",
    recommendation:
      "Introduce Bayes' theorem with the medical test example first, then attach the formal names to each quantity.",
    confidence: 0.88,
  },
  {
    id: "h6-4410",
    start: s("43:50"),
    end: s("44:50"),
    peak: s("44:10"),
    topic: "Naive Bayes",
    label: "Major drop-off",
    primarySignal: "dropoff",
    severity: "medium",
    questionCount: 8,
    rewatchIncrease: 9,
    engagementDelta: -9,
    dropoffStudents: 31,
    difficulty: {
      score: 66,
      complexity: "Medium",
      concepts: ["Naive Bayes", "Independence assumption"],
      prerequisites: ["Bayes' Theorem", "Products of probabilities"],
      rationale:
        "Medium difficulty. The drop-off is likely fatigue combined with the earlier Bayes confusion compounding.",
      confidence: 0.72,
    },
    evidence: [
      { signal: "dropoff", label: "31 students left within a minute" },
      { signal: "questions", label: "8 related questions" },
      { signal: "engagement", label: "9% engagement decline" },
    ],
    interpretation:
      "Students who did not resolve Bayes' theorem at 28:46 appear to leave here rather than ask.",
    recommendation:
      "Add a two-sentence recap of Bayes' theorem before introducing the independence assumption.",
    confidence: 0.75,
  },
]

const clusters: QuestionCluster[] = [
  {
    id: "c6-1",
    hotspotId: "h6-1204",
    start: s("11:40"),
    end: s("12:50"),
    topic: "Probability Basics",
    concept: "Conditional probability",
    count: 14,
    severity: "medium",
    representative: [
      "What does the vertical bar in P(A|B) mean?",
      "Is P(A|B) the same as P(B|A)?",
    ],
  },
  {
    id: "c6-2",
    hotspotId: "h6-2846",
    start: s("28:20"),
    end: s("29:30"),
    topic: "Bayes' Theorem",
    concept: "Prior vs. posterior",
    count: 22,
    severity: "high",
    representative: [
      "What is the difference between the prior and the posterior?",
      "Where does the prior come from in a real problem?",
      "Why do we divide by P(B)?",
    ],
  },
  {
    id: "c6-3",
    hotspotId: "h6-4410",
    start: s("43:50"),
    end: s("44:50"),
    topic: "Naive Bayes",
    concept: "Independence assumption",
    count: 8,
    severity: "medium",
    representative: [
      "Why is it called 'naive'?",
      "Does the independence assumption ever actually hold?",
    ],
  },
]

const recommendations: Recommendation[] = [
  {
    id: "r6-1",
    hotspotId: "h6-2846",
    timestamp: s("28:46"),
    action: "Lead with the medical test example before the formula",
    problem: "Four new terms introduced at once",
    evidence: "22 related questions + 29% re-watch increase",
    priority: "High",
  },
  {
    id: "r6-2",
    hotspotId: "h6-1204",
    timestamp: s("12:04"),
    action: "Read conditional probability notation aloud on first uses",
    problem: "Notation barrier",
    evidence: "14 related questions about the vertical bar",
    priority: "Medium",
  },
  {
    id: "r6-3",
    hotspotId: "h6-4410",
    timestamp: s("44:10"),
    action: "Recap Bayes' theorem before the independence assumption",
    problem: "Compounding confusion leading to exit",
    evidence: "31 students left within a minute",
    priority: "Medium",
  },
]

const rawTranscript = [
  { id: "t6-01", start: s("00:00"), end: s("03:00"), section: "Introduction", text: "Welcome to lecture six. Today we step back from models and talk about the language underneath all of them: probability. If you're rusty, that's fine. We'll build from the ground up." },
  { id: "t6-02", start: s("03:00"), end: s("07:30"), section: "Probability Basics", text: "A probability is a number between zero and one that says how likely something is. Events, sample spaces, the usual definitions. We'll move quickly through this part." },
  { id: "t6-03", start: s("07:30"), end: s("11:40"), section: "Probability Basics", text: "Two events are independent if knowing one tells you nothing about the other. A coin flip and tomorrow's weather. Most interesting things are not independent, which is the whole point." },
  { id: "t6-04", start: s("11:40"), end: s("12:50"), section: "Probability Basics", text: "Conditional probability: P of A given B, written with a vertical bar. It's the probability of A once we already know B happened. Formally, P(A and B) divided by P(B)." },
  { id: "t6-05", start: s("12:50"), end: s("18:00"), section: "Probability Basics", text: "Let's do an example. If it rains, there's an eighty percent chance the game is cancelled. That's P(cancelled | rain) equals 0.8. The condition narrows the world we're reasoning about." },
  { id: "t6-06", start: s("18:00"), end: s("24:00"), section: "Random Variables", text: "A random variable assigns a number to each outcome. Discrete ones take countable values, continuous ones take any value in a range. Expectation is the long-run average." },
  { id: "t6-07", start: s("24:00"), end: s("28:20"), section: "Bayes' Theorem", text: "Now the centerpiece. We often know P(B|A) but want P(A|B). A test result given a disease, versus a disease given a test result. Bayes' theorem lets us flip the conditional." },
  { id: "t6-08", start: s("28:20"), end: s("29:30"), section: "Bayes' Theorem", text: "P(A|B) equals P(B|A) times P(A), divided by P(B). We call P(A) the prior, P(B|A) the likelihood, and P(A|B) the posterior. The prior is what we believed before seeing evidence; the posterior is what we believe after." },
  { id: "t6-09", start: s("29:30"), end: s("36:00"), section: "Bayes' Theorem", text: "Medical test example. One percent of people have the disease. The test catches ninety-nine percent of cases but has a five percent false positive rate. You test positive. What's the chance you're sick? Most people guess ninety-plus percent. The answer is about seventeen." },
  { id: "t6-10", start: s("36:00"), end: s("43:50"), section: "Naive Bayes", text: "Let's turn this into a classifier. For spam detection, A is 'spam' and B is the words in the email. We want P(spam | words). Bayes gives us a way to compute it from how often words appear in spam versus not." },
  { id: "t6-11", start: s("43:50"), end: s("44:50"), section: "Naive Bayes", text: "The catch: P(words | spam) for every combination of words is impossible to estimate. So we make an assumption: each word is independent given the class. That's the naive part. It's wrong, and it works anyway." },
  { id: "t6-12", start: s("44:50"), end: s("52:00"), section: "Naive Bayes", text: "With independence, the joint probability becomes a product of individual word probabilities. Now it's just counting. We'll implement this in the lab and you'll see it hit ninety-five percent accuracy on real email." },
  { id: "t6-13", start: s("52:00"), end: s("55:00"), section: "Wrap-up", text: "Recap: conditional probability, Bayes' theorem, prior and posterior, and one assumption that turns theory into a working classifier. Next week we return to regression and see how learning actually happens." },
]

export const lecture06 = defineLecture({
  id: "ml-06",
  course: "Introduction to Machine Learning",
  number: 6,
  title: "Probability and Bayes' Theorem",
  instructor: "Dr. Priya Raman",
  recordedAt: "2026-08-25",
  durationSec: 55 * 60,
  status: "analyzed",
  students: 486,
  startEngagement: 89,
  endEngagement: 81,
  shapes: [
    { peak: s("12:04"), width: 45, engagementDip: 8, rewatch: 14, pauses: 8, questions: 7, difficulty: 18, confusion: 30, dropoff: 1.1 },
    { peak: s("28:46"), width: 50, engagementDip: 14, rewatch: 26, pauses: 12, questions: 11, difficulty: 34, confusion: 52, dropoff: 3.4 },
    { peak: s("44:10"), width: 45, engagementDip: 12, rewatch: 8, pauses: 6, questions: 4, difficulty: 24, confusion: 28, dropoff: 6.2 },
  ],
  hotspots,
  clusters,
  recommendations,
  concepts: [
    { name: "Bayes' Theorem", score: 79, hotspotId: "h6-2846" },
    { name: "Naive Bayes", score: 66, hotspotId: "h6-4410" },
    { name: "Conditional Probability", score: 58, hotspotId: "h6-1204" },
  ],
  summary:
    "Students showed the highest confusion around Bayes' theorem at 28:46, where four named quantities were introduced in a single formula. The vocabulary, not the algebra, appears to be the barrier. A secondary drop-off at 44:10 is consistent with unresolved confusion compounding into disengagement.",
  rawTranscript,
})
