export interface CodeEntry {
  code: string;
  description: string;
  type: 'ICD10' | 'CPT' | 'NDC';
}

export const ICD10_CODES: CodeEntry[] = [
  // Musculoskeletal
  { code: 'M05.79', description: 'Rheumatoid arthritis with rheumatoid factor of multiple sites', type: 'ICD10' },
  { code: 'M05.20', description: 'Rheumatoid vasculitis, unspecified site', type: 'ICD10' },
  { code: 'M45.9', description: 'Ankylosing spondylitis of unspecified sites', type: 'ICD10' },
  { code: 'M45.2', description: 'Ankylosing spondylitis of cervical region', type: 'ICD10' },
  { code: 'M17.11', description: 'Primary osteoarthritis, right knee', type: 'ICD10' },
  { code: 'M17.12', description: 'Primary osteoarthritis, left knee', type: 'ICD10' },
  { code: 'M51.16', description: 'Intervertebral disc degeneration, lumbar region', type: 'ICD10' },
  { code: 'M54.5', description: 'Low back pain', type: 'ICD10' },
  { code: 'M54.42', description: 'Lumbago with sciatica, left side', type: 'ICD10' },
  { code: 'M54.41', description: 'Lumbago with sciatica, right side', type: 'ICD10' },
  { code: 'M79.3', description: 'Panniculitis, unspecified', type: 'ICD10' },
  { code: 'M62.512', description: 'Muscle wasting and atrophy, upper arm, bilateral', type: 'ICD10' },
  // Neurological
  { code: 'G35', description: 'Multiple sclerosis', type: 'ICD10' },
  { code: 'G81.10', description: 'Spastic hemiplegia affecting unspecified side', type: 'ICD10' },
  { code: 'G81.14', description: 'Flaccid hemiplegia affecting dominant side', type: 'ICD10' },
  { code: 'G47.33', description: 'Obstructive sleep apnea (adult)(pediatric)', type: 'ICD10' },
  { code: 'G89.29', description: 'Other chronic pain', type: 'ICD10' },
  { code: 'G54.4', description: 'Lumbosacral root disorders, not elsewhere classified', type: 'ICD10' },
  { code: 'G57.60', description: 'Lesion of plantar nerve, unspecified foot', type: 'ICD10' },
  // Cardiovascular
  { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', type: 'ICD10' },
  { code: 'I48.0', description: 'Paroxysmal atrial fibrillation', type: 'ICD10' },
  { code: 'I50.9', description: 'Heart failure, unspecified', type: 'ICD10' },
  { code: 'I10', description: 'Essential (primary) hypertension', type: 'ICD10' },
  { code: 'R07.9', description: 'Chest pain, unspecified', type: 'ICD10' },
  { code: 'Z95.1', description: 'Presence of aortocoronary bypass graft', type: 'ICD10' },
  // Oncology
  { code: 'C61', description: 'Malignant neoplasm of prostate', type: 'ICD10' },
  { code: 'C34.10', description: 'Malignant neoplasm of upper lobe, bronchus or lung, unspecified side', type: 'ICD10' },
  { code: 'C34.11', description: 'Malignant neoplasm of upper lobe, right bronchus or lung', type: 'ICD10' },
  { code: 'C79.51', description: 'Secondary malignant neoplasm of bone', type: 'ICD10' },
  { code: 'C50.911', description: 'Malignant neoplasm of unspecified site of right female breast', type: 'ICD10' },
  { code: 'R91.8', description: 'Other nonspecific findings on diagnostic imaging of lung', type: 'ICD10' },
  // Endocrine/Metabolic
  { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', type: 'ICD10' },
  { code: 'E11.638', description: 'Type 2 diabetes mellitus with other diabetic arthropathy', type: 'ICD10' },
  { code: 'E11.51', description: 'Type 2 diabetes mellitus with diabetic peripheral angiopathy', type: 'ICD10' },
  { code: 'E11.641', description: 'Type 2 diabetes mellitus with hypoglycemia with coma', type: 'ICD10' },
  { code: 'E11.649', description: 'Type 2 diabetes mellitus with hypoglycemia without coma', type: 'ICD10' },
  { code: 'E11.40', description: 'Type 2 diabetes mellitus with diabetic neuropathy, unspecified', type: 'ICD10' },
  { code: 'E66.09', description: 'Other obesity due to excess calories', type: 'ICD10' },
  { code: 'E66.01', description: 'Morbid (severe) obesity due to excess calories', type: 'ICD10' },
  { code: 'E87.6', description: 'Hypokalemia', type: 'ICD10' },
  // Respiratory
  { code: 'J44.1', description: 'Chronic obstructive pulmonary disease with (acute) exacerbation', type: 'ICD10' },
  { code: 'J45.51', description: 'Severe persistent asthma with (acute) exacerbation', type: 'ICD10' },
  { code: 'J45.50', description: 'Severe persistent asthma, uncomplicated', type: 'ICD10' },
  { code: 'J96.11', description: 'Chronic respiratory failure with hypoxia', type: 'ICD10' },
  { code: 'J96.00', description: 'Acute respiratory failure, unspecified whether with hypoxia or hypercapnia', type: 'ICD10' },
  { code: 'J98.01', description: 'Acute bronchospasm', type: 'ICD10' },
  // GI
  { code: 'K92.1', description: 'Melena', type: 'ICD10' },
  { code: 'K57.30', description: 'Diverticulosis of large intestine without perforation or abscess', type: 'ICD10' },
  { code: 'K57.32', description: 'Diverticulitis of large intestine without perforation or abscess', type: 'ICD10' },
  { code: 'K21.0', description: 'Gastro-esophageal reflux disease with esophagitis', type: 'ICD10' },
  // GYN/Urology
  { code: 'N83.201', description: 'Unspecified ovarian cyst, bilateral', type: 'ICD10' },
  { code: 'N94.5', description: 'Secondary dysmenorrhoea', type: 'ICD10' },
  { code: 'N94.89', description: 'Other specified conditions associated with female genital organs', type: 'ICD10' },
  { code: 'N80.1', description: 'Endometriosis of ovary', type: 'ICD10' },
  { code: 'R10.2', description: 'Pelvic and perineal pain', type: 'ICD10' },
  { code: 'C79.89', description: 'Secondary malignant neoplasm of other specified sites', type: 'ICD10' },
  // Mental Health
  { code: 'F31.10', description: 'Bipolar disorder, current episode manic without psychotic features', type: 'ICD10' },
  { code: 'F31.12', description: 'Bipolar disorder, current episode manic, severe, without psychotic features', type: 'ICD10' },
  { code: 'F33.2', description: 'Major depressive disorder, recurrent severe without psychotic features', type: 'ICD10' },
  { code: 'F41.1', description: 'Generalized anxiety disorder', type: 'ICD10' },
  { code: 'F50.01', description: 'Anorexia nervosa, restricting type', type: 'ICD10' },
  { code: 'F32.2', description: 'Major depressive disorder, single episode, severe without psychotic features', type: 'ICD10' },
  { code: 'F10.20', description: 'Alcohol dependence, uncomplicated', type: 'ICD10' },
  { code: 'F11.20', description: 'Opioid dependence, uncomplicated', type: 'ICD10' },
  { code: 'F20.9', description: 'Schizophrenia, unspecified', type: 'ICD10' },
  // History/Z-codes
  { code: 'Z79.818', description: 'Long-term (current) use of other agents affecting estrogen receptors', type: 'ICD10' },
  { code: 'Z82.49', description: 'Family history of ischemic heart disease and other diseases of the circulatory system', type: 'ICD10' },
  { code: 'Z80.0', description: 'Family history of malignant neoplasm of digestive organs', type: 'ICD10' },
  { code: 'Z87.891', description: 'Personal history of nicotine dependence', type: 'ICD10' },
  { code: 'Z86.59', description: 'Personal history of other mental and behavioral disorders', type: 'ICD10' },
  { code: 'Z85.46', description: 'Personal history of malignant neoplasm of prostate', type: 'ICD10' },
  { code: 'Z56.0', description: 'Unemployment, unspecified', type: 'ICD10' },
  { code: 'Z96.641', description: 'Presence of right artificial knee joint', type: 'ICD10' },
  // Additional common codes
  { code: 'E41', description: 'Nutritional marasmus', type: 'ICD10' },
  { code: 'R00.1', description: 'Bradycardia, unspecified', type: 'ICD10' },
  { code: 'D38.1', description: 'Neoplasm of uncertain or unknown behavior of trachea, bronchus and lung', type: 'ICD10' },
  { code: 'M48.08', description: 'Spinal stenosis, sacral and sacrococcygeal region', type: 'ICD10' },
  { code: 'M46.98', description: 'Inflammatory spondylopathy, sacral region', type: 'ICD10' },
  { code: 'M51.06', description: 'Intervertebral disc degeneration, lumbar region', type: 'ICD10' },
  { code: 'I24.0', description: 'Acute coronary thrombosis not resulting in myocardial infarction', type: 'ICD10' },
  { code: 'Z87.39', description: 'Personal history of other musculoskeletal disorders', type: 'ICD10' },
  { code: 'M05.611', description: 'Rheumatoid arthritis of right knee with involvement of other organs', type: 'ICD10' },
  { code: 'G35.1', description: 'Relapsing-remitting multiple sclerosis course specifier', type: 'ICD10' },
];

export const CPT_CODES: CodeEntry[] = [
  // Infusion/Drug Administration
  { code: 'J0129', description: 'Abatacept (Orencia) injection, 10 mg', type: 'CPT' },
  { code: 'J9217', description: 'Leuprolide acetate (for depot suspension), 7.5 mg', type: 'CPT' },
  { code: 'J3490', description: 'Unclassified drugs (Semaglutide/Ozempic)', type: 'CPT' },
  { code: 'J2323', description: 'Natalizumab (Tysabri), 1 mg', type: 'CPT' },
  { code: 'J0717', description: 'Certolizumab pegol (Cimzia) injection, 1 mg', type: 'CPT' },
  // Surgery
  { code: '27447', description: 'Arthroplasty, knee, condyle and plateau; medial and lateral compartments', type: 'CPT' },
  { code: '27096', description: 'Injection procedure for sacroiliac joint, anesthetic/steroid', type: 'CPT' },
  { code: '58661', description: 'Laparoscopy, surgical; with removal of adnexal structures', type: 'CPT' },
  { code: '23472', description: 'Arthroplasty, glenohumeral joint; total shoulder', type: 'CPT' },
  { code: '29827', description: 'Arthroscopy, shoulder, surgical; with rotator cuff repair', type: 'CPT' },
  { code: '43239', description: 'Esophagogastroduodenoscopy, flexible; with biopsy', type: 'CPT' },
  { code: '45378', description: 'Colonoscopy, flexible; diagnostic', type: 'CPT' },
  { code: '66984', description: 'Extracapsular cataract removal with insertion of intraocular lens prosthesis', type: 'CPT' },
  // Pulmonary
  { code: '94640', description: 'Pressurized or non-pressurized inhalation treatment for acute airway obstruction', type: 'CPT' },
  { code: '94760', description: 'Noninvasive ear or pulse oximetry for oxygen saturation; single determination', type: 'CPT' },
  // DME
  { code: 'E1161', description: 'Manual adult size wheelchair, includes tilt-in-space', type: 'CPT' },
  { code: 'E0601', description: 'Continuous airway pressure (CPAP) device', type: 'CPT' },
  { code: 'A9274', description: 'External ambulatory insulin delivery system, disposable, each', type: 'CPT' },
  { code: 'E1390', description: 'Oxygen concentrator, single delivery port', type: 'CPT' },
  { code: 'E0260', description: 'Hospital bed, semi-electric', type: 'CPT' },
  { code: 'K0856', description: 'Power operated vehicle, group 3 heavy duty, patient weight capacity >450 lbs', type: 'CPT' },
  // Imaging
  { code: '72148', description: 'MRI, lumbar spine; without contrast material(s)', type: 'CPT' },
  { code: '71250', description: 'Computed tomography, thorax; with contrast material(s)', type: 'CPT' },
  { code: '78451', description: 'Myocardial perfusion imaging, tomographic (SPECT)', type: 'CPT' },
  { code: '70553', description: 'MRI brain with and without contrast', type: 'CPT' },
  { code: '74183', description: 'MRI abdomen with and without contrast', type: 'CPT' },
  { code: '72197', description: 'MRI pelvis with and without contrast', type: 'CPT' },
  { code: '70470', description: 'CT head/brain with and without contrast', type: 'CPT' },
  // E&M
  { code: '99213', description: 'Office visit, established patient, low complexity', type: 'CPT' },
  { code: '99214', description: 'Office visit, established patient, moderate complexity', type: 'CPT' },
  { code: '99215', description: 'Office visit, established patient, high complexity', type: 'CPT' },
  { code: '99232', description: 'Subsequent hospital care, moderate complexity', type: 'CPT' },
  // Mental Health
  { code: '90837', description: 'Psychotherapy, 60 minutes with patient', type: 'CPT' },
  { code: '90853', description: 'Group psychotherapy (other than of a multiple-family group)', type: 'CPT' },
  { code: '90792', description: 'Psychiatric diagnostic evaluation with medical services', type: 'CPT' },
  { code: '90847', description: 'Family psychotherapy (conjoint psychotherapy)', type: 'CPT' },
  // Cardiology
  { code: '93306', description: 'Echocardiography, transthoracic, with spectral Doppler', type: 'CPT' },
  { code: '93016', description: 'Cardiovascular stress test using maximal or submaximal treadmill', type: 'CPT' },
  // PT/OT
  { code: '97110', description: 'Therapeutic exercises, each 15 minutes', type: 'CPT' },
  { code: '97530', description: 'Therapeutic activities, direct patient contact, 15 minutes', type: 'CPT' },
];

export const ALL_CODES = [...ICD10_CODES, ...CPT_CODES];

export function searchCodes(query: string, type?: 'ICD10' | 'CPT'): CodeEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return ALL_CODES
    .filter((entry) => {
      if (type && entry.type !== type) return false;
      return (
        entry.code.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q)
      );
    })
    .slice(0, 10);
}
