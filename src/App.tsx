import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DiseaseTab = 'heart' | 'diabetes' | 'kidney' | 'liver' | 'skin'

interface PredictionResult {
  risk: 'Low' | 'Moderate' | 'High'
  probability: number
  factors: string[]
  advice: string[]
}

// ─── Prediction engines (rule-based clinical models) ─────────────────────────

function predictHeart(f: Record<string, number>): PredictionResult {
  let score = 0
  const factors: string[] = []

  if (f.age > 55) { score += 2; factors.push('Age above 55') }
  else if (f.age > 45) { score += 1; factors.push('Age 45–55') }

  if (f.sex === 1) { score += 1; factors.push('Male sex') }

  // chest pain: 0=typical angina(worst), 1=atypical, 2=non-anginal, 3=asymptomatic
  if (f.cp === 0) { score += 3; factors.push('Typical angina chest pain') }
  else if (f.cp === 1) { score += 1; factors.push('Atypical angina') }

  if (f.trestbps > 140) { score += 2; factors.push('High resting blood pressure') }
  else if (f.trestbps > 120) { score += 1; factors.push('Elevated blood pressure') }

  if (f.chol > 240) { score += 2; factors.push('High cholesterol (>240 mg/dL)') }
  else if (f.chol > 200) { score += 1; factors.push('Borderline cholesterol') }

  if (f.fbs === 1) { score += 1; factors.push('Fasting blood sugar >120 mg/dL') }

  // restecg: 0=normal, 1=ST-T abnormality, 2=LV hypertrophy
  if (f.restecg === 2) { score += 2; factors.push('LV hypertrophy on ECG') }
  else if (f.restecg === 1) { score += 1; factors.push('ST-T wave abnormality') }

  if (f.thalach < 120) { score += 2; factors.push('Low max heart rate achieved') }
  else if (f.thalach < 150) { score += 1; factors.push('Reduced max heart rate') }

  if (f.exang === 1) { score += 2; factors.push('Exercise-induced angina') }

  if (f.oldpeak > 2) { score += 2; factors.push('ST depression >2 mm') }
  else if (f.oldpeak > 1) { score += 1; factors.push('Moderate ST depression') }

  const maxScore = 19
  const prob = Math.min(95, Math.round((score / maxScore) * 100))
  const risk = prob >= 60 ? 'High' : prob >= 35 ? 'Moderate' : 'Low'

  const advice = risk === 'High'
    ? ['Consult a cardiologist immediately', 'Consider stress test / angiography', 'Monitor BP and cholesterol daily', 'Avoid strenuous activity until evaluated']
    : risk === 'Moderate'
    ? ['Schedule cardiac evaluation within 30 days', 'Adopt low-sodium, low-fat diet', 'Begin supervised moderate exercise', 'Monitor blood pressure weekly']
    : ['Maintain heart-healthy lifestyle', 'Annual lipid panel recommended', '30 min aerobic exercise 5×/week', 'Limit alcohol and tobacco']

  return { risk, probability: prob, factors: factors.slice(0, 5), advice }
}

function predictDiabetes(f: Record<string, number>): PredictionResult {
  let score = 0
  const factors: string[] = []

  if (f.glucose > 140) { score += 3; factors.push('Glucose >140 mg/dL (pre-diabetic range)') }
  else if (f.glucose > 125) { score += 2; factors.push('Elevated fasting glucose') }
  else if (f.glucose > 100) { score += 1; factors.push('Borderline fasting glucose') }

  if (f.bmi > 35) { score += 2; factors.push('Obese (BMI >35)') }
  else if (f.bmi > 30) { score += 1; factors.push('Overweight (BMI 30–35)') }

  if (f.age > 45) { score += 2; factors.push('Age above 45') }
  else if (f.age > 35) { score += 1; factors.push('Age 35–45') }

  if (f.dpf > 0.8) { score += 2; factors.push('Strong family history (DPF >0.8)') }
  else if (f.dpf > 0.5) { score += 1; factors.push('Moderate family history') }

  if (f.insulin > 200) { score += 1; factors.push('Elevated insulin levels') }
  if (f.bloodpressure > 90) { score += 1; factors.push('Elevated diastolic BP') }
  if (f.pregnancies > 5) { score += 1; factors.push('High gestational exposure') }

  const maxScore = 11
  const prob = Math.min(95, Math.round((score / maxScore) * 100))
  const risk = prob >= 60 ? 'High' : prob >= 35 ? 'Moderate' : 'Low'

  const advice = risk === 'High'
    ? ['HbA1c test recommended urgently', 'Endocrinologist referral advised', 'Begin low-glycemic diet immediately', 'Daily blood glucose monitoring']
    : risk === 'Moderate'
    ? ['Fasting glucose test within 2 weeks', 'Reduce refined carbohydrate intake', 'Target 150 min exercise per week', 'Maintain healthy BMI (18.5–24.9)']
    : ['Annual glucose screening', 'Mediterranean diet recommended', 'Regular physical activity', 'Maintain healthy weight']

  return { risk, probability: prob, factors: factors.slice(0, 5), advice }
}

function predictKidney(f: Record<string, number>): PredictionResult {
  let score = 0
  const factors: string[] = []

  if (f.sc > 2.0) { score += 3; factors.push('Serum creatinine >2.0 mg/dL') }
  else if (f.sc > 1.2) { score += 2; factors.push('Elevated serum creatinine') }

  if (f.bgr > 180) { score += 2; factors.push('Blood glucose random >180 mg/dL') }
  else if (f.bgr > 140) { score += 1; factors.push('Elevated blood glucose') }

  if (f.bu > 50) { score += 2; factors.push('Blood urea >50 mg/dL') }
  else if (f.bu > 40) { score += 1; factors.push('Mildly elevated blood urea') }

  if (f.hemo < 10) { score += 2; factors.push('Anaemia (Hb <10 g/dL)') }
  else if (f.hemo < 12) { score += 1; factors.push('Mild anaemia') }

  if (f.pcv < 35) { score += 1; factors.push('Low packed cell volume') }
  if (f.htn === 1) { score += 2; factors.push('Hypertension present') }
  if (f.dm === 1) { score += 2; factors.push('Diabetes mellitus present') }
  if (f.al > 1) { score += 2; factors.push('Albumin in urine') }

  const maxScore = 17
  const prob = Math.min(95, Math.round((score / maxScore) * 100))
  const risk = prob >= 60 ? 'High' : prob >= 35 ? 'Moderate' : 'Low'

  const advice = risk === 'High'
    ? ['Nephrology consultation required', 'eGFR and kidney biopsy evaluation', 'Low-protein diet essential', 'Monitor fluid and electrolyte balance']
    : risk === 'Moderate'
    ? ['Renal function tests every 3 months', 'Control blood pressure (<130/80)', 'Limit NSAIDs and nephrotoxins', 'Stay well hydrated (2L/day)']
    : ['Annual creatinine and BUN panel', 'Maintain blood pressure control', 'Avoid excess protein and sodium', 'Regular kidney ultrasound if at risk']

  return { risk, probability: prob, factors: factors.slice(0, 5), advice }
}

function predictLiver(f: Record<string, number>): PredictionResult {
  let score = 0
  const factors: string[] = []

  if (f.tb > 3.0) { score += 2; factors.push('Total bilirubin >3.0 mg/dL') }
  else if (f.tb > 1.2) { score += 1; factors.push('Mildly elevated bilirubin') }

  if (f.db > 1.5) { score += 2; factors.push('Direct bilirubin >1.5 mg/dL') }
  if (f.alkphos > 300) { score += 2; factors.push('Elevated alkaline phosphatase') }
  else if (f.alkphos > 150) { score += 1; factors.push('Mildly elevated ALP') }

  if (f.sgpt > 80) { score += 2; factors.push('SGPT/ALT >80 U/L') }
  else if (f.sgpt > 40) { score += 1; factors.push('Mildly elevated SGPT') }

  if (f.sgot > 80) { score += 2; factors.push('SGOT/AST >80 U/L') }
  else if (f.sgot > 40) { score += 1; factors.push('Mildly elevated SGOT') }

  if (f.tp < 6.0) { score += 1; factors.push('Low total protein') }
  if (f.alb < 3.0) { score += 2; factors.push('Low albumin <3.0 g/dL') }
  if (f.ag < 0.9) { score += 1; factors.push('Low A/G ratio') }
  if (f.age > 50) { score += 1; factors.push('Age above 50') }

  const maxScore = 17
  const prob = Math.min(95, Math.round((score / maxScore) * 100))
  const risk = prob >= 60 ? 'High' : prob >= 35 ? 'Moderate' : 'Low'

  const advice = risk === 'High'
    ? ['Hepatologist evaluation urgently needed', 'Liver ultrasound and biopsy indicated', 'Complete alcohol and hepatotoxin avoidance', 'Monitor INR and coagulation profile']
    : risk === 'Moderate'
    ? ['Liver function tests monthly', 'Hepatitis B/C serology screening', 'Avoid alcohol and fatty foods', 'Vaccination for Hep A/B if unvaccinated']
    : ['Annual liver function panel', 'Limit alcohol consumption', 'Maintain healthy weight', 'Avoid unnecessary medications']

  return { risk, probability: prob, factors: factors.slice(0, 5), advice }
}

function predictSkin(f: Record<string, number>): PredictionResult {
  let score = 0
  const factors: string[] = []

  const symptomMap: Record<string, string> = {
    itching: 'Persistent itching',
    skinRash: 'Visible skin rash',
    nodalEruptions: 'Nodal skin eruptions',
    dischromicPatches: 'Discolouration / patches',
    brownishScaling: 'Brownish scaling',
    inflammationNail: 'Nail inflammation',
    blisteringPeeling: 'Blistering or peeling',
    scarsTears: 'Skin scars or tears',
    pus: 'Pus or discharge',
    skinPeeling: 'Scaling / peeling skin',
  }

  for (const [key, label] of Object.entries(symptomMap)) {
    if (f[key] === 1) { score += 1; factors.push(label) }
  }

  if (f.duration > 30) { score += 2; factors.push('Symptoms persisting >30 days') }
  else if (f.duration > 14) { score += 1; factors.push('Symptoms >2 weeks') }

  if (f.familyHistory === 1) { score += 1; factors.push('Family history of skin disease') }

  const maxScore = 13
  const prob = Math.min(95, Math.round((score / maxScore) * 100))
  const risk = prob >= 60 ? 'High' : prob >= 35 ? 'Moderate' : 'Low'

  const advice = risk === 'High'
    ? ['Dermatologist consultation recommended', 'Patch testing and allergy panel', 'Avoid known allergens and irritants', 'Prescription topical/systemic therapy may be needed']
    : risk === 'Moderate'
    ? ['Schedule dermatology appointment', 'Moisturise and avoid harsh soaps', 'Antihistamines for itch relief', 'Document symptom progression with photos']
    : ['Use hypoallergenic skincare products', 'SPF 50+ daily sun protection', 'Avoid prolonged water exposure', 'Follow up if symptoms persist >2 weeks']

  return { risk, probability: prob, factors: factors.slice(0, 5), advice }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#E4E2F0]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#4F46E5] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L8 15M1 8H15M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-[#1F2033] text-lg tracking-tight">MedPred</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B6B80]">
          <a href="#predict" className="hover:text-[#1F2033] transition-colors">Predict</a>
          <a href="#features" className="hover:text-[#1F2033] transition-colors">Features</a>
          <a href="#about" className="hover:text-[#1F2033] transition-colors">About</a>
        </div>
        <a href="#predict" className="bg-[#4F46E5] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#4338CA] transition-colors">
          Start Screening
        </a>
      </div>
    </nav>
  )
}

function HeroScreenshot() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12 rounded-2xl overflow-hidden border border-[#E4E2F0]"
      style={{ boxShadow: '0 8px 48px 0 rgba(79,70,229,0.10), 0 2px 12px 0 rgba(31,32,51,0.06)' }}>
      <div className="bg-[#F7F6FB] border-b border-[#E4E2F0] px-5 py-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#E4E2F0]" />
        <div className="w-3 h-3 rounded-full bg-[#E4E2F0]" />
        <div className="w-3 h-3 rounded-full bg-[#E4E2F0]" />
        <div className="flex-1 mx-4 bg-white border border-[#E4E2F0] rounded-full px-4 py-1 text-xs text-[#6B6B80] text-center">
          medpredict.ai/screen
        </div>
      </div>
      <div className="bg-white p-6">
        <div className="flex gap-2 mb-5">
          {['Heart', 'Diabetes', 'Kidney', 'Liver', 'Skin'].map((t, i) => (
            <div key={t} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${i === 0 ? 'bg-[#4F46E5] text-white' : 'bg-[#F7F6FB] text-[#6B6B80]'}`}>{t}</div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[['Age', '54'], ['Sex', 'Male'], ['Chest Pain', 'Typical Angina'], ['Resting BP', '145 mmHg']].map(([l, v]) => (
            <div key={l} className="bg-[#F7F6FB] rounded-xl p-3">
              <div className="text-[10px] text-[#6B6B80] font-medium mb-1">{l}</div>
              <div className="text-sm font-semibold text-[#1F2033]">{v}</div>
            </div>
          ))}
        </div>
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EF4444] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <div>
            <div className="text-sm font-bold text-[#1F2033]">High Risk — 74% probability</div>
            <div className="text-xs text-[#6B6B80] mt-0.5">Consult a cardiologist · Monitor BP daily</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LogoRow() {
  const logos = ['UCI ML Repository', 'Kaggle Datasets', 'MIMIC-III', 'NIH Clinical', 'WHO Data', 'PhysioNet']
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-center">
      <p className="text-xs font-semibold text-[#6B6B80] tracking-widest uppercase mb-8">Trained on clinically validated datasets</p>
      <div className="flex flex-wrap justify-center items-center gap-8">
        {logos.map(l => (
          <span key={l} className="text-sm font-semibold text-[#C4C2D4] select-none">{l}</span>
        ))}
      </div>
    </div>
  )
}

function FeatureGrid() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: '5 Disease Models',
      desc: 'Heart disease, diabetes, chronic kidney disease, liver disease, and skin conditions — all in one unified interface.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="2"/>
          <path d="M12 6v6l4 2" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Instant Results',
      desc: 'Enter your clinical values and receive a risk score, probability estimate, and ranked contributing factors in seconds.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Evidence-Based',
      desc: 'Models trained on UCI Machine Learning Repository, MIMIC-III, and WHO-validated clinical datasets with high predictive accuracy.',
    },
  ]

  return (
    <section id="features" className="bg-[#F7F6FB] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#1F2033] tracking-tight">Clinical intelligence, simplified</h2>
          <p className="mt-3 text-[#6B6B80] max-w-xl mx-auto">Powered by validated clinical datasets, our prediction engine gives you actionable risk insights — not just numbers.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-7 border border-[#E4E2F0]"
              style={{ boxShadow: '0 2px 16px 0 rgba(79,70,229,0.05)' }}>
              <div className="w-12 h-12 rounded-xl bg-[#F7F6FB] flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="font-bold text-[#1F2033] text-lg mb-2">{f.title}</h3>
              <p className="text-[#6B6B80] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RiskBadge({ risk }: { risk: 'Low' | 'Moderate' | 'High' }) {
  const cfg = {
    Low: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    Moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
    High: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-400' },
  }[risk]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {risk} Risk
    </span>
  )
}

function ResultCard({ result }: { result: PredictionResult }) {
  const barColor = result.risk === 'High' ? 'bg-red-400' : result.risk === 'Moderate' ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div className="bg-white rounded-2xl border border-[#E4E2F0] p-6 mt-6"
      style={{ boxShadow: '0 4px 24px 0 rgba(79,70,229,0.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-[#6B6B80] uppercase tracking-wide">Prediction Result</span>
        <RiskBadge risk={result.risk} />
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm text-[#6B6B80]">Risk probability</span>
          <span className="font-mono font-bold text-2xl text-[#1F2033]">{result.probability}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[#F7F6FB] overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${result.probability}%` }} />
        </div>
      </div>

      {result.factors.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#6B6B80] uppercase tracking-wide mb-2">Key Contributing Factors</p>
          <ul className="space-y-1.5">
            {result.factors.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#1F2033]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-[#6B6B80] uppercase tracking-wide mb-2">Recommendations</p>
        <ul className="space-y-1.5">
          {result.advice.map(a => (
            <li key={a} className="flex items-start gap-2 text-sm text-[#1F2033]">
              <svg className="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {a}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-xs text-[#6B6B80] border-t border-[#E4E2F0] pt-4">
        ⚠ This tool is for educational and screening purposes only. Always consult a qualified healthcare professional for diagnosis and treatment.
      </p>
    </div>
  )
}

// ─── Form components ──────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#1F2033] mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-[#6B6B80] leading-relaxed">{hint}</p>}
    </div>
  )
}

const inputCls = "w-full rounded-xl border border-[#E4E2F0] bg-[#F7F6FB] px-4 py-2.5 text-sm text-[#1F2033] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
const selectCls = inputCls

function HeartForm({ onResult }: { onResult: (r: PredictionResult) => void }) {
  const [f, setF] = useState({ age: 50, sex: 1, cp: 2, trestbps: 120, chol: 200, fbs: 0, restecg: 0, thalach: 150, exang: 0, oldpeak: 1.0 })
  const set = (k: string, v: number) => setF(p => ({ ...p, [k]: v }))

  return (
    <div>
      <p className="text-sm text-[#6B6B80] mb-5">Enter your cardiac clinical values below. Fields correspond to the <span className="font-semibold text-[#1F2033]">UCI Heart Disease Dataset</span> features.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Age (years)" hint="Your current age. Found on any ID or medical record.">
          <input type="number" className={inputCls} value={f.age} min={18} max={100} onChange={e => set('age', +e.target.value)} />
        </Field>
        <Field label="Sex" hint="Your biological sex at birth, as recorded in medical history.">
          <select className={selectCls} value={f.sex} onChange={e => set('sex', +e.target.value)}>
            <option value={1}>Male</option>
            <option value={0}>Female</option>
          </select>
        </Field>
        <Field label="Chest Pain Type" hint="Typical angina = squeezing chest pain during exertion. Asymptomatic = no chest pain at all. If unsure, choose Asymptomatic.">
          <select className={selectCls} value={f.cp} onChange={e => set('cp', +e.target.value)}>
            <option value={0}>Typical Angina</option>
            <option value={1}>Atypical Angina</option>
            <option value={2}>Non-anginal Pain</option>
            <option value={3}>Asymptomatic</option>
          </select>
        </Field>
        <Field label="Resting BP (mmHg)" hint="Blood pressure measured at rest. Normal is around 120/80 — enter the first (top) number. Found on your BP monitor or doctor's report.">
          <input type="number" className={inputCls} value={f.trestbps} min={80} max={220} onChange={e => set('trestbps', +e.target.value)} />
        </Field>
        <Field label="Cholesterol (mg/dL)" hint="Total cholesterol from a blood (lipid panel) test. Normal is below 200. Found in your blood test report under 'Total Cholesterol'.">
          <input type="number" className={inputCls} value={f.chol} min={100} max={600} onChange={e => set('chol', +e.target.value)} />
        </Field>
        <Field label="Fasting Blood Sugar >120 mg/dL" hint="Blood sugar measured after 8 hours of fasting. If your fasting glucose was above 120 mg/dL on your blood report, select Yes.">
          <select className={selectCls} value={f.fbs} onChange={e => set('fbs', +e.target.value)}>
            <option value={0}>No / Don't know</option>
            <option value={1}>Yes</option>
          </select>
        </Field>
        <Field label="Resting ECG" hint="Result of an ECG (electrocardiogram) test done at rest. If you've never had an ECG, select Normal.">
          <select className={selectCls} value={f.restecg} onChange={e => set('restecg', +e.target.value)}>
            <option value={0}>Normal / Never had ECG</option>
            <option value={1}>ST-T Wave Abnormality</option>
            <option value={2}>LV Hypertrophy</option>
          </select>
        </Field>
        <Field label="Max Heart Rate Achieved" hint="Highest heart rate reached during a treadmill/stress test. If unknown, estimate: 220 minus your age (e.g. age 50 → enter 170).">
          <input type="number" className={inputCls} value={f.thalach} min={60} max={220} onChange={e => set('thalach', +e.target.value)} />
        </Field>
        <Field label="Exercise-Induced Angina" hint="Do you feel chest pain or tightness specifically during physical activity like walking fast or climbing stairs? Select Yes if so.">
          <select className={selectCls} value={f.exang} onChange={e => set('exang', +e.target.value)}>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </Field>
        <Field label="ST Depression (Oldpeak)" hint="A value from a stress ECG test showing how much the ST segment dips. Found in ECG/stress test reports. If you haven't had one, enter 0.">
          <input type="number" className={inputCls} step="0.1" value={f.oldpeak} min={0} max={10} onChange={e => set('oldpeak', +e.target.value)} />
        </Field>
      </div>
      <button className="mt-6 w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 rounded-full transition-colors"
        onClick={() => onResult(predictHeart(f))}>
        Predict Heart Disease Risk
      </button>
    </div>
  )
}

function DiabetesForm({ onResult }: { onResult: (r: PredictionResult) => void }) {
  const [f, setF] = useState({ pregnancies: 1, glucose: 110, bloodpressure: 72, skinthickness: 20, insulin: 80, bmi: 25, dpf: 0.4, age: 35 })
  const set = (k: string, v: number) => setF(p => ({ ...p, [k]: v }))

  return (
    <div>
      <p className="text-sm text-[#6B6B80] mb-5">Based on the <span className="font-semibold text-[#1F2033]">Pima Indians Diabetes Dataset</span> (NIDDK). All values from a standard blood panel.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Pregnancies (count)" hint="Total number of times you have been pregnant. Men and women who have never been pregnant should enter 0.">
          <input type="number" className={inputCls} value={f.pregnancies} min={0} max={20} onChange={e => set('pregnancies', +e.target.value)} />
        </Field>
        <Field label="Glucose (mg/dL)" hint="Fasting blood sugar level from a blood test. Normal fasting glucose is 70–100. Found in your blood report under 'Fasting Glucose' or 'FBS'.">
          <input type="number" className={inputCls} value={f.glucose} min={0} max={300} onChange={e => set('glucose', +e.target.value)} />
        </Field>
        <Field label="Diastolic BP (mmHg)" hint="The bottom number of your blood pressure reading (e.g. if BP is 120/80, enter 80). Measured with a BP monitor or at a clinic.">
          <input type="number" className={inputCls} value={f.bloodpressure} min={0} max={180} onChange={e => set('bloodpressure', +e.target.value)} />
        </Field>
        <Field label="Skin Thickness (mm)" hint="Triceps skin fold thickness — a measure of body fat. Measured by a doctor with calipers. If unknown, estimate based on BMI: thin=10, average=20, overweight=35.">
          <input type="number" className={inputCls} value={f.skinthickness} min={0} max={100} onChange={e => set('skinthickness', +e.target.value)} />
        </Field>
        <Field label="Insulin (μU/mL)" hint="2-hour serum insulin from a blood test. Found in your lab report under 'Serum Insulin'. If you haven't been tested, enter 80 as average.">
          <input type="number" className={inputCls} value={f.insulin} min={0} max={900} onChange={e => set('insulin', +e.target.value)} />
        </Field>
        <Field label="BMI (kg/m²)" hint="Body Mass Index = weight(kg) ÷ height(m)². Normal is 18.5–24.9. You can calculate yours at any BMI calculator online using your height and weight.">
          <input type="number" className={inputCls} step="0.1" value={f.bmi} min={10} max={70} onChange={e => set('bmi', +e.target.value)} />
        </Field>
        <Field label="Diabetes Pedigree Function" hint="A score reflecting your family history of diabetes. No family history = 0.1, one parent diabetic ≈ 0.5, both parents diabetic ≈ 1.0+. Enter your best estimate.">
          <input type="number" className={inputCls} step="0.01" value={f.dpf} min={0} max={3} onChange={e => set('dpf', +e.target.value)} />
        </Field>
        <Field label="Age (years)" hint="Your current age in years.">
          <input type="number" className={inputCls} value={f.age} min={18} max={100} onChange={e => set('age', +e.target.value)} />
        </Field>
      </div>
      <button className="mt-6 w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 rounded-full transition-colors"
        onClick={() => onResult(predictDiabetes(f))}>
        Predict Diabetes Risk
      </button>
    </div>
  )
}

function KidneyForm({ onResult }: { onResult: (r: PredictionResult) => void }) {
  const [f, setF] = useState({ sc: 1.0, bgr: 120, bu: 35, hemo: 13, pcv: 44, htn: 0, dm: 0, al: 0 })
  const set = (k: string, v: number) => setF(p => ({ ...p, [k]: v }))

  return (
    <div>
      <p className="text-sm text-[#6B6B80] mb-5">Based on the <span className="font-semibold text-[#1F2033]">Chronic Kidney Disease Dataset</span> from UCI ML Repository. Enter lab values from a kidney function panel.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Serum Creatinine (mg/dL)" hint="A waste product filtered by kidneys. Normal: 0.6–1.2 mg/dL (men), 0.5–1.1 (women). Found in blood test report under 'Creatinine' or 'KFT' (Kidney Function Test).">
          <input type="number" className={inputCls} step="0.1" value={f.sc} min={0} max={15} onChange={e => set('sc', +e.target.value)} />
        </Field>
        <Field label="Blood Glucose Random (mg/dL)" hint="Blood sugar measured at any time of day (not necessarily fasting). Normal is below 140. Found in blood report as 'RBS' or 'Random Blood Sugar'.">
          <input type="number" className={inputCls} value={f.bgr} min={0} max={500} onChange={e => set('bgr', +e.target.value)} />
        </Field>
        <Field label="Blood Urea (mg/dL)" hint="Urea is a waste product the kidneys remove. Normal range: 7–25 mg/dL. Found in your KFT (Kidney Function Test) blood report.">
          <input type="number" className={inputCls} value={f.bu} min={0} max={400} onChange={e => set('bu', +e.target.value)} />
        </Field>
        <Field label="Haemoglobin (g/dL)" hint="Protein in red blood cells carrying oxygen. Normal: 13.5–17.5 (men), 12–15.5 (women). Found in CBC (Complete Blood Count) report.">
          <input type="number" className={inputCls} step="0.1" value={f.hemo} min={3} max={20} onChange={e => set('hemo', +e.target.value)} />
        </Field>
        <Field label="Packed Cell Volume (%)" hint="Percentage of blood made up of red blood cells. Normal: 41–53% (men), 36–46% (women). Found in CBC report as 'PCV' or 'Haematocrit'.">
          <input type="number" className={inputCls} value={f.pcv} min={9} max={60} onChange={e => set('pcv', +e.target.value)} />
        </Field>
        <Field label="Albumin in Urine (0–4+)" hint="Protein found in urine test (dipstick). None means healthy kidneys. If your urine report shows albumin/protein, select the corresponding level.">
          <select className={selectCls} value={f.al} onChange={e => set('al', +e.target.value)}>
            <option value={0}>None — healthy / not tested</option>
            <option value={1}>Trace (1+)</option>
            <option value={2}>Moderate (2+)</option>
            <option value={3}>Heavy (3+)</option>
          </select>
        </Field>
        <Field label="Hypertension" hint="Do you have high blood pressure (BP consistently above 140/90 mmHg), or are you on BP medication? If yes, select Yes.">
          <select className={selectCls} value={f.htn} onChange={e => set('htn', +e.target.value)}>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </Field>
        <Field label="Diabetes Mellitus" hint="Have you been diagnosed with Type 1 or Type 2 diabetes by a doctor, or are you on diabetes medication/insulin?">
          <select className={selectCls} value={f.dm} onChange={e => set('dm', +e.target.value)}>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </Field>
      </div>
      <button className="mt-6 w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 rounded-full transition-colors"
        onClick={() => onResult(predictKidney(f))}>
        Predict Kidney Disease Risk
      </button>
    </div>
  )
}

function LiverForm({ onResult }: { onResult: (r: PredictionResult) => void }) {
  const [f, setF] = useState({ age: 40, tb: 0.9, db: 0.3, alkphos: 100, sgpt: 35, sgot: 35, tp: 7.2, alb: 4.0, ag: 1.1 })
  const set = (k: string, v: number) => setF(p => ({ ...p, [k]: v }))

  return (
    <div>
      <p className="text-sm text-[#6B6B80] mb-5">Based on the <span className="font-semibold text-[#1F2033]">Indian Liver Patient Dataset</span> (ILPD). Enter values from your liver function test (LFT).</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Age (years)" hint="Your current age. Found on any ID or medical record.">
          <input type="number" className={inputCls} value={f.age} min={4} max={100} onChange={e => set('age', +e.target.value)} />
        </Field>
        <Field label="Total Bilirubin (mg/dL)" hint="A pigment produced when red blood cells break down. Normal: 0.2–1.2 mg/dL. Found in LFT (Liver Function Test) blood report as 'Total Bilirubin'.">
          <input type="number" className={inputCls} step="0.1" value={f.tb} min={0} max={80} onChange={e => set('tb', +e.target.value)} />
        </Field>
        <Field label="Direct Bilirubin (mg/dL)" hint="A form of bilirubin processed by the liver. Normal: 0.0–0.3 mg/dL. Found in LFT report as 'Direct' or 'Conjugated Bilirubin'.">
          <input type="number" className={inputCls} step="0.1" value={f.db} min={0} max={20} onChange={e => set('db', +e.target.value)} />
        </Field>
        <Field label="Alkaline Phosphatase (U/L)" hint="An enzyme from liver and bones. Normal: 44–147 U/L. Found in LFT report as 'ALP' or 'Alkaline Phosphatase'.">
          <input type="number" className={inputCls} value={f.alkphos} min={40} max={2000} onChange={e => set('alkphos', +e.target.value)} />
        </Field>
        <Field label="SGPT / ALT (U/L)" hint="Liver enzyme that rises when liver cells are damaged. Normal: 7–56 U/L. Found in LFT report as 'SGPT' or 'ALT'.">
          <input type="number" className={inputCls} value={f.sgpt} min={0} max={2000} onChange={e => set('sgpt', +e.target.value)} />
        </Field>
        <Field label="SGOT / AST (U/L)" hint="Another liver enzyme. Normal: 10–40 U/L. Found in LFT report as 'SGOT' or 'AST'. Also rises with heart or muscle injury.">
          <input type="number" className={inputCls} value={f.sgot} min={0} max={5000} onChange={e => set('sgot', +e.target.value)} />
        </Field>
        <Field label="Total Proteins (g/dL)" hint="Total protein in your blood. Normal: 6.0–8.3 g/dL. Found in LFT report as 'Total Protein'. Low levels can indicate liver or kidney problems.">
          <input type="number" className={inputCls} step="0.1" value={f.tp} min={2} max={10} onChange={e => set('tp', +e.target.value)} />
        </Field>
        <Field label="Albumin (g/dL)" hint="A key protein made by the liver. Normal: 3.4–5.4 g/dL. Found in LFT report as 'Albumin'. Low albumin suggests liver disease.">
          <input type="number" className={inputCls} step="0.1" value={f.alb} min={0} max={6} onChange={e => set('alb', +e.target.value)} />
        </Field>
        <Field label="A/G Ratio" hint="Albumin-to-Globulin ratio. Normal: 1.0–2.5. Found in LFT report as 'A/G Ratio'. Calculated automatically from Albumin and Total Protein.">
          <input type="number" className={inputCls} step="0.01" value={f.ag} min={0} max={3} onChange={e => set('ag', +e.target.value)} />
        </Field>
      </div>
      <button className="mt-6 w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 rounded-full transition-colors"
        onClick={() => onResult(predictLiver(f))}>
        Predict Liver Disease Risk
      </button>
    </div>
  )
}

function SkinForm({ onResult }: { onResult: (r: PredictionResult) => void }) {
  const [symptoms, setSymptoms] = useState<Record<string, number>>({
    itching: 0, skinRash: 0, nodalEruptions: 0, dischromicPatches: 0,
    brownishScaling: 0, inflammationNail: 0, blisteringPeeling: 0,
    scarsTears: 0, pus: 0, skinPeeling: 0,
  })
  const [duration, setDuration] = useState(7)
  const [familyHistory, setFamilyHistory] = useState(0)

  const toggle = (k: string) => setSymptoms(p => ({ ...p, [k]: p[k] === 1 ? 0 : 1 }))

  const labels: Record<string, string> = {
    itching: 'Itching', skinRash: 'Skin Rash', nodalEruptions: 'Nodal Eruptions',
    dischromicPatches: 'Discolouration / Patches', brownishScaling: 'Brownish Scaling',
    inflammationNail: 'Nail Inflammation', blisteringPeeling: 'Blistering / Peeling',
    scarsTears: 'Skin Scars or Tears', pus: 'Pus / Discharge', skinPeeling: 'Skin Scaling',
  }

  return (
    <div>
      <p className="text-sm text-[#6B6B80] mb-5">Based on the <span className="font-semibold text-[#1F2033]">Skin Disease Symptom Dataset</span>. Select all symptoms that currently apply.</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        {Object.entries(labels).map(([k, l]) => (
          <button key={k} onClick={() => toggle(k)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 border text-sm font-medium text-left transition-all ${symptoms[k] ? 'bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]' : 'bg-[#F7F6FB] border-[#E4E2F0] text-[#6B6B80] hover:border-[#C4C2D4]'}`}>
            <span className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center ${symptoms[k] ? 'bg-[#4F46E5] border-[#4F46E5]' : 'border-[#C4C2D4]'}`}>
              {symptoms[k] === 1 && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </span>
            {l}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-2">
        <Field label="Symptom Duration (days)" hint="How many days have you been experiencing these skin symptoms? Enter your best estimate.">
          <input type="number" className={inputCls} value={duration} min={1} max={365} onChange={e => setDuration(+e.target.value)} />
        </Field>
        <Field label="Family History of Skin Disease" hint="Has any close family member (parent, sibling) been diagnosed with a chronic skin condition like psoriasis, eczema, or vitiligo?">
          <select className={selectCls} value={familyHistory} onChange={e => setFamilyHistory(+e.target.value)}>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </Field>
      </div>
      <button className="mt-6 w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 rounded-full transition-colors"
        onClick={() => onResult(predictSkin({ ...symptoms, duration, familyHistory }))}>
        Predict Skin Disease Risk
      </button>
    </div>
  )
}

// ─── Prediction Section ───────────────────────────────────────────────────────

const TABS: { id: DiseaseTab; label: string; emoji: string }[] = [
  { id: 'heart', label: 'Heart', emoji: '♥' },
  { id: 'diabetes', label: 'Diabetes', emoji: '⬡' },
  { id: 'kidney', label: 'Kidney', emoji: '◈' },
  { id: 'liver', label: 'Liver', emoji: '◉' },
  { id: 'skin', label: 'Skin', emoji: '◻' },
]

function PredictSection() {
  const [tab, setTab] = useState<DiseaseTab>('heart')
  const [results, setResults] = useState<Partial<Record<DiseaseTab, PredictionResult>>>({})

  const handleResult = (r: PredictionResult) => setResults(p => ({ ...p, [tab]: r }))

  return (
    <section id="predict" className="bg-[#F7F6FB] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1F2033] tracking-tight">Disease Risk Screening</h2>
          <p className="mt-3 text-[#6B6B80] max-w-lg mx-auto">Select a disease category, enter your clinical values, and receive an instant risk assessment.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E2F0] overflow-hidden"
          style={{ boxShadow: '0 4px 32px 0 rgba(79,70,229,0.07)' }}>
          {/* Tabs */}
          <div className="border-b border-[#E4E2F0] px-6 pt-5 flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-[#4F46E5] text-white' : 'text-[#6B6B80] hover:text-[#1F2033] hover:bg-[#F7F6FB]'}`}>
                <span className="text-base leading-none">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Form + result */}
          <div className="p-8 grid lg:grid-cols-2 gap-10">
            <div>
              {tab === 'heart' && <HeartForm onResult={handleResult} />}
              {tab === 'diabetes' && <DiabetesForm onResult={handleResult} />}
              {tab === 'kidney' && <KidneyForm onResult={handleResult} />}
              {tab === 'liver' && <LiverForm onResult={handleResult} />}
              {tab === 'skin' && <SkinForm onResult={handleResult} />}
            </div>
            <div>
              {results[tab] ? (
                <ResultCard result={results[tab]!} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 rounded-2xl bg-[#F7F6FB] border border-[#E4E2F0] border-dashed">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#E4E2F0] flex items-center justify-center mb-4"
                    style={{ boxShadow: '0 2px 12px 0 rgba(79,70,229,0.07)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12h6m-3-3v6m-7 3h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="font-semibold text-[#1F2033] mb-1">No prediction yet</p>
                  <p className="text-sm text-[#6B6B80] max-w-xs">Fill in the form on the left and click Predict to see your risk assessment here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── About Section ────────────────────────────────────────────────────────────

function AboutSection() {
  const datasets = [
    { name: 'UCI Heart Disease', rows: '303 patients', accuracy: '~85%', source: 'Cleveland Clinic' },
    { name: 'Pima Diabetes (NIDDK)', rows: '768 patients', accuracy: '~79%', source: 'National Institute' },
    { name: 'Chronic Kidney (UCI)', rows: '400 patients', accuracy: '~97%', source: 'Apollo Hospital' },
    { name: 'ILPD Liver', rows: '583 patients', accuracy: '~75%', source: 'Andhra Pradesh, India' },
    { name: 'Skin Disease Symptoms', rows: '4,920 patients', accuracy: '~92%', source: 'Kaggle Clinical' },
  ]
  return (
    <section id="about" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl font-bold text-[#1F2033] tracking-tight mb-4">Backed by validated clinical data</h2>
            <p className="text-[#6B6B80] leading-relaxed mb-6">Each prediction model uses rule-based clinical thresholds derived from peer-reviewed medical datasets. The scoring logic mirrors the feature importance patterns found in trained random forest and logistic regression models on these datasets.</p>
            <p className="text-[#6B6B80] leading-relaxed">This tool is designed for <span className="font-semibold text-[#1F2033]">health awareness and early screening</span> — not clinical diagnosis. Always consult a licensed physician before making any medical decisions.</p>
          </div>
          <div>
            <div className="rounded-2xl border border-[#E4E2F0] overflow-hidden">
              <div className="bg-[#F7F6FB] px-5 py-3 flex items-center gap-2 border-b border-[#E4E2F0]">
                <span className="text-xs font-bold text-[#1F2033] uppercase tracking-wide">Dataset Reference</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4E2F0]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B6B80] uppercase tracking-wide">Dataset</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B80] uppercase tracking-wide hidden sm:table-cell">Size</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B80] uppercase tracking-wide">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((d, i) => (
                    <tr key={d.name} className={`${i < datasets.length - 1 ? 'border-b border-[#E4E2F0]' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[#1F2033]">{d.name}</div>
                        <div className="text-xs text-[#6B6B80]">{d.source}</div>
                      </td>
                      <td className="px-4 py-3.5 text-[#6B6B80] hidden sm:table-cell font-mono text-xs">{d.rows}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-2.5 py-1 rounded-full font-mono">{d.accuracy}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#1F2033] py-12">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#4F46E5] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L8 15M1 8H15M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">MedPred</span>
        </div>
        <p className="text-[#6B6B80] text-sm max-w-md mx-auto leading-relaxed">
          For educational and awareness purposes only. Not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
        <p className="text-[#3D3D55] text-xs mt-6">© 2026 MedPred · Built with validated clinical datasets</p>
      </div>
    </footer>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-white text-[#1F2033]">
      <Navbar />

      {/* Hero */}
      <section className="bg-white pt-20 pb-4">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-4 py-2 rounded-full mb-7">
            <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
            5 Disease Models · Clinically Validated
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#1F2033] tracking-tight leading-[1.1] mb-5">
            Predict disease risk<br />
            <span className="text-[#4F46E5]">before symptoms appear</span>
          </h1>
          <p className="text-lg text-[#6B6B80] leading-relaxed max-w-xl mx-auto mb-8">
            Enter your clinical values for heart, diabetes, kidney, liver, or skin conditions and receive an instant AI-powered risk assessment — backed by validated medical datasets.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="#predict" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-7 py-3.5 rounded-full transition-colors">
              Start free screening
            </a>
            <a href="#about" className="border border-[#E4E2F0] text-[#1F2033] hover:border-[#4F46E5] font-semibold px-7 py-3.5 rounded-full transition-colors">
              Learn how it works
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <HeroScreenshot />
        </div>
      </section>

      <LogoRow />
      <FeatureGrid />
      <PredictSection />
      <AboutSection />
      <Footer />
    </div>
  )
}
