/**
 * Grounding Engine & Chunking Utility for ConceptCraft
 * Strictly isolates uploaded/pasted text into semantic chunks for RAG grounding.
 */

export const SAMPLE_TOPICS = [
  {
    id: 'ohms-law',
    title: "Ohm's Law & Electric Circuits",
    category: "Physics",
    icon: "Zap",
    summary: "How Voltage, Current, and Resistance interact in an electrical circuit.",
    hasInteractiveVisual: true,
    rawText: `Ohm's Law is a fundamental principle of electronics and physics discovered by Georg Ohm. It describes how electrical current flows through a conductor based on two main forces: Voltage and Resistance.

[Passage 1: Voltage and Driving Force]
Voltage (measured in Volts, symbol V) is the electrical pressure or push that forces electric charge through a circuit. Think of voltage like water pressure in a pipe—the higher the pressure, the stronger the force pushing water through.

[Passage 2: Electrical Current]
Electrical Current (measured in Amperes or Amps, symbol I) is the actual flow rate of electric charges (electrons) moving past a point per second. If voltage is water pressure, current is the volume of water flowing through the pipe per second.

[Passage 3: Resistance and Friction]
Resistance (measured in Ohms, symbol Ω) is the opposition to the flow of electric current. Materials like copper have low resistance, allowing electricity to pass easily. Materials like rubber or glass have high resistance, blocking electric flow. Resistance acts like friction or a narrow squeeze in a water pipe.

[Passage 4: The Mathematical Formula]
The relationship between Voltage (V), Current (I), and Resistance (R) is expressed in the formula: V = I × R (Voltage = Current times Resistance). From this, we can also calculate Current: I = V / R, or Resistance: R = V / I. If you increase the voltage while keeping resistance constant, current increases. If you increase resistance while keeping voltage constant, current decreases.`
  },
  {
    id: 'photosynthesis',
    title: "Photosynthesis: How Plants Make Food",
    category: "Biology",
    icon: "Sun",
    summary: "How green plants use sunlight, water, and carbon dioxide to create oxygen and glucose.",
    hasInteractiveVisual: false,
    rawText: `Photosynthesis is the essential biological process by which green plants, algae, and certain bacteria convert sunlight energy into chemical energy stored in glucose (sugar).

[Passage 1: Sunlight and Chlorophyll]
Plants capture sunlight using a green pigment called Chlorophyll, which is located inside cell structures called Chloroplasts. Chlorophyll acts like a tiny solar panel, absorbing light energy, particularly red and blue wavelengths, while reflecting green light.

[Passage 2: The Raw Ingredients]
To perform photosynthesis, plants take in two main raw ingredients from their environment: Water (H2O) absorbed through their roots from the soil, and Carbon Dioxide (CO2) absorbed from the surrounding air through microscopic pores on leaves called Stomata.

[Passage 3: The Chemical Reaction and Products]
Using sunlight energy, chloroplasts split water molecules and recombine carbon and oxygen atoms with hydrogen to form Glucose (C6H12O6). Glucose serves as vital food and energy for the plant's growth. As a crucial byproduct, plants release Oxygen gas (O2) back into the atmosphere through the stomata.

[Passage 4: Ecological Importance]
Photosynthesis is fundamental to life on Earth. It produces virtually all of the oxygen organisms breathe and forms the base of the terrestrial and aquatic food chains.`
  },
  {
    id: 'water-cycle',
    title: "The Earth's Water Cycle",
    category: "Earth Science",
    icon: "CloudRain",
    summary: "The continuous movement of water on, above, and below the surface of the Earth.",
    hasInteractiveVisual: false,
    rawText: `The Water Cycle (also known as the Hydrologic Cycle) describes the continuous movement of water through the Earth's atmosphere, land, and oceans. Water constantly changes forms between liquid, vapor, and ice.

[Passage 1: Evaporation and Transpiration]
Evaporation occurs when heat from the Sun warms liquid water in oceans, lakes, and rivers, turning it into invisible water vapor (gas) that rises into the air. Plants also contribute water vapor through Transpiration, where moisture evaporates from leaves.

[Passage 2: Condensation and Cloud Formation]
As warm water vapor rises into the cooler upper atmosphere, it cools down and condenses back into liquid water droplets or tiny ice crystals. These tiny droplets cluster together around microscopic dust particles to form clouds and fog.

[Passage 3: Precipitation]
When clouds become heavy with condensed water droplets, gravity pulls the moisture back down to Earth as Precipitation. Depending on atmospheric temperatures, precipitation falls as rain, snow, sleet, or hail.

[Passage 4: Collection and Runoff]
Precipitation collects on Earth in oceans, rivers, and lakes. Some water seeps deep into the soil as Groundwater, while surface water flows over land as Runoff back into bodies of water, restarting the perpetual cycle.`
  }
];

/**
 * Parses raw text into semantic, numbered concept chunks.
 */
export function extractAndChunkText(rawText, sourceName = "Uploaded Material") {
  if (!rawText || !rawText.trim()) return [];

  // Split by explicit [Passage X: Title] markers if present, or split by double line breaks / paragraphs
  let rawChunks = [];
  
  if (rawText.includes('[Passage') || rawText.includes('Passage')) {
    const parts = rawText.split(/\[Passage\s*(\d+)?:\s*([^\]]+)\]/gi);
    if (parts.length > 2) {
      let chunkCount = 1;
      for (let i = 1; i < parts.length; i += 3) {
        const title = parts[i + 1] ? parts[i + 1].trim() : `Section ${chunkCount}`;
        const content = parts[i + 2] ? parts[i + 2].trim() : '';
        if (content) {
          rawChunks.push({
            id: `CH-${chunkCount}`,
            passageNum: chunkCount,
            title: title,
            content: content,
            sourceName: sourceName
          });
          chunkCount++;
        }
      }
    }
  }

  // Fallback if no passage tags found: chunk by paragraphs (grouping 1-2 paragraphs (~150-250 words))
  if (rawChunks.length === 0) {
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 30);

    let currentBuffer = "";
    let chunkCount = 1;

    for (let i = 0; i < paragraphs.length; i++) {
      if ((currentBuffer + "\n\n" + paragraphs[i]).length > 600 && currentBuffer.length > 0) {
        // First line as title snippet
        const titleLine = currentBuffer.split('.')[0].slice(0, 60) + "...";
        rawChunks.push({
          id: `CH-${chunkCount}`,
          passageNum: chunkCount,
          title: `Passage ${chunkCount}: ${titleLine}`,
          content: currentBuffer,
          sourceName: sourceName
        });
        chunkCount++;
        currentBuffer = paragraphs[i];
      } else {
        currentBuffer = currentBuffer ? (currentBuffer + "\n\n" + paragraphs[i]) : paragraphs[i];
      }
    }

    if (currentBuffer) {
      const titleLine = currentBuffer.split('.')[0].slice(0, 60) + "...";
      rawChunks.push({
        id: `CH-${chunkCount}`,
        passageNum: chunkCount,
        title: `Passage ${chunkCount}: ${titleLine}`,
        content: currentBuffer,
        sourceName: sourceName
      });
    }
  }

  return rawChunks;
}

/**
 * Simple keyword & term overlap chunk retriever for grounding.
 */
export function retrieveContextChunks(chunks, query = "", topK = 3) {
  if (!chunks || chunks.length === 0) return [];
  if (!query) return chunks.slice(0, topK);

  const keywords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  
  const scored = chunks.map(chunk => {
    const text = (chunk.title + " " + chunk.content).toLowerCase();
    let score = 0;
    keywords.forEach(kw => {
      if (text.includes(kw)) score += 1;
    });
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.chunk);
}
