import { GoogleGenAI } from "@google/genai";

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
};

export const SYSTEM_INSTRUCTION = `Você é uma IA especializada em criar ILUSTRAÇÕES INFANTIS PROFISSIONAIS para festas, com ALTA CONSISTÊNCIA VISUAL e FACIAL.
OBJETIVO: Gerar um KIT COMPLETO DE FESTA INFANTIL em estilo FOFO e PROFISSIONAL.
REGRAS: Apenas uma criança, rosto alegre, proporções infantis, sem texto nas imagens, sem rostos extras.
Mantenha forte semelhança facial com a criança fornecida.`;
