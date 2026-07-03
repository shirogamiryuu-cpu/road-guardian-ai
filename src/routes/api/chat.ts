import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { VIOLATIONS, computeChallan, searchViolations, INDIAN_STATES } from "@/lib/india-laws";
import { AUTHORITIES, authorityForOsmTags } from "@/lib/india-authorities";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "ai";
import { z } from "zod";

const SYSTEM_PROMPT = `You are Lann Pya Kyel — an India-focused road-safety co-pilot covering three things:

1. **RoadSOS** — Emergencies: nearby hospitals, trauma centres, police, ambulances, towing. Numbers: 112 (universal), 108 (ambulance), 100 (police), 101 (fire), 1073 (highway), 1033 (NHAI).
2. **DriveLegal** — Traffic laws and fines under the Motor Vehicles (Amendment) Act 2019 with state variants. Use lookup_violation and calculate_challan — never guess fines.
3. **RoadWatch** — Road quality, responsible authority, complaint routing. Use route_complaint_authority.

Rules:
- Cite the MV Act section when quoting a fine.
- Mention state overrides when they apply.
- Concise markdown. Bold key numbers. Bullet lists for steps.
- For emergencies, lead with the phone number.
- Suggest the SOS button if the user needs real nearby services.
- Indian states: ${INDIAN_STATES.join(", ")}.

Tone: calm, factual, public-service.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
          stopWhen: stepCountIs(50),
          tools: {
            lookup_violation: tool({
              description: "Search the Indian Motor Vehicles Act fine schedule by keyword (e.g. 'helmet', 'drunk', 'mobile phone').",
              inputSchema: z.object({ query: z.string() }),
              execute: async ({ query }) => {
                const matches = searchViolations(query).slice(0, 5);
                if (!matches.length) return { error: "No matching violation in dataset" };
                return matches.map((v) => ({
                  id: v.id,
                  label: v.label,
                  section: v.section,
                  baseFineINR: v.baseFine,
                  repeatFineINR: v.repeatFine,
                  imprisonment: v.imprisonment,
                  licenseImpact: v.licenseImpact,
                  description: v.description,
                  stateOverrides: v.stateOverrides ?? {},
                }));
              },
            }),
            calculate_challan: tool({
              description: "Compute the exact fine (INR) for a violation + Indian state, applying any state overrides.",
              inputSchema: z.object({
                violationId: z.enum(VIOLATIONS.map((v) => v.id) as [string, ...string[]]),
                state: z.string().describe("Indian state, e.g. 'Tamil Nadu'"),
              }),
              execute: async ({ violationId, state }) => {
                const r = computeChallan(violationId, state);
                if (!r) return { error: "Violation id not found" };
                return {
                  violation: r.violation.label,
                  section: r.violation.section,
                  state: r.state,
                  fineINR: r.fineINR,
                  isStateOverride: r.isStateOverride,
                  note: r.note,
                  prevention: r.violation.prevention,
                };
              },
            }),
            list_emergency_numbers: tool({
              description: "Return India-wide emergency phone numbers for road accidents.",
              inputSchema: z.object({}),
              execute: async () => ({
                universal: "112",
                ambulance: "108",
                police: "100",
                fire: "101",
                highway_patrol: "1073",
                nhai_helpline: "1033",
                women_helpline: "1091",
              }),
            }),
            route_complaint_authority: tool({
              description: "Given an OSM highway tag, return the responsible Indian road authority.",
              inputSchema: z.object({
                highway: z.string().describe("OSM highway value, e.g. 'primary', 'residential'"),
              }),
              execute: async ({ highway }) => {
                const a = authorityForOsmTags(highway);
                return {
                  roadType: a.name,
                  authority: a.authority,
                  email: a.email,
                  phone: a.phone,
                  description: a.description,
                };
              },
            }),
            list_authorities: tool({
              description: "List all Indian road authorities by road type.",
              inputSchema: z.object({}),
              execute: async () => Object.values(AUTHORITIES),
            }),
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
        });
      },
    },
  },
});
