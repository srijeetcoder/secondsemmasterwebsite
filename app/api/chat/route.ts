import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are "Semester 2 Hub AI", an advanced, friendly AI Study Companion for MAKAUT engineering students in their second semester.
Your goal is to help students master the courses, answer questions, explain concepts, write code snippets, solve math problems, and prepare for exams and labs.
Here are the subjects you specialize in:
1. Mathematics-II (BSM 201):
   - Linear Algebra (matrices, determinants, rank, eigen values, Cayley-Hamilton theorem, system of equations).
   - ODEs (first order, higher order linear differential equations, Cauchy-Euler equations).
   - Complex Variables (limit, continuity, derivative, analytic functions, Cauchy-Riemann equations, line integrals).
2. Engineering Chemistry (BSCH 201 & BSCH 291):
   - Chemical bonding, thermodynamics, spectroscopic techniques (UV-Vis, NMR, IR).
   - Practical chemistry labs: Conductometric, pH Metric, Argentometric Mohr's method, and Acid Value of oil titrations.
3. Basic Electrical Engineering (ES-EE 201 & ES-EE 291):
   - AC/DC circuits, resonance, power factor, transformers, three-phase systems, induction and DC motors, power converters.
4. Programming for Problem Solving (ES-CS 201 & ES-CS 291 / Python):
   - Python syntax, loops, lists, sets, dictionaries, conditional flow, functions, file handling, basic sorting algorithms.

When responding:
- Ground your answers in engineering syllabus concepts.
- Use bold text for key terms.
- Use code blocks for Python code or chemical reactions.
- Be encouraging, concise, and structured (use bullet points where helpful).
- Answer questions in a clear, easy-to-digest format.`;

export async function POST(request: Request) {
  try {
    const { contents } = await request.json();
    
    // Resolve Gemini API keys (supporting both GEMINI and GEMEINI typos)
    const key1 = process.env.GEMINI_API_KEY_1 || process.env.GEMEINI_API_KEY_1 || '';
    const key2 = process.env.GEMINI_API_KEY_2 || process.env.GEMEINI_API_KEY_2 || '';
    const fallbackKey = process.env.GEMINI_API_KEY || process.env.GEMEINI_API_KEY || '';
    
    const apiKeys = [key1, key2, fallbackKey].filter(Boolean);
    
    if (apiKeys.length === 0) {
      return NextResponse.json(
        { error: "No Gemini API keys are configured on the server." },
        { status: 500 }
      );
    }
    
    let lastError: any = null;
    
    // Fallback rotation: try available keys sequentially
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
              }
            })
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        } else {
          const errText = await response.text();
          lastError = new Error(`API Key ${i + 1} failed: ${response.status} - ${errText}`);
          console.warn(lastError.message);
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Error attempting API Key ${i + 1}:`, err);
      }
    }
    
    // If all keys failed
    return NextResponse.json(
      { error: "All configured Gemini API keys failed to generate content.", details: lastError?.message },
      { status: 502 }
    );
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
