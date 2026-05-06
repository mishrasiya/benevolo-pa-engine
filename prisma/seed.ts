import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const providerHash = await bcrypt.hash('demo', 12);
  const adminHash = await bcrypt.hash('demo', 12);

  const provider = await prisma.user.upsert({
    where: { email: 'provider@demo.com' },
    update: {},
    create: {
      email: 'provider@demo.com',
      name: 'Dr. Sarah Chen',
      role: 'PROVIDER',
      hashedPassword: providerHash,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      role: 'ADMIN',
      hashedPassword: adminHash,
    },
  });

  console.log('Users created: provider@demo.com, admin@demo.com');

  await prisma.auditEntry.deleteMany();
  await prisma.providerNote.deleteMany();
  await prisma.pARequest.deleteMany();

  const paRequests = [
    // --- 5 Medicare Advantage Drug PA Requests ---
    {
      patientName: 'Robert Hartwell',
      patientDOB: '1948-03-15',
      patientMemberId: 'MCR-1048392',
      diagnosisCodes: 'M05.79,M05.20',
      procedureCode: 'J0129',
      procedureDescription: 'Abatacept (Orencia) 10mg IV – Rheumatoid Arthritis',
      payer: 'MEDICARE',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 78-year-old male with moderate-to-severe rheumatoid arthritis diagnosed in 2019. He has failed methotrexate (15mg/week x 6 months) and adalimumab (40mg biweekly x 4 months) due to inadequate response. Current DAS28 score is 5.8. Requesting abatacept IV infusion per ACR guidelines for biologic-naive switching. No active infections, negative TB screening completed 2025-01-10.',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.89,
      aiRationale: JSON.stringify([
        'Patient meets ACR criteria for biologic switching after failing two prior biologics',
        'Documented failed methotrexate and adalimumab therapy per CMS LCD guidelines',
        'Active RA confirmed with elevated DAS28 score of 5.8 (threshold >5.1 for biologic therapy)',
        'Negative TB screening completed within 12 months as required by CMS',
        'J0129 covered under Medicare Part B for IV administration in outpatient setting',
      ]),
      aiDocGaps: JSON.stringify([]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'M05.611', description: 'RA with involvement of right knee – strengthens medical necessity' },
        { code: 'Z87.39', description: 'Personal history of other musculoskeletal disorders' },
      ]),
      turnaroundEstimate: '3-5 business days',
      appealStrength: 'STRONG',
      aiSummary: 'This PA has strong approval likelihood. The patient clearly meets CMS LCD criteria for biologic switching with two documented prior biologic failures and an active disease burden.',
    },
    {
      patientName: 'Dorothy Kessler',
      patientDOB: '1944-11-28',
      patientMemberId: 'MCR-2039471',
      diagnosisCodes: 'C61,Z79.818',
      procedureCode: 'J9217',
      procedureDescription: 'Leuprolide Acetate (Lupron) 22.5mg IM – Prostate Cancer',
      payer: 'MEDICARE',
      urgency: 'URGENT',
      clinicalNotes: 'Patient is an 81-year-old male with hormone-sensitive metastatic prostate cancer diagnosed 2023-06. PSA at diagnosis was 142 ng/mL. Currently on androgen deprivation therapy. PSA nadir reached 0.4 ng/mL but has risen to 3.8 ng/mL over last 3 months indicating biochemical recurrence. Oncologist requesting continued Lupron 22.5mg q3 months. ECOG performance status 1.',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.94,
      aiRationale: JSON.stringify([
        'Metastatic prostate cancer is a covered indication under Medicare NCD 110.7',
        'ADT continuation is standard of care for hormone-sensitive prostate cancer',
        'PSA rise documented (0.4 to 3.8 ng/mL) confirming biochemical disease activity',
        'J9217 covered under Medicare Part B as administered drug',
        'Oncologist documentation of ECOG PS 1 supports continued aggressive treatment',
      ]),
      aiDocGaps: JSON.stringify([
        'Include recent bone scan or imaging confirming metastatic burden',
        'Document prior PSA trajectory with dates for complete clinical picture',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'C79.51', description: 'Secondary malignant neoplasm of bone – documents metastatic disease' },
      ]),
      turnaroundEstimate: '1-3 business days (urgent)',
      appealStrength: 'STRONG',
      aiSummary: 'High confidence approval. Metastatic prostate cancer with documented biochemical recurrence on ADT is a well-established Medicare-covered indication for continued leuprolide therapy.',
    },
    {
      patientName: 'Francis Delgado',
      patientDOB: '1952-07-04',
      patientMemberId: 'MCR-3847201',
      diagnosisCodes: 'E11.65,E11.638',
      procedureCode: 'J3490',
      procedureDescription: 'Semaglutide (Ozempic) 1mg SQ – Type 2 Diabetes',
      payer: 'MEDICARE',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 73-year-old with Type 2 Diabetes Mellitus and documented ASCVD (prior MI 2021). HbA1c is 9.2% on metformin 1000mg BID and glipizide 10mg BID. Cardiologist has recommended GLP-1 agonist for additional cardiovascular benefit per ADA/ACC guidelines. BMI 34.2. eGFR 58 mL/min/1.73m2.',
      status: 'PENDING',
      aiVerdict: 'NEEDS_MORE_INFO',
      aiConfidence: 0.61,
      aiRationale: JSON.stringify([
        'GLP-1 agonists are not universally covered under Medicare Part D for T2DM without step therapy',
        'ASCVD indication (post-MI) strengthens cardiovascular benefit argument',
        'HbA1c 9.2% documents inadequate glycemic control on current regimen',
        'CMS requires documented failure of at least two first-line agents before GLP-1 coverage in some plans',
      ]),
      aiDocGaps: JSON.stringify([
        'Provide documentation of prior sulfonylurea failure (dates, doses, response)',
        'Include cardiologist letter of medical necessity citing cardiovascular risk reduction indication',
        'Confirm eGFR trend to rule out contraindication at <30 mL/min',
        'Obtain formulary exception letter if semaglutide is non-preferred on plan formulary',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'I25.10', description: 'Prior MI – strengthens cardiovascular indication for GLP-1' },
        { code: 'E66.09', description: 'Obesity – supports metabolic need for GLP-1 agent' },
      ]),
      turnaroundEstimate: '5-7 business days',
      appealStrength: 'MODERATE',
      aiSummary: 'Moderate likelihood. Strong cardiovascular indication but Medicare Part D GLP-1 coverage is plan-specific and step therapy documentation is incomplete.',
    },
    {
      patientName: 'Margaret Okonkwo',
      patientDOB: '1939-02-19',
      patientMemberId: 'MCR-4920183',
      diagnosisCodes: 'G35,G35.9',
      procedureCode: 'J2323',
      procedureDescription: 'Natalizumab (Tysabri) 300mg IV – Multiple Sclerosis',
      payer: 'MEDICARE',
      urgency: 'URGENT',
      clinicalNotes: 'Patient is an 86-year-old female with relapsing-remitting MS diagnosed 2018. She experienced two confirmed relapses in 2024 (January and September) with MRI showing four new T2 lesions. Previously on glatiramer acetate 20mg daily x 18 months with inadequate response. JC antibody index 0.42 (low risk). Neurology requesting natalizumab infusion series.',
      status: 'DENIED',
      aiVerdict: 'LIKELY_DENIED',
      aiConfidence: 0.71,
      aiRationale: JSON.stringify([
        'Age 86 is atypical for natalizumab initiation; CMS may scrutinize closely',
        'Two 2024 relapses document active disease despite prior DMT failure',
        'JC antibody index 0.42 is favorable (low PML risk) but age-related immunosenescence is a concern',
        'Glatiramer acetate failure documented (18 months, 2 relapses)',
      ]),
      aiDocGaps: JSON.stringify([
        'Neurology note must explicitly address risk-benefit analysis for age 86',
        'Provide baseline MRI report from 2024 with radiologist attestation of new T2 lesions',
        'Document functional status (EDSS score) to establish disability trajectory',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'G35', description: 'Multiple sclerosis – primary diagnosis' },
      ]),
      turnaroundEstimate: '7-14 business days',
      appealStrength: 'MODERATE',
      aiSummary: 'Likely denial due to patient age and payer risk aversion for high-cost MS biologics in elderly patients.',
    },
    {
      patientName: 'Harold Simmons',
      patientDOB: '1956-09-30',
      patientMemberId: 'MCR-5813047',
      diagnosisCodes: 'M45.9,M45.2',
      procedureCode: 'J0717',
      procedureDescription: 'Certolizumab Pegol (Cimzia) 200mg SQ – Ankylosing Spondylitis',
      payer: 'MEDICARE',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 69-year-old male with ankylosing spondylitis. BASDAI score 6.4 indicating highly active disease. Has failed naproxen 500mg BID x 3 months and meloxicam 15mg daily x 4 months. HLA-B27 positive. MRI sacroiliac joints confirms Grade III sacroiliitis bilaterally. CRP elevated at 28 mg/L. No prior biologic therapy.',
      status: 'AI_REVIEW',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.85,
      aiRationale: JSON.stringify([
        'AS with BASDAI ≥4 meets ASAS criteria for biologic initiation',
        'Two documented NSAID failures (naproxen and meloxicam) per ACR guidelines',
        'Elevated CRP (28 mg/L) and MRI-confirmed sacroiliitis provide objective disease burden evidence',
        'No prior biologic exposure – appropriate first-line biologic choice',
      ]),
      aiDocGaps: JSON.stringify([
        'Include TB test (IGRA or TST) result – required before TNF inhibitor initiation',
        'Document negative hepatitis B screening',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'M48.08', description: 'Spinal stenosis, sacral and sacrococcygeal region' },
      ]),
      turnaroundEstimate: '3-5 business days',
      appealStrength: 'STRONG',
      aiSummary: 'Strong approval likelihood. Patient meets all clinical criteria for biologic initiation in AS. TB and hepatitis screening documentation is the only missing requirement.',
    },
    // --- 5 Medicaid Procedure PA Requests ---
    {
      patientName: 'Latoya Washington',
      patientDOB: '1989-05-22',
      patientMemberId: 'MCD-8823047',
      diagnosisCodes: 'M51.16,M54.5',
      procedureCode: '27096',
      procedureDescription: 'Sacroiliac Joint Injection – Lumbar Radiculopathy',
      payer: 'MEDICAID',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 37-year-old female with chronic low back pain and right-sided radiculopathy for 8 months. MRI lumbar spine shows L4-L5 disc herniation with moderate neural foraminal narrowing. Failed conservative management: PT x 8 weeks, NSAIDs (naproxen 500mg BID x 3 months), chiropractic care x 6 weeks. VAS pain score 8/10.',
      status: 'PENDING',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.78,
      aiRationale: JSON.stringify([
        'Documented chronic LBP >3 months with objective MRI findings',
        'Three failed conservative therapies (PT, NSAIDs, chiropractic) meets Medicaid LCD requirements',
        'VAS 8/10 documents severe functional impairment',
        'CPT 27096 is a covered procedure under Medicaid pain management benefit',
      ]),
      aiDocGaps: JSON.stringify([
        'Include PT discharge summary documenting functional outcomes',
        'Provide MRI report with radiologist signature',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'M54.4', description: 'Lumbago with sciatica – more specific than M54.5' },
      ]),
      turnaroundEstimate: '5-7 business days',
      appealStrength: 'STRONG',
      aiSummary: 'Likely approval with complete documentation. MRI objective findings plus three failed conservative therapies meet Medicaid criteria.',
    },
    {
      patientName: 'Carlos Mendoza-Rivera',
      patientDOB: '1975-12-08',
      patientMemberId: 'MCD-9047382',
      diagnosisCodes: 'K92.1,K57.30,K57.32',
      procedureCode: '45378',
      procedureDescription: 'Colonoscopy – GI Bleed Workup',
      payer: 'MEDICAID',
      urgency: 'URGENT',
      clinicalNotes: 'Patient is a 50-year-old male presenting with three-week history of bright red blood per rectum, >3 episodes per week. Hemoglobin dropped from 13.2 to 11.1 g/dL over 4 weeks. No prior colonoscopy. Family history of colon cancer (father, age 58). Digital rectal exam unremarkable.',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.96,
      aiRationale: JSON.stringify([
        'Acute GI bleed with documented hemoglobin decline is urgent medical indication',
        'Rectal bleeding for 3 weeks with 3+ episodes/week exceeds routine screening criteria',
        'Family history of colon cancer at age 58 increases risk classification',
        'CPT 45378 is covered under Medicaid for diagnostic colonoscopy',
      ]),
      aiDocGaps: JSON.stringify([]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'Z80.0', description: 'Family history of malignant neoplasm of digestive organs' },
      ]),
      turnaroundEstimate: '1-2 business days (urgent)',
      appealStrength: 'STRONG',
      aiSummary: 'Highly likely approval. Active GI bleed with documented anemia and family cancer history creates clear urgent medical necessity.',
    },
    {
      patientName: 'Amara Diallo',
      patientDOB: '2018-08-14',
      patientMemberId: 'MCD-7736201',
      diagnosisCodes: 'J45.51,J45.50',
      procedureCode: '94640',
      procedureDescription: 'Nebulizer Treatment – Pediatric Severe Asthma Exacerbation',
      payer: 'MEDICAID',
      urgency: 'EMERGENT',
      clinicalNotes: 'Patient is a 7-year-old female with severe persistent asthma presenting with acute exacerbation. O2 saturation 91% on room air, respiratory rate 38/min. Requiring nebulized albuterol q20 min x 3 doses in ED. Received 2 mg/kg oral prednisone. PEFR 45% predicted. Prior hospitalizations in 2023 and 2024.',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.98,
      aiRationale: JSON.stringify([
        'Emergent asthma exacerbation with O2 sat 91% is life-threatening emergency',
        'PEFR 45% predicted indicates severe obstruction requiring immediate bronchodilator therapy',
        'Pediatric CHIP/Medicaid covers emergency respiratory treatments without PA in most states',
        'Prior hospitalizations document severe persistent asthma phenotype',
      ]),
      aiDocGaps: JSON.stringify([]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'J45.901', description: 'Unspecified asthma with acute exacerbation' },
      ]),
      turnaroundEstimate: 'Emergent – concurrent/retrospective',
      appealStrength: 'STRONG',
      aiSummary: 'Emergent authorization. Life-threatening asthma exacerbation in a child with prior hospitalizations.',
    },
    {
      patientName: 'Destiny Flowers',
      patientDOB: '1998-03-27',
      patientMemberId: 'MCD-6628194',
      diagnosisCodes: 'N83.201,N94.5,N94.89',
      procedureCode: '58661',
      procedureDescription: 'Laparoscopic Salpingo-oophorectomy – Endometriosis/Ovarian Cyst',
      payer: 'MEDICAID',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 28-year-old female with 3-year history of chronic pelvic pain and dysmenorrhea. Pelvic ultrasound confirms bilateral ovarian cysts (left 5.2cm, right 3.8cm) with internal echogenicity suggestive of endometriomas. Failed hormonal therapy (OCP x 12 months, progesterone IUD x 6 months) and NSAIDs.',
      status: 'PENDING',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.82,
      aiRationale: JSON.stringify([
        'Ovarian cysts >5cm with endometrioma characteristics meet surgical criteria',
        'Documented failure of 18 months of hormonal therapy (two agents)',
        'Chronic pelvic pain affecting quality of life with objective imaging findings',
        'CPT 58661 covered under Medicaid for medically necessary pelvic pathology',
      ]),
      aiDocGaps: JSON.stringify([
        'Include pelvic ultrasound report with measurements and characteristics',
        'Provide OB/GYN clinical notes documenting hormone therapy trial and response',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'N80.1', description: 'Endometriosis of ovary – if confirmed diagnosis' },
        { code: 'R10.2', description: 'Pelvic and perineal pain' },
      ]),
      turnaroundEstimate: '5-10 business days',
      appealStrength: 'STRONG',
      aiSummary: 'Good approval likelihood. Two-agent hormonal therapy failure plus objective imaging findings support medical necessity.',
    },
    {
      patientName: 'Jerome Patterson',
      patientDOB: '1981-10-15',
      patientMemberId: 'MCD-5519283',
      diagnosisCodes: 'M17.11,M17.12',
      procedureCode: '27447',
      procedureDescription: 'Total Knee Arthroplasty (Bilateral) – Severe Osteoarthritis',
      payer: 'MEDICAID',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 44-year-old male with bilateral severe osteoarthritis of the knees. Kellgren-Lawrence Grade IV on X-ray bilaterally. BMI 41.3. Failed conservative management: PT x 12 weeks (two separate episodes), NSAIDs for 6 months, intra-articular corticosteroid injections x 3 bilateral, viscosupplementation x 2. Unable to walk >100 feet without assistive device. Pain score 9/10.',
      status: 'DENIED',
      aiVerdict: 'LIKELY_DENIED',
      aiConfidence: 0.68,
      aiRationale: JSON.stringify([
        'Age 44 may trigger Medicaid scrutiny for bilateral TKA – implant longevity concerns',
        'BMI 41.3 is a relative contraindication; many Medicaid plans require BMI <40 for TKA approval',
        'Conservative therapy failure is documented (PT x2, injections, viscosupplementation)',
        'KL Grade IV confirms end-stage OA bilaterally',
      ]),
      aiDocGaps: JSON.stringify([
        'Obtain bariatric/weight management consultation note recommending TKA despite BMI',
        'Provide functional assessment by PT or occupational therapist',
        'Request orthopedic surgeon letter justifying bilateral vs. staged approach',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'E66.01', description: 'Morbid obesity – must be documented to address BMI concern proactively' },
      ]),
      turnaroundEstimate: '10-14 business days',
      appealStrength: 'MODERATE',
      aiSummary: 'Likely denial due to BMI and young age for bilateral TKA. Weight management consultation will be critical for appeal.',
    },
    // --- 4 DME Requests ---
    {
      patientName: 'Evelyn Marchetti',
      patientDOB: '1941-06-12',
      patientMemberId: 'MCR-6702918',
      diagnosisCodes: 'G35,G81.10',
      procedureCode: 'E1161',
      procedureDescription: 'Power Wheelchair (Group 3) – Multiple Sclerosis with Hemiplegia',
      payer: 'MEDICARE',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is an 84-year-old female with MS and right-sided hemiplegia. Unable to self-propel manual wheelchair due to upper extremity weakness (strength 2/5 bilateral upper extremities). Home is accessible. Evaluated by PT – recommends Group 3 power wheelchair for independent mobility. Functional Mobility Scale score 2.',
      status: 'PENDING',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.87,
      aiRationale: JSON.stringify([
        'Upper extremity weakness (2/5) documents inability to self-propel manual wheelchair',
        'PT evaluation recommending Group 3 PWC meets CMS LCD L33702 requirements',
        'Home accessibility documented by PT as required for benefit coverage',
      ]),
      aiDocGaps: JSON.stringify([
        'Include face-to-face examination note from physician within 45 days (CMS requirement)',
        'Provide PT ATP (Assistive Technology Professional) evaluation report',
        'Obtain certificate of medical necessity (CMN) form 10.02B',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'G81.14', description: 'Flaccid hemiplegia affecting dominant side – more specific' },
      ]),
      turnaroundEstimate: '5-7 business days',
      appealStrength: 'STRONG',
      aiSummary: 'Strong approval likelihood. Clinical criteria for Group 3 power wheelchair are met. Key requirement is the face-to-face physician examination note within required timeframes.',
    },
    {
      patientName: 'Bernard Kowalski',
      patientDOB: '1950-04-03',
      patientMemberId: 'MCR-7814029',
      diagnosisCodes: 'G47.33,J96.11',
      procedureCode: 'E0601',
      procedureDescription: 'CPAP Machine – Severe Obstructive Sleep Apnea',
      payer: 'MEDICARE',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 76-year-old male with moderate-to-severe OSA confirmed by overnight polysomnography (AHI 42.7 events/hour, O2 nadir 81%). Reports excessive daytime somnolence (Epworth score 18/24), witnessed apneas per spouse, and morning headaches. BMI 38.6. Treated with CPAP E0601 machine, prescribed at 10 cmH2O.',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.93,
      aiRationale: JSON.stringify([
        'AHI 42.7 documents severe OSA exceeding CMS threshold of AHI ≥15 for CPAP coverage',
        'O2 nadir 81% confirms significant hypoxemia supporting medical necessity',
        'PSG performed in accredited sleep lab meets CMS documentation requirement',
        'E0601 CPAP covered under Medicare Part B DME benefit',
      ]),
      aiDocGaps: JSON.stringify([
        'Note: CPAP coverage requires 90-day compliance check (4+ hours/night, 70% of nights)',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'R06.81', description: 'Apnea – captures symptom burden' },
      ]),
      turnaroundEstimate: '3-5 business days',
      appealStrength: 'STRONG',
      aiSummary: 'Highly likely approval. AHI 42.7 with objective PSG documentation exceeds CMS criteria.',
    },
    {
      patientName: 'Gloria Sunshine',
      patientDOB: '1960-08-17',
      patientMemberId: 'MCD-4410738',
      diagnosisCodes: 'E11.51,E11.641',
      procedureCode: 'A9274',
      procedureDescription: 'Continuous Glucose Monitor (CGM) – Insulin-Dependent Type 2 Diabetes',
      payer: 'MEDICAID',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 65-year-old female with Type 2 DM on basal-bolus insulin (glargine 40 units qHS, aspart sliding scale TID). HbA1c 10.1% with frequent hypoglycemia events (documented 4 events in past 2 months, one requiring glucagon). Unable to perform fingerstick BG checks due to neuropathy in hands.',
      status: 'PENDING',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.81,
      aiRationale: JSON.stringify([
        'Insulin-dependent T2DM with documented hypoglycemia events meets CGM medical necessity',
        'HbA1c 10.1% demonstrates inadequate control requiring intensive glucose monitoring',
        'Peripheral neuropathy affecting fingerstick ability is a strong qualifying factor',
      ]),
      aiDocGaps: JSON.stringify([
        'Provide endocrinology note documenting 4 hypoglycemia episodes with dates',
        'Include neuropathy examination findings to document fingerstick limitation',
        'Confirm state Medicaid plan covers A9274 (coverage varies by state)',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'E11.649', description: 'T2DM with hypoglycemia without coma – key qualifying diagnosis' },
        { code: 'E11.40', description: 'T2DM with diabetic neuropathy' },
      ]),
      turnaroundEstimate: '5-7 business days',
      appealStrength: 'STRONG',
      aiSummary: 'Good approval likelihood. Insulin-dependent T2DM with documented hypoglycemia and neuropathy affecting monitoring capability.',
    },
    {
      patientName: 'Winston Abrams',
      patientDOB: '1938-01-29',
      patientMemberId: 'MCR-8923041',
      diagnosisCodes: 'J44.1,J96.00',
      procedureCode: 'E1390',
      procedureDescription: 'Home Oxygen Concentrator – Severe COPD',
      payer: 'MEDICARE',
      urgency: 'URGENT',
      clinicalNotes: 'Patient is an 88-year-old male with severe COPD (GOLD Stage IV). O2 saturation 86% at rest on room air obtained during recent office visit. ABG shows PaO2 52 mmHg. 50 pack-year smoking history, quit 2019. FEV1 28% predicted. Recent COPD exacerbation requiring hospitalization (March 2025). Pulmonologist requesting home oxygen at 2 LPM continuous.',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.97,
      aiRationale: JSON.stringify([
        'O2 saturation 86% at rest exceeds CMS threshold of ≤88% for home oxygen coverage',
        'PaO2 52 mmHg on ABG meets Medicare LCD L33797 criterion of PaO2 ≤55 mmHg',
        'GOLD Stage IV COPD with FEV1 28% documents severe obstructive disease',
        'E1390 home oxygen concentrator covered under Medicare DME benefit',
      ]),
      aiDocGaps: JSON.stringify([
        'Ensure CMN form 484.03 is completed by ordering physician',
        'Document O2 saturation was obtained at rest (not during exercise) per LCD requirement',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'Z87.891', description: 'Personal history of nicotine dependence' },
      ]),
      turnaroundEstimate: '1-3 business days (urgent)',
      appealStrength: 'STRONG',
      aiSummary: 'Near-certain approval. Both O2 saturation (86%) and PaO2 (52 mmHg) clearly meet CMS LCD thresholds.',
    },
    // --- 3 Behavioral Health ---
    {
      patientName: 'Tiffany Bloom',
      patientDOB: '1994-11-03',
      patientMemberId: 'MCD-3318472',
      diagnosisCodes: 'F31.10,F31.12',
      procedureCode: '90837',
      procedureDescription: 'Psychotherapy 60-min (weekly) – Bipolar I Disorder',
      payer: 'MEDICAID',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 31-year-old female with Bipolar I disorder, currently in a depressive episode (PHQ-9 score 19, severe). Hospitalized for mania January 2025 (7 days inpatient). Stable on lithium 900mg BID and quetiapine 200mg qHS since February 2025. Requesting weekly individual psychotherapy (CBT-based) for mood stabilization and relapse prevention. GAF score 52.',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.91,
      aiRationale: JSON.stringify([
        'Bipolar I with recent hospitalization (January 2025) documents high-risk mental health status',
        'PHQ-9 of 19 confirms severe current depressive episode requiring intensive treatment',
        'GAF 52 documents serious functional impairment meeting Medicaid medical necessity',
        'CPT 90837 is covered under Medicaid mental health parity laws (federal mandate)',
      ]),
      aiDocGaps: JSON.stringify([
        'Include psychiatric evaluation note documenting GAF score and current mental status',
        'Provide treatment plan with goals and expected duration',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'Z86.59', description: 'Personal history of other mental and behavioral disorders' },
      ]),
      turnaroundEstimate: '3-5 business days',
      appealStrength: 'STRONG',
      aiSummary: 'High approval likelihood. Recent psychiatric hospitalization, severe PHQ-9, and bipolar diagnosis create clear medical necessity under mental health parity.',
    },
    {
      patientName: 'Andre Thompson',
      patientDOB: '1987-07-19',
      patientMemberId: 'MCD-2247139',
      diagnosisCodes: 'F33.2,F41.1',
      procedureCode: '90853',
      procedureDescription: 'Group Therapy (3x/week) – Major Depression with Anxiety',
      payer: 'MEDICAID',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 38-year-old male with severe MDD and comorbid GAD. Currently on escitalopram 20mg daily and bupropion XL 300mg (partial response – PHQ-9 14, GAD-7 12). Unemployed due to psychiatric disability. Requesting intensive outpatient group therapy 3x/week as step-down from recent partial hospitalization program (PHP completed April 2025).',
      status: 'AI_REVIEW',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.83,
      aiRationale: JSON.stringify([
        'Step-down from PHP to IOP is clinically appropriate and typically approved',
        'PHQ-9 14 and GAD-7 12 document moderate-to-severe ongoing symptoms',
        'CPT 90853 group therapy covered under Medicaid behavioral health benefit',
      ]),
      aiDocGaps: JSON.stringify([
        'Provide PHP discharge summary documenting clinical justification for step-down',
        'Include treatment plan for IOP with measurable goals and expected duration',
        'Obtain level-of-care assessment using ASAM or LOCUS criteria',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'Z56.0', description: 'Unemployment, unspecified – functional context' },
      ]),
      turnaroundEstimate: '3-5 business days',
      appealStrength: 'STRONG',
      aiSummary: 'Good approval likelihood. PHP-to-IOP step-down with ongoing moderate-to-severe symptoms is a well-supported clinical pathway.',
    },
    {
      patientName: 'Rachel Kim',
      patientDOB: '2002-09-11',
      patientMemberId: 'MCD-1138027',
      diagnosisCodes: 'F50.01,F32.2',
      procedureCode: '99213',
      procedureDescription: 'Office Visit + Medication Management – Anorexia Nervosa',
      payer: 'MEDICAID',
      urgency: 'URGENT',
      clinicalNotes: 'Patient is a 23-year-old female with Anorexia Nervosa, restricting type. Current BMI 15.8. Bradycardia HR 48 bpm. Hypokalemia K+ 3.1 mEq/L. Has refused inpatient treatment. Outpatient psychiatry requests intensive monitoring with weekly office visits, medication management (olanzapine 2.5mg), and weekly lab monitoring. Dietitian and therapist involved in care.',
      status: 'PENDING',
      aiVerdict: 'NEEDS_MORE_INFO',
      aiConfidence: 0.55,
      aiRationale: JSON.stringify([
        'BMI 15.8 with bradycardia and hypokalemia indicates medically unstable anorexia',
        'Medicaid may require higher level of care (residential or partial) at this severity',
        'Patient refusal of inpatient must be documented to justify outpatient approach',
        'Multidisciplinary care (psychiatry, dietitian, therapy) strengthens outpatient case',
      ]),
      aiDocGaps: JSON.stringify([
        'Provide documented patient refusal of inpatient treatment and capacity assessment',
        'Include safety plan and contingency criteria for escalation to higher level of care',
        'Obtain cardiology clearance for cardiac monitoring given bradycardia',
        'Consider upgrading CPT to 99215 (high complexity) or 90792 (psychiatric evaluation)',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'E41', description: 'Nutritional marasmus – captures severity of nutritional compromise' },
        { code: 'R00.1', description: 'Bradycardia – documents cardiac complication' },
        { code: 'E87.6', description: 'Hypokalemia – documents electrolyte complication' },
      ]),
      turnaroundEstimate: '5-10 business days',
      appealStrength: 'WEAK',
      aiSummary: 'Uncertain outcome. At BMI 15.8 with active cardiac compromise, Medicaid may require inpatient authorization. Patient refusal documentation is critical.',
    },
    // --- 3 Imaging/Diagnostics ---
    {
      patientName: 'Michael Torres',
      patientDOB: '1966-05-30',
      patientMemberId: 'MCR-9102847',
      diagnosisCodes: 'G89.29,M51.06',
      procedureCode: '72148',
      procedureDescription: 'MRI Lumbar Spine without Contrast – Chronic Back Pain',
      payer: 'MEDICARE',
      urgency: 'ROUTINE',
      clinicalNotes: 'Patient is a 59-year-old male with 6-month history of chronic low back pain with left-sided sciatica. Symptoms unresponsive to 6 weeks of physical therapy and NSAIDs. Pain is 7/10, radiating to left posterior thigh and calf. Positive straight leg raise at 45 degrees. No red flags (no bowel/bladder dysfunction, fever, weight loss).',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.88,
      aiRationale: JSON.stringify([
        'Six weeks of conservative therapy failure meets CMS LCD imaging criteria',
        'Positive SLR at 45 degrees is objective neurological finding supporting radiculopathy',
        'Left-sided sciatica with dermatomal radiation documents neurological involvement',
        'CPT 72148 covered under Medicare Part B diagnostic imaging benefit',
      ]),
      aiDocGaps: JSON.stringify([
        'Confirm PT notes are available documenting 6-week failed conservative trial',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'M54.42', description: 'Lumbago with sciatica, left side – more specific than M54.5' },
        { code: 'G54.4', description: 'Lumbosacral root disorders – documents nerve root involvement' },
      ]),
      turnaroundEstimate: '3-5 business days',
      appealStrength: 'STRONG',
      aiSummary: 'High approval likelihood. Failed conservative therapy plus objective neurological findings meet CMS criteria for lumbar MRI coverage.',
    },
    {
      patientName: 'Patricia Osei',
      patientDOB: '1958-02-14',
      patientMemberId: 'MCD-0927384',
      diagnosisCodes: 'R91.8,C34.10',
      procedureCode: '71250',
      procedureDescription: 'CT Chest with Contrast – Lung Nodule Surveillance',
      payer: 'MEDICAID',
      urgency: 'URGENT',
      clinicalNotes: 'Patient is a 68-year-old female, former smoker (30 pack-years, quit 2020). Prior CT chest from January 2025 showed a 9mm right upper lobe pulmonary nodule with irregular margins. Fleischner Society guidelines recommend 3-month follow-up CT for high-risk patients with nodules 8-15mm. Pulmonologist requesting follow-up CT chest with contrast per Fleischner guidelines.',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.95,
      aiRationale: JSON.stringify([
        'Fleischner Society high-risk nodule guidelines for 9mm RUL nodule require 3-month follow-up CT',
        '30 pack-year smoking history makes this high-risk per Fleischner criteria',
        'Irregular margins on prior CT increase malignancy probability',
        'CT with contrast appropriate for characterizing vascular relationship of nodule',
      ]),
      aiDocGaps: JSON.stringify([]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'Z87.891', description: 'Personal history of nicotine dependence – strengthens high-risk status' },
        { code: 'D38.1', description: 'Neoplasm of uncertain behavior of trachea, bronchus and lung' },
      ]),
      turnaroundEstimate: '1-3 business days (urgent)',
      appealStrength: 'STRONG',
      aiSummary: 'Near-certain approval. Fleischner guideline-driven follow-up CT for high-risk patient with suspicious nodule characteristics.',
    },
    {
      patientName: 'David Reyes',
      patientDOB: '1972-03-08',
      patientMemberId: 'MCR-0083741',
      diagnosisCodes: 'I25.10,Z82.49',
      procedureCode: '78451',
      procedureDescription: 'Nuclear Stress Test (Myocardial Perfusion) – Coronary Artery Disease',
      payer: 'MEDICARE',
      urgency: 'URGENT',
      clinicalNotes: 'Patient is a 54-year-old male with known CAD (3-vessel disease, CABG 2021). Presenting with new onset exertional chest pain and dyspnea over 3 weeks. EKG shows new T-wave inversions in leads V3-V5. Troponin 0.04 (borderline). Unable to exercise (bilateral knee OA). Cardiologist requesting pharmacologic nuclear stress test. Family history of sudden cardiac death (brother, age 51).',
      status: 'APPROVED',
      aiVerdict: 'LIKELY_APPROVED',
      aiConfidence: 0.94,
      aiRationale: JSON.stringify([
        'Known CAD post-CABG with new exertional symptoms is urgent cardiac evaluation indication',
        'EKG changes (T-wave inversions V3-V5) document objective ischemic changes',
        'Pharmacologic stress test appropriate for patients unable to exercise (bilateral knee OA)',
        'CPT 78451 covered under Medicare Part B for diagnostic cardiac evaluation',
      ]),
      aiDocGaps: JSON.stringify([
        'Include serial troponin results to document ACS workup',
        'Provide copy of EKG showing T-wave inversions',
      ]),
      aiSuggestedCodes: JSON.stringify([
        { code: 'R07.9', description: 'Chest pain, unspecified – symptom documentation' },
        { code: 'Z95.1', description: 'Presence of aortocoronary bypass graft – prior CABG' },
      ]),
      turnaroundEstimate: '1-2 business days (urgent)',
      appealStrength: 'STRONG',
      aiSummary: 'High-confidence urgent approval. Known CAD post-CABG with new EKG changes and borderline troponin creates compelling cardiac emergency indication.',
    },
  ];

  for (const pa of paRequests) {
    const created = await prisma.pARequest.create({
      data: { ...pa, providerId: provider.id },
    });

    await prisma.auditEntry.create({
      data: {
        paRequestId: created.id,
        action: 'CREATED',
        performedBy: 'Dr. Sarah Chen',
        details: 'PA request submitted via intake form',
      },
    });

    if (!['DRAFT', 'PENDING'].includes(pa.status)) {
      await prisma.auditEntry.create({
        data: {
          paRequestId: created.id,
          action: 'AI_ANALYSIS_COMPLETE',
          performedBy: 'AI System',
          details: `Verdict: ${pa.aiVerdict}, Confidence: ${Math.round((pa.aiConfidence ?? 0) * 100)}%`,
        },
      });
    }

    if (['APPROVED', 'DENIED'].includes(pa.status)) {
      await prisma.auditEntry.create({
        data: {
          paRequestId: created.id,
          action: pa.status,
          performedBy: 'Payer System',
          details: pa.status === 'APPROVED' ? 'Authorization approved' : 'Authorization denied',
        },
      });
    }

    if (pa.status === 'DENIED') {
      await prisma.providerNote.create({
        data: {
          paRequestId: created.id,
          authorId: provider.id,
          content: 'Denial received. Reviewing AI appeal recommendations. Will coordinate with patient and specialist to gather additional documentation.',
        },
      });
    }
  }

  console.log(`\nSeeded ${paRequests.length} PA requests successfully.`);
  console.log('\nLogin credentials:');
  console.log('  Provider: provider@demo.com / demo');
  console.log('  Admin:    admin@demo.com / demo');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
