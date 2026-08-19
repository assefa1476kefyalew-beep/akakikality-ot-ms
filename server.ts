import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Comprehensive Domain Knowledge Engine for Akaki Kality Overtime & Shifts
function generateExpertReply(message: string, language: string = "en"): string {
  const lowerMsg = message.toLowerCase();

  // Amharic query handling
  if (
    language === "am" ||
    lowerMsg.includes("ትርፍ") ||
    lowerMsg.includes("አዋጅ") ||
    lowerMsg.includes("ክፍያ") ||
    lowerMsg.includes("ማታ") ||
    lowerMsg.includes("ቀን") ||
    lowerMsg.includes("በዓል") ||
    lowerMsg.includes("ሰዓት") ||
    lowerMsg.includes("ህግ")
  ) {
    if (lowerMsg.includes("ተመን") || lowerMsg.includes("ክፍያ") || lowerMsg.includes("ህግ") || lowerMsg.includes("አዋጅ") || lowerMsg.includes("rate") || lowerMsg.includes("1156")) {
      return `### በኢትዮጵያ የሰራተኛና አሰሪ አዋጅ ቁጥር 1156/2019 መሰረት የትርፍ ሰዓት ክፍያ ተመኖች፡

1. **የቀን ትርፍ ሰዓት (ከጠዋቱ 12:00 እስከ ማታ 4:00)**: ከመደበኛው የሰዓት ክፍያ **1.50 እጥፍ (1.5x)**
2. **የማታ ትርፍ ሰዓት (ከማታ 4:00 እስከ ንጋቱ 12:00)**: ከመደበኛው የሰዓት ክፍያ **1.75 እጥፍ (1.75x)**
3. **የሳምንት እረፍት ቀን (እሁድ ወይም የእረፍት ቀን)**: ከመደበኛው የሰዓት ክፍያ **2.00 እጥፍ (2.0x)**
4. **የህዝብ ብሔራዊና ሃይማኖታዊ በዓላት**: ከመደበኛው የሰዓት ክፍያ **2.50 እጥፍ (2.5x)**

**የአቃቂ ቃሊቲ ፋብሪካ ፖሊሲ፡**
- አንድ ሰራተኛ በወር ውስጥ ከ **20 ሰዓት** በላይ ትርፍ ሰዓት መስራት አይችልም (ልዩ ፍቃድ ከ HR ካልተሰጠ በስተቀር)።
- መደበኛ የስራ ሰዓት በሳምንት 48 ሰዓት ነው።`;
    }

    if (lowerMsg.includes("ቀመር") || lowerMsg.includes("ስሌት") || lowerMsg.includes("ደምወዝ") || lowerMsg.includes("formula")) {
      return `### የትርፍ ሰዓት ክፍያ ስሌት ቀመር፡

1. **የአንድ ሰዓት መደበኛ ክፍያ** = \`የወር ደመወዝ ÷ 208 መደበኛ ሰዓታት\`
2. **የትርፍ ሰዓት አጠቃላይ ክፍያ** = \`የሰዓት ክፍያ × የተመን ብዜት (1.5 / 1.75 / 2.0 / 2.5) × የትርፍ ሰዓት መጠን\`

**ምሳሌ፡**
- የወር ደመወዝ = 10,400 ብር
- የሰዓት ክፍያ = 10,400 ÷ 208 = **50 ብር/ሰዓት**
- 8 ሰዓት የማታ ትርፍ ሰዓት (1.75x) = 50 × 1.75 × 8 = **700 ብር**`;
    }

    return `እንደምን አደሩ/ዋሉ! እኔ የ**አቃቂ ቃሊቲ የትርፍ ሰዓትና ፈረቃ AI ረዳት** ነኝ።
- የኢትዮጵያ የስራ ህግ አዋጅ 1156/2019 የትርፍ ሰዓት ተመኖች (1.5x, 1.75x, 2.0x, 2.5x)
- የፋብሪካው ፈረቃ ድልድል (Morning, Afternoon, Night) እና የ 20 ሰዓት ወርሃዊ ገደብ
- የትርፍ ሰዓት ደመወዝ ስሌትና ሪፖርት አዘገጃጀት

ምን ልርዳዎት?`;
  }

  // Afaan Oromoo query handling
  if (
    language === "om" ||
    lowerMsg.includes("hojii dabalataa") ||
    lowerMsg.includes("labsii") ||
    lowerMsg.includes("kaffaltii") ||
    lowerMsg.includes("halkan") ||
    lowerMsg.includes("ayyaana")
  ) {
    return `### Labsii Hojjetaa fi Hojjechiisaa Itoophiyaa Lakk. 1156/2019 Bu'uura Godhachuun:

1. **Hojii Dabalataa Guyyaa (06:00 - 22:00)**: Kaffaltii sa'aatii idilee **dachaa 1.50 (1.5x)**
2. **Hojii Dabalataa Halkan (22:00 - 06:00)**: Kaffaltii sa'aatii idilee **dachaa 1.75 (1.75x)**
3. **Guyyaa Boqonnaa Torbanii (Dilbata)**: Kaffaltii sa'aatii idilee **dachaa 2.00 (2.0x)**
4. **Guyyoota Ayyaana Sabootaa fi Amantii**: Kaffaltii sa'aatii idilee **dachaa 2.50 (2.5x)**

**Seera Dhaabbata Akakii Kality:**
- Hojjetaan tokko ji'atti hojii dabalataa **sa'aatii 20** ol hojjechuu hin danda'u (eeyyama addaa HR malee).
- Sa'aatiin hojii idilee torbaniitti sa'aatii 48 dha.`;
  }

  // English & General Inquiries
  if (
    lowerMsg.includes("rate") ||
    lowerMsg.includes("multiplier") ||
    lowerMsg.includes("proclamation") ||
    lowerMsg.includes("1156") ||
    lowerMsg.includes("labor") ||
    lowerMsg.includes("law")
  ) {
    return `### Ethiopian Labour Proclamation No. 1156/2019 Overtime Rates:

1. **Standard Day Overtime (06:00 - 22:00)**
   - **Multiplier**: **1.50x** regular hourly wage.
   - Applies to overtime executed on normal working days between 6:00 AM and 10:00 PM.

2. **Night Shift Overtime (22:00 - 06:00)**
   - **Multiplier**: **1.75x** regular hourly wage.
   - Applies to night operations between 10:00 PM and 6:00 AM.

3. **Weekly Rest Day Overtime (Sunday / Assigned Off-Day)**
   - **Multiplier**: **2.00x** regular hourly wage.
   - For employees working on their designated weekly rest day.

4. **Public National & Religious Holidays**
   - **Multiplier**: **2.50x** regular hourly wage.
   - Applies to official Ethiopian statutory public holidays.

*Threshold Policy: Maximum 20 overtime hours per month per employee without senior HR authorization.*`;
  }

  if (
    lowerMsg.includes("night") ||
    lowerMsg.includes("shift c") ||
    lowerMsg.includes("22:00") ||
    lowerMsg.includes("evening")
  ) {
    return `### Night Shift Rules & Structure (22:00 - 06:00):

- **Night Hours Definition**: Ethiopian Labor Law defines night work as hours performed between **10:00 PM (22:00) and 6:00 AM (06:00)**.
- **Overtime Multiplier**: Any overtime worked during this window carries a mandatory **1.75x multiplier** of the employee's standard hourly rate.
- **Plant Rotation (Shift C)**: Akaki Kality operates a rotating 3-shift system with mandatory rest intervals between night rotations.
- **Health & Safety Rest**: Operators completing Night Shift C must receive minimum mandated recovery time before re-assignment.`;
  }

  if (
    lowerMsg.includes("limit") ||
    lowerMsg.includes("20") ||
    lowerMsg.includes("threshold") ||
    lowerMsg.includes("exceed") ||
    lowerMsg.includes("policy")
  ) {
    return `### Akaki Kality 20-Hour Monthly Overtime Threshold Policy:

1. **Standard Limit**: Under plant safety guidelines, employees are capped at a maximum of **20 overtime hours per calendar month**.
2. **Visual Warning Flags**: The system automatically triggers an amber badge in the Employee Roster and Attendance Logs when hours reach or exceed 20h.
3. **Supervisor Pre-Approval**: Any request pushing an employee beyond 20h requires formal HR Department justification with reason code.
4. **Fatigue Prevention**: Shift coordinators are automatically notified to reassign tasks to available standby personnel.`;
  }

  if (
    lowerMsg.includes("formula") ||
    lowerMsg.includes("calculate") ||
    lowerMsg.includes("payroll") ||
    lowerMsg.includes("salary") ||
    lowerMsg.includes("gross")
  ) {
    return `### Step-by-Step Overtime Payroll Calculation Formula:

1. **Standard Hourly Wage Formula**:
   $$\\text{Base Hourly Rate} = \\frac{\\text{Monthly Base Salary}}{208 \\text{ standard monthly hours}}$$
   *(Note: 208 hours = 48 weekly hours × 52 weeks ÷ 12 months)*

2. **Gross Overtime Pay Formula**:
   $$\\text{OT Pay} = \\text{Base Hourly Rate} \\times \\text{OT Multiplier} \\times \\text{OT Hours Worked}$$

**Practical Example:**
- Operator monthly base salary: **14,560 ETB**
- Base hourly rate: $14,560 \\div 208 = \\mathbf{70.00\\text{ ETB/hr}}$
- 10 hours worked during **Night Shift (1.75x)**:
  $$\\text{OT Pay} = 70.00 \\times 1.75 \\times 10 = \\mathbf{1,225.00\\text{ ETB}}$$`;
  }

  if (
    lowerMsg.includes("shift") ||
    lowerMsg.includes("schedule") ||
    lowerMsg.includes("roster") ||
    lowerMsg.includes("morning") ||
    lowerMsg.includes("afternoon")
  ) {
    return `### Akaki Kality Industrial Shift Operations:

- **Shift A (Morning)**: **06:00 - 14:00** (8 Hours, Standard Multiplier 1.5x for OT extensions)
- **Shift B (Afternoon)**: **14:00 - 22:00** (8 Hours, Standard Multiplier 1.5x for OT extensions)
- **Shift C (Night)**: **22:00 - 06:00** (8 Hours, Night Multiplier 1.75x for OT extensions)

**Departments Covered:**
1. Raw Materials & Quarry Crushing
2. Kiln & Clinker Thermal Processing
3. Cement Grinding & High-Speed Packaging
4. Quality Control & Laboratory
5. Electrical & Mechanical Maintenance
6. Logistics & Fleet Dispatch`;
  }

  // Default helpful response
  return `### Akaki Kality Mesob Industrial AI Assistant

I am your shift operations and overtime compliance copilot. Here is what I can assist with:

- **Ethiopian Labor Proclamation 1156/2019** rates *(Day 1.5x, Night 1.75x, Weekend 2.0x, Holiday 2.5x)*
- **Akaki Kality Factory Rules**: 20h monthly threshold policy, fatigue management, and supervisor approvals
- **Payroll Calculations**: Exact mathematical formulas and breakdown for gross overtime wages
- **Multilingual Support**: Inquiries in **English**, **አማርኛ (Amharic)**, and **Afaan Oromoo**.

Feel free to ask any specific question about employee schedules, overtime rates, or payroll!`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Safe Gemini Client Initialization
  function getGeminiClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim().length < 10) {
      return null;
    }
    try {
      return new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI client:", e);
      return null;
    }
  }

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Chatbot endpoint for Akaki Kality Overtime & Shift Management
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, language = "en" } = req.body;

      if (!message || typeof message !== "string") {
        return res.json({ reply: generateExpertReply("hello", language) });
      }

      const client = getGeminiClient();

      if (!client) {
        // Instant intelligent domain response
        const fallbackReply = generateExpertReply(message, language);
        return res.json({ reply: fallbackReply });
      }

      const systemInstruction = `
You are the Akaki Kality Mesob Industrial AI Assistant ("AKC-AMS AI Copilot"), an intelligent specialized advisor for Akaki Kality Industrial Company's Overtime, Shift Scheduling & Attendance Management System in Addis Ababa, Ethiopia.

Domain Knowledge & Rules:
1. Ethiopian Labour Proclamation No. 1156/2019 Overtime Multipliers:
   - Day Overtime (06:00 - 22:00): 1.50x normal hourly rate
   - Night Overtime (22:00 - 06:00): 1.75x normal hourly rate
   - Weekly Rest Day Overtime (Sunday/Off-day): 2.00x normal hourly rate
   - Public Holiday Overtime (Ethiopian National/Religious holidays): 2.50x normal hourly rate
2. Akaki Kality Plant Policy:
   - Monthly maximum overtime limit: 20 hours per employee (requires HR Manager pre-authorization if exceeded)
   - Standard working week: 48 hours (8 hours/day, 6 days or 3-shift rotation)
   - Shifts: Morning (06:00 - 14:00), Afternoon (14:00 - 22:00), Night (22:00 - 06:00)
3. Language Support:
   - Fluent in English, Amharic (አማርኛ), and Afaan Oromoo.
   - Reply in the language requested or the language the user speaks.
4. Tone & Style:
   - Professional, precise, and concise with clean markdown formatting.
`;

      try {
        const contents: any[] = [];
        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item.role === "user" || item.role === "assistant" || item.role === "model") {
              contents.push({
                role: item.role === "assistant" ? "model" : "user",
                parts: [{ text: item.content || item.text || "" }],
              });
            }
          }
        }

        contents.push({
          role: "user",
          parts: [{ text: message }],
        });

        const response = await client.models.generateContent({
          model: "gemini-3.7-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const reply = response.text || generateExpertReply(message, language);
        return res.json({ reply });
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, falling back to expert knowledge engine:", geminiError?.message || geminiError);
        const reply = generateExpertReply(message, language);
        return res.json({ reply });
      }
    } catch (error: any) {
      console.error("Chat route error:", error);
      const reply = generateExpertReply(req.body?.message || "", req.body?.language || "en");
      return res.json({ reply });
    }
  });

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
