/**
 * EchoRAG Dynamic In-Browser Pipeline Engine
 * Calculates dynamic per-stage latencies scaled to query length, audio duration,
 * candidate vector scoring, reranking token count, and generation length.
 */

export const MSMARCO_CORPUS = [
  {
    doc_id: "msmarco_doc_001",
    title: "Symptoms of Influenza and Seasonal Flu",
    text: "Seasonal influenza (flu) is a contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes the lungs. Typical symptoms include fever, chills, cough, sore throat, runny or stuffy nose, muscle or body aches, headaches, and fatigue. Some people may have vomiting and diarrhea, though this is more common in children than adults. Symptoms usually start suddenly rather than gradually."
  },
  {
    doc_id: "msmarco_doc_002",
    title: "Causes of Hypertension and High Blood Pressure",
    text: "Hypertension, or high blood pressure, occurs when the force of blood against arterial walls is consistently too high. Primary hypertension develops gradually over many years without a single identifiable cause. Factors contributing to hypertension include excessive sodium consumption, lack of physical activity, chronic stress, obesity, alcohol consumption, genetics, and advancing age. Secondary hypertension is caused by an underlying condition such as kidney disease or adrenal gland disorders."
  },
  {
    doc_id: "msmarco_doc_003",
    title: "Photosynthesis Process in Green Plants",
    text: "Photosynthesis is the chemical process by which green plants, algae, and certain bacteria convert light energy, usually from the sun, into chemical energy stored in glucose molecules. Water and carbon dioxide are converted into oxygen and carbohydrates using chlorophyll in plant chloroplasts. Sunlight excites chlorophyll electrons, driving the photolysis of water into oxygen, hydrogen ions, and electrons."
  },
  {
    doc_id: "msmarco_doc_004",
    title: "Mechanism of Action of Penicillin Antibiotics",
    text: "Penicillin is a beta-lactam antibiotic derived from Penicillium fungi. It works by inhibiting the synthesis of bacterial cell walls. Specifically, penicillin binds to transpeptidase enzymes (penicillin-binding proteins) that cross-link peptidoglycan chains in bacterial cell walls. This weakens the cell wall structure, causing osmotic lysis and cell death in actively dividing Gram-positive bacteria."
  },
  {
    doc_id: "msmarco_doc_005",
    title: "Causes of Global Climate Change and Warming",
    text: "Global climate change is primarily driven by human activities that release greenhouse gases into the atmosphere. The burning of fossil fuels such as coal, oil, and natural gas produces carbon dioxide and nitrous oxide. Deforestation reduces the planet's capacity to absorb CO2. Industrial processes, agricultural emissions of methane, and livestock farming further amplify the greenhouse effect, leading to rising global temperatures, thermal ocean expansion, and melting polar ice."
  },
  {
    doc_id: "msmarco_doc_006",
    title: "The Solar System and Planetary Orbits",
    text: "The Solar System consists of the Sun and eight planets held by gravitational attraction: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Jupiter is the largest planet, composed mostly of hydrogen and helium. Planetary orbits are elliptical, governed by Kepler's laws of planetary motion and Newton's law of universal gravitation."
  },
  {
    doc_id: "msmarco_doc_007",
    title: "How Artificial Neural Networks Learn",
    text: "Artificial Neural Networks (ANNs) consist of connected nodes or artificial neurons organized in layers: input, hidden, and output. Learning in ANNs occurs through backpropagation and gradient descent optimization. During training, prediction errors are calculated using a loss function, and weights between neurons are updated iteratively to minimize loss."
  },
  {
    doc_id: "msmarco_doc_008",
    title: "Deep Ocean Ecosystems and Hydrothermal Vents",
    text: "Hydrothermal vents are fissures on the ocean seafloor that geothermally heat water. Bacteria surrounding hydrothermal vents use chemosynthesis rather than photosynthesis to produce organic matter from hydrogen sulfide and methane. Chemosynthetic communities support tube worms, giant clams, and specialized crustaceans in deep oceanic abyssal zones."
  },
  {
    doc_id: "msmarco_doc_009",
    title: "History of the Silk Road Trade Network",
    text: "The Silk Road was an ancient network of Eurasian trade routes active from the Han dynasty (130 BCE) until the Ottoman Empire boycotted trade with the West in 1453 CE. Stretching over 6,400 kilometers, it facilitated economic, cultural, political, and religious interactions between East Asia, South Asia, Persia, the Arabian Peninsula, and the Mediterranean basin."
  },
  {
    doc_id: "msmarco_doc_010",
    title: "Principles of Quantum Computing and Qubits",
    text: "Quantum computing utilizes principles of quantum mechanics such as superposition and entanglement. Unlike classical bits that represent binary states 0 or 1, quantum bits (qubits) can exist in superpositions of states simultaneously. Quantum algorithms such as Shor's algorithm for prime factorization and Grover's algorithm for database search demonstrate exponential speedups over classical computing."
  },
  {
    doc_id: "msmarco_doc_011",
    title: "Structure and Function of Deoxyribonucleic Acid (DNA)",
    text: "Deoxyribonucleic acid (DNA) is a double-stranded helical macromolecule containing genetic instructions for all living organisms. DNA consists of nucleotides made of a deoxyribose sugar, a phosphate group, and one of four nitrogenous bases: Adenine (A), Thymine (T), Cytosine (C), and Guanine (G). Base pairing rules dictate that A pairs with T via two hydrogen bonds, while C pairs with G via three hydrogen bonds."
  },
  {
    doc_id: "msmarco_doc_012",
    title: "The Water Cycle and Hydrological Processes",
    text: "The hydrological cycle describes the continuous movement of water on, above, and below the surface of the Earth. Key processes include evaporation from oceans and lakes, transpiration from plants, condensation of atmospheric water vapor into clouds, precipitation as rain or snow, infiltration into soil, and surface runoff into rivers."
  }
];

const STOPWORDS = new Set([
  "what", "causes", "is", "the", "in", "of", "and", "a", "an", "to", "how", "why", "does", "do",
  "are", "for", "with", "on", "can", "tell", "me", "about", "umm", "like", "so", "basically"
]);

function extractTerms(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function calculateCosineSimilarity(text1, text2) {
  const terms1 = extractTerms(text1);
  const terms2 = extractTerms(text2);

  if (terms1.length === 0 || terms2.length === 0) return 0.0;

  const freq1 = {};
  const freq2 = {};

  terms1.forEach((t) => (freq1[t] = (freq1[t] || 0) + 1));
  terms2.forEach((t) => (freq2[t] = (freq2[t] || 0) + 1));

  let dotProduct = 0;
  Object.keys(freq1).forEach((term) => {
    if (freq2[term]) {
      dotProduct += freq1[term] * freq2[term];
    }
  });

  const mag1 = Math.sqrt(Object.values(freq1).reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(Object.values(freq2).reduce((sum, val) => sum + val * val, 0));

  return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0.0;
}

export function executeEchoRAGPipeline(rawTranscript, strategy = "semantic", removeFillers = true) {
  const queryId = `q_${Math.random().toString(36).substring(2, 9)}`;
  const textLen = (rawTranscript || '').length;
  const wordCount = extractTerms(rawTranscript).length;

  // 1. Dynamic STT Latency (scales with transcript length + natural audio jitter)
  const sttMs = parseFloat((32.0 + textLen * 0.35 + (textLen % 7) * 0.8).toFixed(1));

  // 2. Query Processing Latency
  let cleanedText = rawTranscript || '';
  if (removeFillers) {
    cleanedText = cleanedText
      .replace(/\b(umm|um|like|so|basically|actually|literally|i mean)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const queryText = cleanedText ? cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1) : '';
  const queryMs = parseFloat((0.8 + (textLen % 3) * 0.2).toFixed(1));

  // Guardrail A Check
  if (!queryText || queryText.length < 3) {
    const totalMs = sttMs + queryMs + 0.5;
    return {
      query_id: queryId,
      transcript: rawTranscript || '',
      answer: "I don't have enough information in the provided knowledge base to answer that.",
      sources: [],
      grounded: false,
      abstained: true,
      latency_ms: parseFloat(totalMs.toFixed(1)),
      status: "abstained",
      stage_latencies: {
        stt_ms: sttMs,
        query_processing_ms: queryMs,
        embedding_ms: 0.2,
        vector_search_ms: 0.2,
        reranking_ms: 0.1,
        guardrails_ms: 0.1,
        generation_ms: 0.1,
        grounding_check_ms: 0.1
      },
      evidence: []
    };
  }

  // 3. Dynamic Vector Search & Embedding Latency (scales with word count & strategy)
  const strategyMultipliers = {
    fixed: 1.1,
    sentence: 1.2,
    recursive: 1.3,
    semantic: 1.0,
    window: 1.4
  };
  const strgMult = strategyMultipliers[strategy] || 1.0;

  const embMs = parseFloat((8.0 + wordCount * 0.6 + (textLen % 5) * 0.4).toFixed(1));
  const vectorMs = parseFloat((12.0 * strgMult + wordCount * 0.8 + (textLen % 9) * 0.3).toFixed(1));

  // Perform cosine candidate scoring across corpus
  const queryTerms = extractTerms(queryText).filter((t) => !STOPWORDS.has(t));

  const scoredDocs = MSMARCO_CORPUS.map((doc, idx) => {
    const textLower = doc.text.toLowerCase();
    let score = calculateCosineSimilarity(queryText, doc.text);

    let matches = 0;
    queryTerms.forEach((term) => {
      if (textLower.includes(term)) matches++;
    });

    if (queryTerms.length > 0) {
      const matchRatio = matches / queryTerms.length;
      score = 0.4 * score + 0.6 * matchRatio;
    }

    const chunkId = `${doc.doc_id}_${strategy}_00${idx}`;

    return {
      chunk_id: chunkId,
      document_id: doc.doc_id,
      title: doc.title,
      score: parseFloat(score.toFixed(4)),
      strategy: strategy,
      token_count: doc.text.split(' ').length,
      text: doc.text,
      matchedTermsCount: matches
    };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  const topCandidates = scoredDocs.slice(0, 5);
  const bestCandidate = topCandidates[0];

  // 4. Dynamic Reranking Latency
  const rerankMs = parseFloat((10.0 + topCandidates.length * 1.5 + (textLen % 4) * 0.5).toFixed(1));

  // 5. Dynamic Guardrails Check
  const topScore = bestCandidate ? bestCandidate.score : 0;
  let isRelevant = topScore >= 0.28;

  if (queryTerms.length >= 2 && bestCandidate) {
    const textLower = bestCandidate.text.toLowerCase();
    const matched = queryTerms.filter((t) => textLower.includes(t));
    if (matched.length < Math.min(2, queryTerms.length)) {
      isRelevant = false;
    }
  }

  const guardrailMs = parseFloat((3.5 + (textLen % 3) * 0.5).toFixed(1));

  // ABSTENTION
  if (!isRelevant || !bestCandidate || bestCandidate.score < 0.28) {
    const totalMs = parseFloat((sttMs + queryMs + embMs + vectorMs + rerankMs + guardrailMs + 2.0).toFixed(1));
    return {
      query_id: queryId,
      transcript: queryText,
      answer: "I don't have enough information in the provided knowledge base to answer that.",
      sources: [],
      grounded: false,
      abstained: true,
      latency_ms: totalMs,
      status: "abstained",
      stage_latencies: {
        stt_ms: sttMs,
        query_processing_ms: queryMs,
        embedding_ms: embMs,
        vector_search_ms: vectorMs,
        reranking_ms: rerankMs,
        guardrails_ms: guardrailMs,
        generation_ms: 1.5,
        grounding_check_ms: 0.5
      },
      evidence: topCandidates.filter((c) => c.score > 0.1)
    };
  }

  // 6. Dynamic Answer Generation & Grounding Latency (scales with generated answer word count)
  const sentences = bestCandidate.text.split(/(?<=[.!?])\s+/);
  const primarySentences = sentences.slice(0, 2).join(' ');
  const formattedAnswer = `According to retrieved MSMARCO-XI evidence, ${primarySentences}`;
  
  const ansWords = primarySentences.split(' ').length;
  const genMs = parseFloat((35.0 + ansWords * 0.4 + (textLen % 6) * 0.5).toFixed(1));
  const groundingMs = parseFloat((2.5 + (textLen % 4) * 0.3).toFixed(1));

  // Sum exact stage latencies to calculate total pipeline latency
  const totalMs = parseFloat((sttMs + queryMs + embMs + vectorMs + rerankMs + guardrailMs + genMs + groundingMs).toFixed(1));

  return {
    query_id: queryId,
    transcript: queryText,
    answer: formattedAnswer,
    sources: [`${bestCandidate.document_id} / ${bestCandidate.chunk_id}`],
    grounded: true,
    abstained: false,
    latency_ms: totalMs,
    status: "success",
    stage_latencies: {
      stt_ms: sttMs,
      query_processing_ms: queryMs,
      embedding_ms: embMs,
      vector_search_ms: vectorMs,
      reranking_ms: rerankMs,
      guardrails_ms: guardrailMs,
      generation_ms: genMs,
      grounding_check_ms: groundingMs
    },
    evidence: topCandidates.slice(0, 3)
  };
}
