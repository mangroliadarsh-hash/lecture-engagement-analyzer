import { toSeconds as s } from "@/lib/format"
import type { StudentQuestion } from "./types"

const minutesAgo = (m: number) =>
  new Date(Date.now() - m * 60_000).toISOString()

export const initialStudentQuestions: StudentQuestion[] = [
  {
    id: "sq-1",
    lectureId: "ml-07",
    timestamp: s("17:22"),
    topic: "Gradient Descent",
    question: "Why do we subtract the gradient instead of adding it?",
    transcriptExcerpt:
      "The gradient tells us which direction increases the loss, so we go the opposite way.",
    aiExplanation:
      "Based on this lecture: the gradient points in the direction where the loss increases fastest. Since we want to reduce the loss, we move in the opposite direction, which is why the update subtracts the gradient.",
    status: "new",
    submittedAt: minutesAgo(14),
    studentName: "Aisha K.",
  },
  {
    id: "sq-2",
    lectureId: "ml-07",
    timestamp: s("24:35"),
    topic: "Loss Functions",
    question: "Why do we square the error instead of taking the absolute value?",
    transcriptExcerpt:
      "Squaring makes every error positive so they don't cancel out, and it punishes large errors much more than small ones.",
    aiExplanation:
      "Based on this lecture: squaring keeps every error positive and penalizes large errors much more heavily than small ones. The lecture also mentions mean absolute error as a more outlier-tolerant alternative.",
    status: "new",
    submittedAt: minutesAgo(41),
    studentName: "Marcus T.",
  },
  {
    id: "sq-3",
    lectureId: "ml-07",
    timestamp: s("41:58"),
    topic: "Regularization",
    question: "What do the double bars around w mean?",
    transcriptExcerpt:
      "L2 regularization adds lambda times the squared norm of w to the loss.",
    status: "new",
    submittedAt: minutesAgo(120),
    studentName: "Chen W.",
  },
  {
    id: "sq-4",
    lectureId: "ml-07",
    timestamp: s("32:15"),
    topic: "Learning Rate",
    question: "How do you pick a good learning rate in practice?",
    transcriptExcerpt:
      "Start around 0.01, look at the loss curve, and adjust.",
    aiExplanation:
      "Based on this lecture: the instructor suggests starting near 0.01, watching the loss curve, and adjusting. Learning rate schedules that shrink alpha over time are mentioned for the assignment.",
    status: "answered",
    submittedAt: minutesAgo(60 * 26),
    studentName: "Priyanka S.",
  },
  {
    id: "sq-5",
    lectureId: "ml-07",
    timestamp: s("08:50"),
    topic: "Training Data",
    question: "How much data should go in the test set?",
    transcriptExcerpt:
      "A common split is eighty-twenty. There's nothing magic about those numbers, but the principle is non-negotiable.",
    status: "faq",
    submittedAt: minutesAgo(60 * 50),
    studentName: "Diego R.",
  },
]
