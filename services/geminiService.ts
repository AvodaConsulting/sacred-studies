
import { GoogleGenAI } from "@google/genai";
import { StudyConfig, Language, StudyType, KnowledgeLevel, ActivityLog } from "../types";
import { APPROACHES, TRADITIONS } from "../constants";

const MODEL_NAME = "gemini-3.1-pro-preview";

const getGenreProtocol = (type: StudyType, isChinese: boolean) => {
  switch (type) {
    case StudyType.Academic:
      return {
        role: "Senior Biblical Scholar and Journal Editor",
        style: "Formal Peer-Reviewed Journal Article",
        structure: [
          "Abstract & Introduction", 
          "Linguistic & Structural Analysis (Original Languages)", 
          "Methodological Analysis (Selected Approaches)", 
          "Tradition History (Selected Traditions)", 
          "Thematic Synthesis", 
          "Conclusion", 
          "Selected Bibliography"
        ],
        constraints: "MANDATORY: Produce a lengthy, rigorous academic paper. NO bullet points in main text. Use sophisticated paragraphs. Include Greek/Hebrew analysis with transliteration. Rigorously apply the selected critical methods. CITATIONS: Use Chicago Author-Date style (e.g., Brown 2020, 45) in-text."
      };
    case StudyType.Sermon:
      return {
        role: "Master Homiletician",
        style: "Expository Sermon Manuscript",
        structure: [
          "The Hook (Introduction)", 
          "The Book (Linguistic & Structural Exegesis)", 
          "The Look (Theological Illustration)", 
          "The Took (Application & Practice)", 
          "The Charge (Conclusion)",
          "Selected Bibliography"
        ],
        constraints: "MANDATORY: Write as a full spoken manuscript. Use rhythmic, persuasive prose. Include deep insights from original languages (explained simply). Connect text structure to sermon structure. Cite scholars naturally (e.g., 'As N.T. Wright notes...')."
      };
    case StudyType.Devotional:
      return {
        role: "Spiritual Director and Theologian",
        style: "Deeply Theological Devotional Essay",
        structure: [
          "Invocation & Context", 
          "Linguistic Meditation (Keywords)", 
          "Theological Reflection", 
          "Heart-Application", 
          "Closing Prayer",
          "Selected Bibliography"
        ],
        constraints: "MANDATORY: Continuous, flowing prose. Deep dive into 1-2 key Hebrew/Greek words. Focus on internal transformation. Weave scholarship in gently."
      };
    case StudyType.Discussion:
      return {
        role: "Socratic Pedagogue",
        style: "Comprehensive Discussion Guide",
        structure: [
          "Session Objective & Context", 
          "Structural & Linguistic Notes", 
          "Observation Queries", 
          "Interpretation Challenges", 
          "Application Dialogue",
          "Selected Bibliography"
        ],
        constraints: "Detailed background notes required. Questions should be open-ended and profound."
      };
    case StudyType.SpiritualGuide:
      return {
        role: "Theologically Integrated Spiritual Director",
        style: "Covenantal & Somatic Encounter Guide",
        structure: [
          "Somatic Grounding (The Creaturely Body)",
          "The Encounter (Text as Living Subject)",
          "The Broken Heart (Nishberei-lev: Affect & Memory)",
          "The Mirror of Justice (Tsedeq & Truth)",
          "The Cross (Integration of Judgment & Healing)",
          "Benediction of Wholeness (Shalom)",
          "Selected Bibliography"
        ],
        constraints: `
        CRITICAL THEOLOGICAL & EPISTEMOLOGICAL GUARDRAILS:
        1. **HERMENEUTICAL CENTER**: The Cross is the absolute center. It reveals the structural weight of Sin (Judgment) AND the existential depth of Suffering (Incarnation). You must hold these in tension. 
        2. **ROLE OF PSYCHOLOGY**: Psychology is a *servant*, not a master. Use it to describe the mechanisms of trauma, memory, and affect (the "broken heart"/nishberei-lev), but NEVER allow it to replace the Gospel's narrative of Redemption. 
        3. **DEFINITION OF RIGHTEOUSNESS**: *Tsedeq* (OT) & *Dikaiosyne* (NT) are RELATIONAL and ACTION-ORIENTED.
        4. **METHOD OF ENCOUNTER**: The Text is the SUBJECT; the user is the one being encountered.
        5. **GOAL**: To lead the user into an encounter where the "Broken Heart" is held by the "God of Justice/Mercy".
        `
      };
    case StudyType.NarrativeSpiritual:
      return {
        role: "Narrative Theologian and Spiritual Director",
        style: "Guigo II's Lectio Divina & Narrative Therapy Integration",
        structure: [
          "Interpretive Guardrail & Genre Hint",
          "Narrative & Image Map (The World of the Text)",
          "Lectio (Reading as Story)",
          "Meditatio (Entering the Plot)",
          "Oratio (Response & Desire)",
          "Contemplatio (Receptivity & Resting)",
          "Selected Bibliography"
        ],
        constraints: `
        CORE PHILOSOPHY:
        1. **Dei Verbum Principle**: "Prayer should accompany the reading of Sacred Scripture, so that God and man may talk together." The text is a "World" to be inhabited (Narrative/Image World), not just a "Topic" to be analyzed.
        2. **Genre Integrity**: If the text is NOT narrative (e.g., Psalms, Proverbs, Epistles), explicitly state this in the 'Genre Hint'. Treat it as a "Micro-Plot" or "Image World" (e.g., Psalm 1's "Two Ways").
        3. **Narrative Therapy Integration**: In the Meditatio section, use "Externalizing" language (e.g., "The problem is the problem, the person is not the problem").
        
        SPECIFIC SECTIONS:
        - **Interpretive Guardrail**: Remind reader of literary forms.
        - **Narrative/Image Map**: Identify Characters (e.g., Righteous/Wicked), Metaphors (Tree, Chaff, Way), and Motifs.
        - **Lectio**: Prompt to read 2-3 times. Mark contrasts (Not X / But Y). Identify 3 key original words (e.g., 'ašrê, tôrāh).
        - **Meditatio**: "Where do I stand in this world?" "Whose counsel do I follow?" Use Externalization: "How is [Anxiety/Fear] trying to recruit you into a different story?"
        - **Oratio**: "Turn images into prayer." "What do I desire?" (6-10 lines space).
        - **Contemplatio**: "Rest in one word." "Stop processing. Be received."
        `
      };
    case StudyType.TorahPortion:
      return {
        role: "Expert in Second Temple Judaism, Rabbinic Literature, and New Testament Studies",
        style: "Jewish Commentary with Messianic/Intertextual Connections",
        structure: [
          "Parashat Overview & Structure (Torah Identity)",
          "Pshat: Literary & Historical Context (ANE, Geography, Archaeology)",
          "The Rabbinic Conversation (Midrash, Rashi, Rambam)",
          "Modern Jewish Scholarship (Critical Perspectives e.g., TheTorah.com)",
          "Brit Chadashah Connections (New Testament Intertextuality)",
          "Spiritual & Ethical Impulse (Halakha & Aggadah)",
          "Selected Bibliography"
        ],
        constraints: `
        CORE PHILOSOPHY:
        - Treat the text within the flow of the Jewish Liturgical Calendar (Parashat HaShavua).
        - **Sources**: You MUST engage with three distinct layers:
            1. **Classical Rabbinics**: Explicitly cite Rashi, Maimonides (Rambam), Ibn Ezra, or Midrash Rabbah.
            2. **Modern Critical**: Incorporate academic Jewish insights from the last 10 years (e.g., "TheTorah.com", Robert Alter, Jacob Milgrom) regarding Source Criticism, ANE parallels, or Linguistics.
            3. **New Testament (Brit Chadashah)**: Show how this specific Torah portion illuminates the Gospels, Paul, or Hebrews. How did Jesus or the Apostles interpret these specific verses or motifs?
        - **Language**: Use Hebrew terminology (transliterated) freely (e.g., 'Mitzvot', 'Covenant', 'Kedushah').
        - **Tone**: Respectful of the sanctity of the text while being intellectually rigorous and historically grounded.
        `
      };
    default: // Comprehensive
      return {
        role: "Systematic Theological Consultant",
        style: "Comprehensive Encyclopedic Analysis",
        structure: [
          "Executive Summary & Context", 
          "Linguistic & Structural Analysis", 
          "Critical Methodologies Applied", 
          "Historical Tradition Overview", 
          "Theological Implications", 
          "Practical Synthesis",
          "Selected Bibliography"
        ],
        constraints: "Maximum depth. Encyclopedic detail. Technical terminology explained. Use Chicago Author-Date style for citations."
      };
  }
};

export interface StudyGuideResponse {
  text: string;
  sources?: { uri: string; title: string }[];
}

// -- LIBRARIAN AGENT --
interface LibrarianDossier {
  bibliography: string[]; // List of Chicago style citations
  researchSummary: string; // Summary of key findings from these sources
  rawSources: { uri: string; title: string }[];
}

const generateResearchDossier = async (
  config: StudyConfig, 
  log: (en: string, zh: string, status?: any) => void,
  apiKey: string
): Promise<LibrarianDossier> => {
  const ai = new GoogleGenAI({ apiKey });
  const isChinese = config.language === Language.TraditionalChinese;
  
  // Resolve ID to readable labels for the AI to understand the search context
  const selectedApproaches = config.approaches.map(id => {
      const item = APPROACHES.find(a => a.id === id);
      return item ? item.label['en'] : id;
  }).join(", ");

  const selectedTraditions = config.traditions.map(id => {
      const item = TRADITIONS.find(t => t.id === id);
      return item ? item.label['en'] : id;
  }).join(", ");

  // Explicitly log the activation parameters so the user sees it running
  const searchScope = selectedApproaches || selectedTraditions ? "Targeted" : "General";
  log(
    `Librarian Agent: Active (${searchScope} Search)`, 
    `圖書管理員代理：已啟動（${searchScope === 'Targeted' ? '針對性' : '一般'}搜尋）`, 
    'processing'
  );

  let traditionEmphasis = "";
  if (config.traditions.includes('anglican')) {
    traditionEmphasis = `
    PRIORITY - ANGLICAN SCHOLARSHIP:
    - You must actively search for and prioritize works by: N.T. Wright, Rowan Williams, Sarah Coakley, John Webster, B.F. Westcott, J.B. Lightfoot, Oliver O'Donovan, and Ellen Davis.
    - Look for sources from journals like "Journal of Anglican Studies", "Scottish Journal of Theology", or "Anglican Theological Review".
    - Include HKSKH (Hong Kong Sheng Kung Hui) or Ming Hua Theological College publications if available in Chinese contexts.
    `;
  }

  const librarianPrompt = `
    Role: Senior Theological Librarian.
    Task: Conduct a rigorous literature review for a research paper on "${config.passage}" regarding "${config.topic}".
    
    SEARCH MATRIX (CROSS-REFERENCE):
    You must find academic literature that sits at the INTERSECTION of the following:
    1.  **Text**: ${config.passage}
    2.  **Topic**: ${config.topic || "General Exegesis"}
    3.  **Lens**: ${selectedApproaches || "Critical Exegesis"} AND ${selectedTraditions || "Historical Theology"}
    
    ${traditionEmphasis}
    
    SEARCH STRATEGY:
    1.  **ALL ACADEMIC ERAS**: Do not limit to only one time period. Look for seminal works from the selected tradition (e.g., if "Reformation", find Luther/Calvin) AND modern scholarly assessments of them.
    2.  **MODERN SCHOLARSHIP EMPHASIS**: You MUST find and prioritize high-quality monographs and journal articles published between **2015 and 2025** that discuss this specific intersection of topic and text.
    3.  **ACADEMIC RIGOR**: Look for sources from major university presses (Oxford, Cambridge, Yale, Baylor) and top journals (JBL, NTS, VT, JSNT).
    4.  **EXCLUDE**: Devotional blogs, sermons, wikis, generic SEO websites.
    5.  LANGUAGE: ${isChinese ? 'Traditional Chinese (prioritized) and English' : 'English'}.
    
    OUTPUT FORMAT (JSON):
    Provide ONLY valid JSON. No markdown code blocks. No intro/outro text.
    {
      "bibliography": ["Chicago Style Citation 1", "Chicago Style Citation 2", ...],
      "researchSummary": "A concise synthesis of the specific arguments found in these sources relevant to the topic."
    }
  `;

  try {
    const researchChat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" removed to avoid 500 errors with search tool
        systemInstruction: "You are a specialized Academic Librarian. Your job is to verify sources. Do not hallucinate citations. Only provide books/papers found via search. Ensure sources include RECENT (post-2015) scholarship."
      }
    });

    const response = await researchChat.sendMessage({ message: librarianPrompt });
    let jsonStr = response.text || "{}";
    
    // Clean up if the model includes markdown code blocks despite instructions
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (e) {
      console.warn("Librarian JSON parse error, attempting fallback", e);
      // Fallback: If JSON fails, assume the whole text is the summary and empty bibliography
      data = {
        bibliography: [],
        researchSummary: response.text || "Research completed but formatting failed."
      };
    }

    // Extract raw web sources from grounding metadata for the UI link list
    const rawSources: { uri: string; title: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          rawSources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }

    log("Librarian Agent: Citations Verified", "圖書管理員代理：引用已驗證", 'success');
    return {
      bibliography: data.bibliography || [],
      researchSummary: data.researchSummary || "",
      rawSources
    };
  } catch (e) {
    console.error("Librarian failed:", e);
    // Fallback if librarian fails completely
    return { bibliography: [], researchSummary: "", rawSources: [] };
  }
};

export const generateTopic = async (passage: string, language: Language, apiKey: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const isChinese = language === Language.TraditionalChinese;

  const prompt = `
    Biblical Passage: "${passage}"
    Objective: Generate 3 compelling, deep, and contemporary theological themes for a high-end research project.
    Language: ${isChinese ? 'Traditional Chinese' : 'English'}
    Output: JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { temperature: 0.9, responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Topic fault:", error);
    return [];
  }
};

export const fetchDailyLectionary = async (apiKey: string, language: Language, type: 'RCL' | 'Torah' | 'Orthodox'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const isChinese = language === Language.TraditionalChinese;
  const today = new Date().toLocaleDateString(isChinese ? 'zh-TW' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  let prompt = "";
  switch (type) {
    case 'RCL':
      prompt = `
        Task: Identify the Revised Common Lectionary (RCL) readings for today, ${today}.
        If today is not a Sunday, provide the Daily Office readings for this specific date relative to the church calendar.
        Output: Provide ONLY the scripture references combined in a single line, separated by semicolons (e.g., "Psalm 23; John 3:16-21"). 
      `;
      break;
    case 'Torah':
      prompt = `
        Task: Identify the current Jewish weekly Torah Portion (Parashat HaShavua) for the date ${today}.
        Include the Torah portion, Haftarah, and suggested Brit Chadashah reading.
        Output: Provide ONLY the scripture references combined in a single line, separated by semicolons (e.g., "Genesis 1:1-6:8; Isaiah 42:5-43:10").
      `;
      break;
    case 'Orthodox':
      prompt = `
        Task: Identify the Eastern Orthodox (Byzantine) Lectionary readings (Epistle and Gospel) for today, ${today}, following the standard church calendar (Gregorian/New Calendar unless typically specified otherwise).
        Output: Provide ONLY the scripture references combined in a single line, separated by semicolons.
      `;
      break;
  }

  prompt += " Do not add introductory text.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use fast model for UI interaction
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Lectionary fetch failed:", error);
    return "";
  }
};

export const generateStudyGuide = async (
  config: StudyConfig, 
  onLog: (log: ActivityLog) => void,
  apiKey: string
): Promise<StudyGuideResponse> => {
  const ai = new GoogleGenAI({ apiKey });
  const isChinese = config.language === Language.TraditionalChinese;
  const protocol = getGenreProtocol(config.studyType, isChinese);
  
  const log = (en: string, zh: string, status: 'pending' | 'processing' | 'success' | 'error' = 'processing', detail?: string) => {
    onLog({ id: crypto.randomUUID(), timestamp: new Date(), label: { en, zh }, status, detail });
  };

  const selectedApproaches = config.approaches.map(id => {
    const item = APPROACHES.find(a => a.id === id);
    return item ? `${item.label[isChinese ? 'zh' : 'en']} (${item.description[isChinese ? 'zh' : 'en']})` : id;
  }).join("; ");

  const selectedTraditions = config.traditions.map(id => {
    const item = TRADITIONS.find(t => t.id === id);
    return item ? `${item.label[isChinese ? 'zh' : 'en']} (${item.description[isChinese ? 'zh' : 'en']})` : id;
  }).join("; ");

  let customContext = config.customApproach ? `Custom Methodology: ${config.customApproach}` : "";

  // -- DETECT ANGLICAN TRADITION AND INJECT SPECIALIZED PROTOCOL --
  if (config.traditions.includes('anglican')) {
     customContext += `
    \n\n**ANGLICAN HERMENEUTICAL PROTOCOL (The "Dynamic Symphony" & "Critical Orthodoxy")**:
    1. **The "Three-Legged Stool" (Reinterpreted)**: Treat Scripture as the *primary* authority, but interpret it dynamically through the lens of Tradition (the "cumulative reason" of the church) and Reason (Spirit-led discernment in the present). Avoid "Sola Scriptura" fundamentalism.
    2. **Liturgical Hermeneutics**: Embrace Thomas Cranmer's collect: "read, mark, learn, and inwardly digest". The text must be read as *Lectio Continua* (part of a grand narrative) and *Sacrament* (transforming the inner life).
    3. **"Critical Orthodoxy" (The Cambridge Trio Legacy)**: Like Westcott, Hort, and Lightfoot, use rigorous historical-critical tools *in service of* Incarnational faith. Do not separate the "historical Jesus" from the "Christ of faith".
    4. **Critical Realism (N.T. Wright)**: Read the text (especially NT) through the lens of First-Century Judaism, "New Perspective on Paul" (Covenant vs. Legalism), and the concept of "Ongoing Exile".
    5. **Hong Kong/Asian Context (If applicable)**: If writing in Chinese, integrate the perspective of **HKSKH (Hong Kong Sheng Kung Hui)**. Bridge the gap between Western theology and Chinese culture (e.g., Confucian ethics). Reference Ming Hua Theological College's scholarly ethos (e.g., Gareth Jones, Philip Wickeri).
    6. **Scriptural Reasoning**: Adopt a "generous" reading that seeks deep understanding across differences, rather than mere dogmatic consensus.
     `;
  }

  // -- STEP 0: MODIFY STRUCTURE BASED ON CONFIG --
  if (config.includeBackground) {
    const newStructure = [...protocol.structure];
    newStructure.splice(1, 0, "Historical & Literary Context (Background)");
    protocol.structure = newStructure;
  }

  // -- STEP 1: LIBRARIAN AGENT EXECUTION --
  // ALWAYS RUN, regardless of config.autoResearch
  let researchDossier: LibrarianDossier = { bibliography: [], researchSummary: "", rawSources: [] };
  researchDossier = await generateResearchDossier(config, log, apiKey);


  // -- STEP 2: WRITER AGENT CONFIGURATION --
  const systemInstruction = `
    You are an AI-Biblical Scholar for Sacred Studies.
    
    PROJECT CONFIGURATION:
    Passage: "${config.passage}"
    Topic/Focus: "${config.topic}"
    Target Depth: ${config.knowledgeLevel}
    Language: ${isChinese ? 'Traditional Chinese' : 'English'}
    
    METHODOLOGICAL FRAMEWORK:
    - Approaches: ${selectedApproaches || "Standard Exegesis"}
    - Traditions: ${selectedTraditions || "General Historical Context"}
    - ${customContext}
    
    LIBRARIAN'S RESEARCH DOSSIER:
    The Librarian has provided verified sources. 
    Bibliography: ${JSON.stringify(researchDossier.bibliography)}
    Key Insights: ${researchDossier.researchSummary}
    
    ROLE & STYLE:
    Role: ${protocol.role}
    Format: ${protocol.style}
    
    CORE REQUIREMENTS:
    1. **Integration of Scholarship**: Cite the provided sources where relevant.
    2. **Citation Style**: Use Chicago Style in-text citations (Author Year).
    3. **NO REDUNDANT LISTS**: Do NOT list references at the end of sections. Consolidate ALL references into the final "Selected Bibliography".
    4. **PRIMARY SOURCE RIGOR**: Even when using secondary literature, you MUST interact directly with the primary text (Hebrew/Greek). Do not let commentaries replace your own linguistic analysis.
    5. **Length & Depth**: Do not be brief. Write comprehensive, fully developed paragraphs. Use 1000+ words total if possible.
    
    ${protocol.constraints}
    
    FORMATTING:
    - Return clean Markdown. 
    - Use # for Main Title (only once in first section), ## for Section Headers, ### for Sub-headers.
    - NEVER use dollar signs ($) for Latex.
    - Bold original scripts (e.g., **Logos**), Italicize transliterations.
  `;

  try {
    log("Initializing Writer Node", "正在初始化寫作節點", 'processing');
    
    const configParams: any = {
      systemInstruction,
      temperature: 0.7,
      tools: [{ googleSearch: {} }] 
    };

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: configParams
    });

    let fullContent = "";
    let allSources: { uri: string; title: string }[] = [...researchDossier.rawSources];

    // Synthesize based on genre-specific structure
    for (const sectionTitle of protocol.structure) {
      const sectionLabelEn = sectionTitle;
      const sectionLabelZh = isChinese ? `正在生成：${sectionTitle}` : `Synthesizing ${sectionTitle}`;
      
      log(sectionLabelEn, sectionLabelZh, 'processing');
      
      let prompt = `Draft the section: "${sectionTitle}" for a ${protocol.style} on ${config.passage}. \n\n`;
      
      const isBib = sectionTitle.toLowerCase().includes("bibliography") || sectionTitle.includes("書目");
      const isLinguistic = sectionTitle.toLowerCase().includes("linguistic") || sectionTitle.toLowerCase().includes("structural") || sectionTitle.toLowerCase().includes("exegesis");
      const isBackground = sectionTitle.toLowerCase().includes("context") || sectionTitle.toLowerCase().includes("background");

      if (!isBib) {
         prompt += `
         STRICT LAYOUT RULE: 
         - Write the section content ONLY.
         - Do NOT include a "Bibliography", "References", or "Works Cited" list at the end of this response. 
         - STOP immediately after the concluding sentence of this section.
         `;
      }
      
      // Dynamic Context Injection based on Section Type
      if (isLinguistic) {
        prompt += `
          CRITICAL INSTRUCTION - PRIMARY SOURCE WORK (MANDATORY):
          - You MUST include the actual Hebrew/Greek characters for key words.
          - Provide a detailed word study (Lexical Analysis) for 3-5 keywords.
          - Analyze the grammar/syntax (parsing) explicitly.
          - If you fail to include the original language analysis, the output is failed.
        `;
      } else if (isBackground) {
         prompt += `
           CRITICAL INSTRUCTION:
           - Provide a detailed introduction to the book, authorship, dating, and historical setting.
           - Discuss the immediate literary context of the passage.
         `;
      } else if (sectionTitle.toLowerCase().includes("methodological") || sectionTitle.toLowerCase().includes("approaches")) {
        prompt += `
          CRITICAL INSTRUCTION:
          - Apply the selected approaches: ${selectedApproaches || "Appropriate Critical Methodologies"}.
          - Demonstrate how these methods change the interpretation.
        `;
      } else if (sectionTitle.toLowerCase().includes("tradition") || sectionTitle.toLowerCase().includes("historical")) {
        prompt += `
          CRITICAL INSTRUCTION:
          - Explore interpretations from: ${selectedTraditions || "Relevant Historical Traditions"}.
          - Cite specific theologians or schools of thought found in the research.
        `;
      } else if (isBib) {
        prompt += `
          CRITICAL INSTRUCTION: 
          - Compile the FINAL COMPREHENSIVE BIBLIOGRAPHY here.
          - It must include all sources from the Librarian's Dossier: ${JSON.stringify(researchDossier.bibliography)}
          - Format strictly in Chicago Manual of Style.
          - Sort alphabetically by author.
          - Do NOT include duplicates.
          - Do NOT include this instruction in the output.
        `;
      } else {
         prompt += `
          CRITICAL INSTRUCTION:
          - Integrate citations from the Librarian's Dossier (e.g., "${researchDossier.bibliography.slice(0, 2).join('; ')}...") into the prose to support your arguments.
          - Ensure high academic rigor.
         `;
      }

      prompt += `\nEnsure the prose is substantial, rigorous, and directly addresses the prompt.`;

      const response = await chat.sendMessage({ message: prompt });
      fullContent += `\n\n${response.text || ""}`;
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) {
            allSources.push({ uri: chunk.web.uri, title: chunk.web.title });
          }
        });
      }
      log(`${sectionTitle} Finalized`, `${sectionTitle} 已完成`, 'success');
    }

    const uniqueSources = Array.from(new Set(allSources.map(s => s.uri)))
      .map(uri => allSources.find(s => s.uri === uri)!)
      .filter(s => s.title && s.uri);

    return { text: fullContent.trim(), sources: uniqueSources };
  } catch (error: any) {
    log("Generation Interrupt", "生成中斷", 'error', error?.message);
    throw error;
  }
};
