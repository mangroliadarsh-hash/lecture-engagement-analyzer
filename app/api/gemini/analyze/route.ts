import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title = "Lecture Analysis",
      course = "Computer Science",
      instructor = "Instructor",
      durationSeconds = 3480,
      transcriptText = "",
      videoFileName = "",
    } = body

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // Graceful demo response if API key is not present in local test
      return NextResponse.json({
        fallback: true,
        message: "No GEMINI_API_KEY found, fallback to synthesized pedagogical structure.",
      })
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })

    const prompt = `You are a pedagogical expert and educational data scientist evaluating a recorded university lecture.
Lecture Title: ${title}
Course: ${course}
Instructor: ${instructor}
Duration: approximately ${Math.round(durationSeconds / 60)} minutes (${durationSeconds} seconds)
Uploaded Video Media: ${videoFileName || "Provided recorded video"}
Transcript Excerpts:
${transcriptText ? transcriptText.slice(0, 4000) : "Lecture introduces foundational core principles, mathematical formulation, step-by-step algorithms, followed by common pitfalls, practical code implementation, and loss function evaluation."}

Please analyze this lecture and generate a structured JSON response with pedagogical difficulty estimation, key topics, confusing concepts, and teaching improvements.

CRITICAL: Return strictly valid JSON conforming to this schema:
{
  "lectureTitle": string,
  "summary": string,
  "segments": [
    {
      "start": number (seconds),
      "end": number (seconds),
      "section": string,
      "text": string,
      "difficulty": number (0-100),
      "complexity": "Low" | "Medium" | "High",
      "concepts": string[],
      "prerequisites": string[]
    }
  ],
  "hotspots": [
    {
      "topic": string,
      "peak": number (seconds),
      "start": number (seconds),
      "end": number (seconds),
      "label": string,
      "primarySignal": "confusion" | "rewatch" | "dropoff" | "questions" | "difficulty",
      "severity": "low" | "medium" | "high",
      "rationale": string,
      "recommendation": string,
      "difficultyScore": number (0-100),
      "complexity": "Low" | "Medium" | "High",
      "prerequisites": string[]
    }
  ],
  "recommendations": [
    {
      "timestamp": number (seconds),
      "priority": "High" | "Medium" | "Low",
      "action": string,
      "problem": string,
      "evidence": string
    }
  ]
}`

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    })

    const text = response.text
    if (!text) {
      return NextResponse.json({ fallback: true, message: "Empty response from Gemini" })
    }

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json({ success: true, data: parsed })
    } catch {
      return NextResponse.json({ fallback: true, message: "Failed to parse JSON" })
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { fallback: true, error: errorMsg },
      { status: 200 }, // return 200 with fallback so client can proceed smoothly to Demo Analysis
    )
  }
}
