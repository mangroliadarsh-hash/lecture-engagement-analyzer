import { defineLecture } from "./build-lecture"
import { toSeconds as s } from "@/lib/format"
import type { Hotspot, QuestionCluster, Recommendation } from "./types"

const hotspots: Hotspot[] = [
  {
    id: "h-0842",
    start: s("08:20"),
    end: s("09:20"),
    peak: s("08:42"),
    topic: "Training Data",
    label: "High confusion",
    primarySignal: "confusion",
    severity: "medium",
    questionCount: 12,
    rewatchIncrease: 18,
    engagementDelta: -7,
    difficulty: {
      score: 61,
      complexity: "Medium",
      concepts: ["Training set", "Test set", "Generalization"],
      prerequisites: ["Sampling", "Basic statistics"],
      rationale:
        "Moderate difficulty detected because the segment introduces the train/test split without a concrete example of why held-out data matters.",
      confidence: 0.78,
    },
    evidence: [
      { signal: "questions", label: "12 related questions" },
      { signal: "rewatch", label: "18% re-watch increase" },
      { signal: "engagement", label: "7% engagement decline" },
      { signal: "difficulty", label: "Medium AI-estimated difficulty" },
    ],
    interpretation:
      "Students appear unsure why data must be split before training. Questions focus on what happens if the model sees the test data.",
    recommendation:
      "Add a short worked example showing a model memorizing its training set, then failing on new data.",
    confidence: 0.81,
  },
  {
    id: "h-1715",
    start: s("17:15"),
    end: s("18:10"),
    peak: s("17:15"),
    topic: "Gradient Descent",
    label: "Re-watch spike + major confusion",
    primarySignal: "rewatch",
    severity: "high",
    questionCount: 19,
    rewatchIncrease: 34,
    engagementDelta: -12,
    difficulty: {
      score: 82,
      complexity: "High",
      concepts: ["Gradient Descent", "Optimization", "Learning Rate"],
      prerequisites: ["Derivatives", "Functions", "Basic Algebra"],
      rationale:
        "Multiple new concepts are introduced within a short time window, while learner interaction signals indicate increased friction.",
      confidence: 0.93,
    },
    evidence: [
      { signal: "questions", label: "19 related questions" },
      { signal: "rewatch", label: "34% re-watch increase" },
      { signal: "engagement", label: "12% engagement decline" },
      { signal: "difficulty", label: "AI-estimated difficulty: 82/100" },
      { signal: "difficulty", label: "Multiple prerequisite concepts detected" },
    ],
    interpretation:
      "Multiple independent signals indicate increased learner friction around this section.",
    recommendation:
      "Add a visual explanation of Gradient Descent and briefly recap the prerequisite concepts.",
    confidence: 0.93,
  },
  {
    id: "h-2431",
    start: s("24:20"),
    end: s("25:00"),
    peak: s("24:31"),
    topic: "Loss Functions",
    label: "Major drop-off",
    primarySignal: "dropoff",
    severity: "high",
    questionCount: 27,
    rewatchIncrease: 22,
    engagementDelta: -15,
    dropoffStudents: 46,
    difficulty: {
      score: 76,
      complexity: "High",
      concepts: ["Mean Squared Error", "Residuals", "Loss surface"],
      prerequisites: ["Squares and sums", "Summation notation"],
      rationale:
        "High difficulty detected because summation notation is introduced alongside a new concept, doubling the cognitive load in under a minute.",
      confidence: 0.86,
    },
    evidence: [
      { signal: "dropoff", label: "46 students left within 40 seconds" },
      { signal: "questions", label: "27 related questions" },
      { signal: "rewatch", label: "22% re-watch increase" },
      { signal: "engagement", label: "15% engagement decline" },
    ],
    interpretation:
      "The MSE formula is the largest single exit point in the lecture. Students who stay ask how the model knows whether a prediction is correct, which indicates the purpose of a loss function was not motivated before the notation.",
    recommendation:
      "Motivate the loss function with a single prediction and its error before showing the full MSE formula; expand the summation for three data points.",
    confidence: 0.89,
  },
  {
    id: "h-3208",
    start: s("31:40"),
    end: s("33:00"),
    peak: s("32:08"),
    topic: "Learning Rate",
    label: "Question cluster",
    primarySignal: "questions",
    severity: "medium",
    questionCount: 16,
    rewatchIncrease: 14,
    engagementDelta: -5,
    difficulty: {
      score: 68,
      complexity: "Medium",
      concepts: ["Learning Rate", "Convergence", "Divergence"],
      prerequisites: ["Gradient Descent", "Sequences"],
      rationale:
        "Medium difficulty detected. The concept builds directly on gradient descent, so confusion here is likely inherited from the 17:15 segment.",
      confidence: 0.8,
    },
    evidence: [
      { signal: "questions", label: "16 related questions" },
      { signal: "questions", label: "Question topics overlap with 17:15 cluster" },
      { signal: "rewatch", label: "14% re-watch increase" },
    ],
    interpretation:
      "Students ask why the learning rate can't simply be increased. This is a downstream effect of the weak gradient descent intuition earlier in the lecture.",
    recommendation:
      "Show two animated runs side by side: a small learning rate converging slowly and a large one overshooting and diverging.",
    confidence: 0.84,
  },
  {
    id: "h-4152",
    start: s("41:30"),
    end: s("42:40"),
    peak: s("41:52"),
    topic: "Regularization",
    label: "High semantic difficulty",
    primarySignal: "difficulty",
    severity: "medium",
    questionCount: 9,
    rewatchIncrease: 20,
    engagementDelta: -8,
    difficulty: {
      score: 88,
      complexity: "High",
      concepts: ["Overfitting", "L2 Regularization", "Bias–variance"],
      prerequisites: ["Loss Functions", "Model complexity", "Vector norms"],
      rationale:
        "Very high difficulty detected because the penalty term references vector norms that were never defined in this course.",
      confidence: 0.88,
    },
    evidence: [
      { signal: "difficulty", label: "AI-estimated difficulty 88/100" },
      { signal: "rewatch", label: "20% re-watch increase" },
      { signal: "questions", label: "9 related questions" },
      { signal: "difficulty", label: "Undefined prerequisite: vector norms" },
    ],
    interpretation:
      "Fewer questions than other hotspots, but the questions that exist ask what the double bars mean, suggesting students disengaged rather than asked.",
    recommendation:
      "Define the L2 norm in plain language (\"how big the weights are\") before writing the penalty term.",
    confidence: 0.79,
  },
  {
    id: "h-5120",
    start: s("51:00"),
    end: s("52:00"),
    peak: s("51:20"),
    topic: "Model Evaluation",
    label: "Re-watch spike",
    primarySignal: "rewatch",
    severity: "low",
    questionCount: 7,
    rewatchIncrease: 26,
    engagementDelta: -3,
    difficulty: {
      score: 57,
      complexity: "Medium",
      concepts: ["Precision", "Recall", "Confusion matrix"],
      prerequisites: ["Ratios", "Classification"],
      rationale:
        "Moderate difficulty. Re-watches are concentrated on the confusion matrix slide, which is dense but conceptually simple.",
      confidence: 0.74,
    },
    evidence: [
      { signal: "rewatch", label: "26% re-watch increase" },
      { signal: "questions", label: "7 related questions" },
      { signal: "engagement", label: "Engagement stable (−3%)" },
    ],
    interpretation:
      "Students are re-watching to copy the confusion matrix rather than because they are lost. Engagement stays high.",
    recommendation:
      "Provide the confusion matrix as a downloadable slide and pause for five seconds after it appears.",
    confidence: 0.77,
  },
]

const clusters: QuestionCluster[] = [
  {
    id: "c-1",
    hotspotId: "h-0842",
    start: s("08:40"),
    end: s("09:20"),
    topic: "Training Data",
    concept: "Train/test split",
    count: 12,
    severity: "medium",
    representative: [
      "Why can't we test the model on the same data we trained it on?",
      "How much data should go in the test set?",
      "What does it mean for a model to 'memorize' the data?",
    ],
  },
  {
    id: "c-2",
    hotspotId: "h-1715",
    start: s("17:15"),
    end: s("18:10"),
    topic: "Gradient Descent",
    concept: "Update rule intuition",
    count: 19,
    severity: "high",
    representative: [
      "Why does the learning rate affect convergence?",
      "Why can't we increase the learning rate indefinitely?",
      "How does gradient descent know which direction to move?",
    ],
  },
  {
    id: "c-3",
    hotspotId: "h-2431",
    start: s("24:20"),
    end: s("25:00"),
    topic: "Loss Functions",
    concept: "Mean Squared Error",
    count: 27,
    severity: "high",
    representative: [
      "How does the model know whether the prediction is correct?",
      "Why do we square the error instead of taking the absolute value?",
      "What does the summation symbol mean here?",
    ],
  },
  {
    id: "c-4",
    hotspotId: "h-3208",
    start: s("31:40"),
    end: s("33:00"),
    topic: "Learning Rate",
    concept: "Convergence vs. divergence",
    count: 16,
    severity: "medium",
    representative: [
      "Why can't we increase the learning rate indefinitely?",
      "How do you pick a good learning rate in practice?",
      "What happens if the learning rate is too small?",
    ],
  },
  {
    id: "c-5",
    hotspotId: "h-4152",
    start: s("41:30"),
    end: s("42:40"),
    topic: "Regularization",
    concept: "L2 penalty",
    count: 9,
    severity: "medium",
    representative: [
      "What do the double bars around w mean?",
      "Why does penalizing large weights reduce overfitting?",
    ],
  },
  {
    id: "c-6",
    hotspotId: "h-5120",
    start: s("51:00"),
    end: s("52:00"),
    topic: "Model Evaluation",
    concept: "Precision and recall",
    count: 7,
    severity: "low",
    representative: [
      "Is precision or recall more important for spam detection?",
      "Can you share the confusion matrix slide?",
    ],
  },
]

const recommendations: Recommendation[] = [
  {
    id: "r-1",
    hotspotId: "h-1715",
    timestamp: s("17:15"),
    action: "Add a visual explanation of Gradient Descent",
    problem: "High re-watch activity + question cluster",
    evidence: "34% re-watch increase + 19 related questions",
    priority: "High",
  },
  {
    id: "r-2",
    hotspotId: "h-1715",
    timestamp: s("17:15"),
    action: "Add a prerequisite recap",
    problem: "Multiple prerequisite concepts detected",
    evidence: "Derivatives, Functions, and Basic Algebra prerequisites introduced simultaneously",
    priority: "High",
  },
  {
    id: "r-3",
    hotspotId: "h-1715",
    timestamp: s("17:15"),
    action: "Add a concrete example",
    problem: "High AI-estimated difficulty",
    evidence: "AI-estimated difficulty 82/100 with dense mathematical update rule",
    priority: "Medium",
  },
  {
    id: "r-4",
    hotspotId: "h-2431",
    timestamp: s("24:31"),
    action: "Motivate the loss function with a single prediction first",
    problem: "Largest drop-off in the lecture",
    evidence: "46 students left within 40 seconds",
    priority: "High",
  },
  {
    id: "r-5",
    hotspotId: "h-2431",
    timestamp: s("24:40"),
    action: "Expand the MSE summation for three data points",
    problem: "Notation introduced with new concept",
    evidence: "27 related questions about summation and squaring",
    priority: "Medium",
  },
  {
    id: "r-6",
    hotspotId: "h-3208",
    timestamp: s("32:08"),
    action: "Show side-by-side learning rate animations",
    problem: "Repeated conceptual questions",
    evidence: "16 related questions, overlapping with 17:15 cluster",
    priority: "Medium",
  },
  {
    id: "r-7",
    hotspotId: "h-0842",
    timestamp: s("08:42"),
    action: "Add a worked example of memorization vs. generalization",
    problem: "Train/test split not motivated",
    evidence: "12 related questions + 18% re-watch increase",
    priority: "Medium",
  },
  {
    id: "r-8",
    hotspotId: "h-4152",
    timestamp: s("41:52"),
    action: "Define the L2 norm in plain language before the penalty term",
    problem: "Undefined prerequisite concept",
    evidence: "AI-estimated difficulty 88/100",
    priority: "Medium",
  },
  {
    id: "r-9",
    hotspotId: "h-5120",
    timestamp: s("51:20"),
    action: "Share the confusion matrix slide as a download",
    problem: "Re-watching to copy the slide",
    evidence: "26% re-watch increase with stable engagement",
    priority: "Low",
  },
]

const rawTranscript = [
  {
    id: "t-01",
    start: s("00:00"),
    end: s("01:30"),
    section: "Introduction",
    text:
      "Welcome back everyone. Today is lecture seven, and this is the one where the pieces start to fit together. We're going to build our first real model end to end: data in, prediction out, and a way to tell how good that prediction is.",
  },
  {
    id: "t-02",
    start: s("01:30"),
    end: s("03:00"),
    section: "Introduction",
    text:
      "By the end of the hour you should be able to explain three things: what supervised learning is, how a model learns from a loss function, and how we evaluate it honestly. Let's start with the big picture.",
  },
  {
    id: "t-03",
    start: s("03:00"),
    end: s("05:00"),
    section: "Supervised Learning",
    text:
      "Supervised learning means we have examples where we already know the right answer. Think of a spreadsheet of houses with their square footage and their sale price. The price is the answer, and we want the model to learn the relationship.",
  },
  {
    id: "t-04",
    start: s("05:00"),
    end: s("07:00"),
    section: "Supervised Learning",
    text:
      "Contrast this with unsupervised learning, where there are no answers and we're just looking for structure. We'll come back to that in lecture ten. For now: supervised means labeled.",
  },
  {
    id: "t-05",
    start: s("07:00"),
    end: s("08:20"),
    section: "Training Data",
    text:
      "So where do these examples come from? We call the collection of labeled examples the training data. The more representative it is of the real world, the better the model will do when it meets the real world.",
  },
  {
    id: "t-06",
    start: s("08:20"),
    end: s("09:20"),
    section: "Training Data",
    text:
      "Here's the part people trip on. We never evaluate on the same data we trained on. We hold some back, the test set, and only look at it at the very end. If you peek, your score is meaningless.",
  },
  {
    id: "t-07",
    start: s("09:20"),
    end: s("11:00"),
    section: "Training Data",
    text:
      "A common split is eighty-twenty. Eighty percent to learn from, twenty percent to check. There's nothing magic about those numbers, but the principle is non-negotiable.",
  },
  {
    id: "t-08",
    start: s("11:00"),
    end: s("12:40"),
    section: "Features and Labels",
    text:
      "Let's name things. The inputs, square footage, number of bedrooms, distance to the city, are features. We'll write them as x. The thing we're predicting, the price, is the label. We'll write it as y.",
  },
  {
    id: "t-09",
    start: s("12:40"),
    end: s("14:00"),
    section: "Features and Labels",
    text:
      "A single example is one row: a vector of features and its label. The whole training set is just many rows. Keep that picture in your head, because everything that follows operates on rows.",
  },
  {
    id: "t-10",
    start: s("14:00"),
    end: s("15:30"),
    section: "Linear Regression",
    text:
      "Our first model is the simplest one that actually works: linear regression. We say the prediction is a weighted sum of the features plus a bias. y-hat equals w times x plus b.",
  },
  {
    id: "t-11",
    start: s("15:30"),
    end: s("17:15"),
    section: "Linear Regression",
    text:
      "The weights w and the bias b are the parameters. They start out random, which means the first predictions are garbage. Learning is the process of nudging them until the predictions stop being garbage.",
  },
  {
    id: "t-12",
    start: s("17:15"),
    end: s("18:10"),
    section: "Gradient Descent",
    text:
      "How do we nudge them? This is gradient descent. We compute the gradient of the loss with respect to each weight, and we update: w becomes w minus alpha times the gradient. Alpha is the learning rate. The gradient tells us which direction increases the loss, so we go the opposite way.",
  },
  {
    id: "t-13",
    start: s("18:10"),
    end: s("20:00"),
    section: "Gradient Descent",
    text:
      "If you remember your calculus, the gradient is just the vector of partial derivatives. It points uphill. We want downhill, so we subtract. That's the entire algorithm. Repeat until the loss stops changing.",
  },
  {
    id: "t-14",
    start: s("20:00"),
    end: s("21:30"),
    section: "Gradient Descent",
    text:
      "Each full pass through the training data is called an epoch. In practice we'll run tens or hundreds of epochs. Let me show you what the loss curve looks like over time.",
  },
  {
    id: "t-15",
    start: s("21:30"),
    end: s("23:00"),
    section: "Gradient Descent",
    text:
      "Notice how it drops quickly and then flattens. That flattening is convergence. We've found a minimum, or at least a place where the gradient is close to zero.",
  },
  {
    id: "t-16",
    start: s("23:00"),
    end: s("24:20"),
    section: "Loss Functions",
    text:
      "I've been saying 'the loss' without defining it. The loss function is how we measure how wrong the model is. It takes the prediction and the true label and returns a single number: bigger means worse.",
  },
  {
    id: "t-17",
    start: s("24:20"),
    end: s("25:00"),
    section: "Loss Functions",
    text:
      "For regression we use mean squared error. L equals one over n, times the sum from i equals one to n, of y-hat-i minus y-i, squared. Every prediction's error, squared, averaged.",
  },
  {
    id: "t-18",
    start: s("25:00"),
    end: s("27:00"),
    section: "Loss Functions",
    text:
      "Why square? Two reasons. Squaring makes every error positive so they don't cancel out, and it punishes large errors much more than small ones. Being off by ten is a hundred times worse than being off by one.",
  },
  {
    id: "t-19",
    start: s("27:00"),
    end: s("29:00"),
    section: "Loss Functions",
    text:
      "There are other losses. Mean absolute error is more forgiving of outliers. For classification we'll use cross-entropy, but that's a later lecture. The key idea is the same: a number that says how wrong you are.",
  },
  {
    id: "t-20",
    start: s("29:00"),
    end: s("31:40"),
    section: "Learning Rate",
    text:
      "Back to alpha, the learning rate. This one hyperparameter decides whether training works at all. Too small and you'll be waiting all week. Too large and something worse happens.",
  },
  {
    id: "t-21",
    start: s("31:40"),
    end: s("33:00"),
    section: "Learning Rate",
    text:
      "With a large learning rate, each step overshoots the minimum. You bounce to the other side of the valley, then further, then further still. The loss goes up instead of down. That's divergence, and it means your model is getting worse every step.",
  },
  {
    id: "t-22",
    start: s("33:00"),
    end: s("35:00"),
    section: "Learning Rate",
    text:
      "So how do you pick it? Honestly, you try a few. Start around 0.01, look at the loss curve, and adjust. There are smarter schedules that shrink alpha over time, and we'll use those in the assignment.",
  },
  {
    id: "t-23",
    start: s("35:00"),
    end: s("38:00"),
    section: "Overfitting",
    text:
      "Now, a warning. A model can drive the training loss to almost zero and still be useless. It has memorized the training set instead of learning the pattern. That's overfitting, and it's the reason we held out a test set at minute eight.",
  },
  {
    id: "t-24",
    start: s("38:00"),
    end: s("40:00"),
    section: "Overfitting",
    text:
      "You can see it on the curves: training loss keeps falling while test loss starts climbing. The gap between them is the model fooling itself.",
  },
  {
    id: "t-25",
    start: s("40:00"),
    end: s("41:30"),
    section: "Regularization",
    text:
      "One fix is regularization. We add a penalty to the loss for having large weights. The intuition: a model with enormous weights is drawing wild curves through every point, and we want to discourage that.",
  },
  {
    id: "t-26",
    start: s("41:30"),
    end: s("42:40"),
    section: "Regularization",
    text:
      "Formally, L2 regularization adds lambda times the squared norm of w to the loss. Lambda controls how strongly we penalize. When lambda is zero we're back to plain MSE; as lambda grows the weights shrink toward zero.",
  },
  {
    id: "t-27",
    start: s("42:40"),
    end: s("46:00"),
    section: "Regularization",
    text:
      "This is the bias–variance tradeoff in action. Bigger lambda means a simpler model with more bias but less variance. There's a sweet spot, and again, you find it by trying values and watching the test loss.",
  },
  {
    id: "t-28",
    start: s("46:00"),
    end: s("48:30"),
    section: "Model Evaluation",
    text:
      "Last topic: evaluation. For regression, we report the test set MSE or its square root, which is in the same units as the label. For classification we need something richer.",
  },
  {
    id: "t-29",
    start: s("48:30"),
    end: s("51:00"),
    section: "Model Evaluation",
    text:
      "Accuracy alone can lie. If one percent of emails are spam, a model that says 'never spam' is ninety-nine percent accurate and completely useless. So we break errors down by type.",
  },
  {
    id: "t-30",
    start: s("51:00"),
    end: s("52:00"),
    section: "Model Evaluation",
    text:
      "This is the confusion matrix. True positives, false positives, false negatives, true negatives. Precision is true positives over everything you called positive. Recall is true positives over everything that actually was positive.",
  },
  {
    id: "t-31",
    start: s("52:00"),
    end: s("55:00"),
    section: "Model Evaluation",
    text:
      "Which one matters depends on the cost of each mistake. For spam, false positives are painful: you lose a real email. For medical screening, false negatives are worse. There's no universal right answer.",
  },
  {
    id: "t-32",
    start: s("55:00"),
    end: s("57:30"),
    section: "Wrap-up",
    text:
      "Let's recap. Labeled data, split into train and test. A model with parameters. A loss that measures wrongness. Gradient descent to reduce it. Regularization to keep it honest. Evaluation to know if it worked.",
  },
  {
    id: "t-33",
    start: s("57:30"),
    end: s("60:00"),
    section: "Wrap-up",
    text:
      "For the assignment you'll implement linear regression from scratch with gradient descent. Post questions in the course forum. See you Thursday.",
  },
]

export const lecture07 = defineLecture({
  id: "ml-07",
  course: "Introduction to Machine Learning",
  number: 7,
  title: "Linear Regression, Loss, and Gradient Descent",
  instructor: "Dr. Priya Raman",
  recordedAt: "2026-09-01",
  durationSec: 60 * 60,
  status: "analyzed",
  students: 500,
  startEngagement: 91,
  endEngagement: 78,
  shapes: [
    { peak: s("08:42"), width: 45, engagementDip: 9, rewatch: 14, pauses: 8, questions: 6, difficulty: 20, confusion: 32, dropoff: 1.2 },
    { peak: s("17:15"), width: 50, engagementDip: 16, rewatch: 30, pauses: 14, questions: 10, difficulty: 38, confusion: 58, dropoff: 1.6 },
    { peak: s("24:31"), width: 40, engagementDip: 20, rewatch: 18, pauses: 10, questions: 13, difficulty: 30, confusion: 50, dropoff: 8.5 },
    { peak: s("32:08"), width: 55, engagementDip: 8, rewatch: 10, pauses: 7, questions: 8, difficulty: 22, confusion: 30, dropoff: 1.4 },
    { peak: s("41:52"), width: 45, engagementDip: 11, rewatch: 16, pauses: 9, questions: 4, difficulty: 44, confusion: 34, dropoff: 2.4 },
    { peak: s("51:20"), width: 40, engagementDip: 4, rewatch: 24, pauses: 12, questions: 3, difficulty: 14, confusion: 12, dropoff: 0.8 },
  ],
  hotspots,
  clusters,
  recommendations,
  concepts: [
    { name: "Gradient Descent", score: 82, hotspotId: "h-1715" },
    { name: "Learning Rate", score: 68, hotspotId: "h-3208" },
    { name: "Optimization", score: 79, hotspotId: "h-1715" },
    { name: "L2 Regularization", score: 88, hotspotId: "h-4152" },
    { name: "Mean Squared Error", score: 76, hotspotId: "h-2431" },
    { name: "Train/Test Split", score: 61, hotspotId: "h-0842" },
    { name: "Precision & Recall", score: 57, hotspotId: "h-5120" },
  ],
  summary:
    "Students showed the highest confusion around the introduction of Gradient Descent at 17:15. This section also produced the highest concentration of repeated questions and re-watch activity. The single largest drop-off occurred at 24:31 when the mean squared error formula appeared without prior motivation. Downstream confusion about the learning rate at 32:08 appears to inherit from the earlier gradient descent gap, so fixing 17:15 is likely to improve both sections.",
  rawTranscript,
})
