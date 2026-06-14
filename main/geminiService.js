async function generateQuestions(topic, apiKey, lang = 'en') {
  if (!apiKey) return { error: 'Chybí API klíč pro Gemini.' };
  
  const langText = lang === 'cs' ? 'češtině' : 'angličtině';
  const prompt = `Jsi učitel. Vygeneruj přesně 3 otázky v ${langText}, které otestují znalosti na téma: "${topic}". Odpověz POUZE ve formátu JSON splňujícím toto schéma, bez markdownových bloků (\`\`\`json): [{"id": 1, "question": "Otázka?", "hint": "Klíčové pojmy nebo správný směr odpovědi"}]`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Chyba API');
    
    let textResult = data.candidates[0].content.parts[0].text;
    return { questions: JSON.parse(textResult) };
  } catch (error) {
    console.error('[Gemini Service] Generate Error:', error);
    return { error: 'Nepodařilo se vygenerovat otázky. Zkontroluj API klíč nebo síť.' };
  }
}

async function evaluateAnswers(qaPairs, apiKey, lang = 'en') {
  if (!apiKey) return { error: 'Chybí API klíč pro Gemini.' };
  
  const langText = lang === 'cs' ? 'češtině' : 'angličtině';
  // qaPairs je pole objektů: { question, answer, hint }
  const prompt = `Vyhodnoť odpovědi studenta na zadané otázky. Zde jsou otázky, studentovy odpovědi a správný směr (nápověda):\n${JSON.stringify(qaPairs)}\n\nPřiřaď celkové skóre od 0 (zcela špatně) do 10 (vynikající porozumění). Napiš krátké, motivující zhodnocení v ${langText}. Odpověz POUZE ve formátu JSON, bez markdownových bloků (\`\`\`json): {"score": 8, "feedback": "Skvělá práce..."}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Chyba API');
    
    let textResult = data.candidates[0].content.parts[0].text;
    return { evaluation: JSON.parse(textResult) };
  } catch (error) {
    console.error('[Gemini Service] Evaluate Error:', error);
    return { error: 'Nepodařilo se vyhodnotit odpovědi.' };
  }
}

module.exports = { generateQuestions, evaluateAnswers };
