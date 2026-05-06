import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const PA_SYSTEM_PROMPT = `You are an expert Medicare and Medicaid Prior Authorization clinical reviewer with 20 years of experience. You follow CMS Local Coverage Determinations (LCDs), National Coverage Determinations (NCDs), and evidence-based medical necessity criteria.

Given a PA request, you must return ONLY a valid JSON object with this exact structure:
{
  "verdict": "LIKELY_APPROVED" | "LIKELY_DENIED" | "NEEDS_MORE_INFO",
  "confidence": 0.0 to 1.0,
  "rationale": ["bullet 1", "bullet 2", ...],
  "documentationGaps": ["gap 1", "gap 2", ...],
  "suggestedCodes": [{"code": "ICD-10", "description": "why it helps"}],
  "turnaroundEstimate": "e.g. 3-5 business days",
  "appealStrength": "STRONG" | "MODERATE" | "WEAK",
  "summaryForProvider": "2-3 sentence plain English summary"
}

Be specific, cite guideline logic, and be actionable. Never return anything outside the JSON object.`;

export interface AIAnalysisResult {
  verdict: 'LIKELY_APPROVED' | 'LIKELY_DENIED' | 'NEEDS_MORE_INFO';
  confidence: number;
  rationale: string[];
  documentationGaps: string[];
  suggestedCodes: { code: string; description: string }[];
  turnaroundEstimate: string;
  appealStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  summaryForProvider: string;
}

export async function analyzePA(params: {
  patientName: string;
  patientDOB: string;
  diagnosisCodes: string;
  procedureCode: string;
  procedureDescription: string;
  payer: string;
  urgency: string;
  clinicalNotes: string;
  pdfText?: string;
}): Promise<AIAnalysisResult> {
  const userContent = `
PA REQUEST FOR CLINICAL REVIEW:

Patient: ${params.patientName} (DOB: ${params.patientDOB})
Payer: ${params.payer}
Urgency: ${params.urgency}
Diagnosis Codes (ICD-10): ${params.diagnosisCodes}
Procedure/Drug Code: ${params.procedureCode}
Procedure Description: ${params.procedureDescription}

Clinical Notes:
${params.clinicalNotes}
${params.pdfText ? `\nAdditional Documentation (from uploaded PDF):\n${params.pdfText}` : ''}

Please analyze this PA request per CMS LCD/NCD guidelines and return your structured JSON assessment.
`.trim();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: PA_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  // Extract the JSON object — handles plain JSON or markdown-fenced ```json ... ```
  const raw = content.text.trim();
  const jsonText = raw.startsWith('{')
    ? raw
    : (raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim() ?? raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim());

  const parsed = JSON.parse(jsonText) as AIAnalysisResult;
  return parsed;
}

export async function generateAppealLetter(params: {
  patientName: string;
  patientDOB: string;
  patientMemberId: string;
  diagnosisCodes: string;
  procedureCode: string;
  procedureDescription: string;
  payer: string;
  clinicalNotes: string;
  denialReason: string;
  aiRationale: string[];
  aiDocGaps: string[];
}): Promise<string> {
  const prompt = `You are a clinical appeals specialist. Write a formal CMS-compliant prior authorization appeal letter.

PA DETAILS:
Patient: ${params.patientName} (DOB: ${params.patientDOB}, Member ID: ${params.patientMemberId})
Payer: ${params.payer}
Diagnosis: ${params.diagnosisCodes}
Procedure: ${params.procedureCode} – ${params.procedureDescription}
Denial Reason: ${params.denialReason}

Clinical Notes: ${params.clinicalNotes}

AI Review Findings:
- Rationale: ${params.aiRationale.join('; ')}
- Documentation Gaps Addressed: ${params.aiDocGaps.join('; ')}

Write a professional appeal letter with:
1. Date and recipient header
2. Re: line with member and procedure info
3. Opening paragraph citing the denial
4. Clinical justification section with CMS guideline citations
5. Medical necessity argument addressing each denial reason
6. Closing with request for expedited review if urgent
7. Signature block for treating provider

Use formal medical/legal language appropriate for CMS appeals.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  return content.text;
}
