import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(cors());
app.use(express.json());

app.post("/api/claude", async (req, res) => {
  try {
    const { tipo_cliente, rubro, objetivo, contexto, problemas } = req.body;

    const tipoMap = {
      informal: "Persona Informal",
      vendedor: "Vendedor Poco Habitual",
      pequena: "Pequeña Empresa",
      mediana: "Mediana Empresa"
    };

    const prompt = `
Eres un asesor comercial experto para América Latina.

Contexto del caso:
- Tipo de cliente: ${tipoMap[tipo_cliente] || tipo_cliente}
- Rubro: ${rubro || "No especificado"}
- Objetivo principal: ${objetivo || "No especificado"}
- Contexto adicional: ${contexto || "No especificado"}

Problemas detectados:
${problemas.map(p => `- ${p}`).join("\n")}

Instrucciones:
- Da entre 3 y 5 soluciones concretas y accionables.
- Escribe en español claro y directo.
- Adapta las soluciones al tipo de cliente.
- Si es Persona Informal: explica simple, pasos básicos.
- Si es Vendedor Poco Habitual: enfócate en frecuencia, visibilidad y seguimiento.
- Si es Pequeña Empresa: enfócate en propuesta de valor, ventas y retención.
- Si es Mediana Empresa: enfócate en escala, procesos, métricas y tecnología.
- Incluye una prioridad (Alta / Media / Baja) para cada solución.
- Cierra con una recomendación principal en una sola frase.
`;

    const msg = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }]
    });

    const text = msg.content?.[0]?.text || "Sin respuesta.";
    res.json({ answer: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar respuesta con Claude." });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));
