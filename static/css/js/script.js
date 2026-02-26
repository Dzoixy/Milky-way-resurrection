// ════════════════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════════════════

const USERS = {
  dr_smith:    { password: 'clinic123', role: 'clinician', name: 'Dr. Smith' },
  dr_jones:    { password: 'clinic456', role: 'clinician', name: 'Dr. Jones' },
  patient_001: { password: 'patient123', role: 'patient',   name: 'John Doe',   patientId: 'pt-001' },
};

let currentUser = null;

let PATIENTS = [
  {
    id: 'pt-001', fullName: 'Maria Santos', nationalId: 'ID-1001',
    dob: '1968-04-12', gender: 'female',
    sbp:148, dbp:92, glucose:130, hba1c:7.2, chol:220, ldl:145, hdl:38, trig:180,
    smoking:false, exercise:'1-2/week',
    chronic:'Hypertension, Diabetes Type 2', family:'Father: MI at 58', allergies:'', notes:'Referred by GP',
    visits: [
      { date:'2025-11-20', riskPct:62.0, riskCat:'High', notes:'Initial assessment' },
      { date:'2025-08-10', riskPct:58.5, riskCat:'High', notes:'Follow-up review' },
      { date:'2025-03-15', riskPct:54.0, riskCat:'Moderate', notes:'Annual review' },
    ]
  },
  {
    id: 'pt-002', fullName: 'Ahmed Al-Rashid', nationalId: 'ID-1002',
    dob: '1955-09-03', gender: 'male',
    sbp:175, dbp:105, glucose:195, hba1c:9.1, chol:265, ldl:180, hdl:32, trig:310,
    smoking:true, exercise:'none',
    chronic:'Hypertension, Diabetes Type 2, CKD Stage 3', family:'Father: MI, Mother: Stroke', allergies:'ACE inhibitors', notes:'Urgent follow-up required',
    visits: [
      { date:'2026-01-05', riskPct:88.0, riskCat:'Very High', notes:'Urgent referral cardiology' },
      { date:'2025-10-12', riskPct:82.0, riskCat:'Very High', notes:'HbA1c uncontrolled' },
    ]
  },
  {
    id: 'pt-003', fullName: 'Li Wei', nationalId: 'ID-1003',
    dob: '1982-07-22', gender: 'male',
    sbp:132, dbp:84, glucose:105, hba1c:5.9, chol:198, ldl:128, hdl:48, trig:145,
    smoking:false, exercise:'3-4/week',
    chronic:'Hypertension', family:'Father: Hypertension', allergies:'', notes:'',
    visits: [
      { date:'2025-12-01', riskPct:34.0, riskCat:'Moderate', notes:'BP well-controlled' },
      { date:'2025-06-20', riskPct:31.0, riskCat:'Moderate', notes:'Annual review' },
    ]
  },
  {
    id: 'pt-004', fullName: 'Emma Thompson', nationalId: 'ID-1004',
    dob: '1990-03-15', gender: 'female',
    sbp:118, dbp:76, glucose:88, hba1c:null, chol:172, ldl:98, hdl:62, trig:95,
    smoking:false, exercise:'daily',
    chronic:'', family:'', allergies:'', notes:'',
    visits: [
      { date:'2026-02-01', riskPct:12.0, riskCat:'Low', notes:'Routine check' },
    ]
  },
  {
    id: 'pt-005', fullName: 'James Okonkwo', nationalId: 'ID-1005',
    dob: '1963-11-08', gender: 'male',
    sbp:158, dbp:96, glucose:142, hba1c:7.8, chol:242, ldl:162, hdl:35, trig:220,
    smoking:true, exercise:'none',
    chronic:'Hypertension, Diabetes Type 2', family:'Brother: MI at 50', allergies:'', notes:'Non-compliant with medications',
    visits: [
      { date:'2025-12-18', riskPct:76.0, riskCat:'Very High', notes:'Medication review' },
    ]
  },
];

let currentPatientId = null;
let currentResult = null;

// ════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════════════════════════

function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
}

function showPage(pageId, btn) {
  navigate(pageId);
  if (btn) {
    const nav = btn.closest('nav');
    if (nav) nav.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════════

function doLogin() {
  const username = document.getElementById('inp-user').value.trim();
  const password = document.getElementById('inp-pass').value;
  const role     = document.getElementById('inp-role').value;
  const errEl    = document.getElementById('login-err');

  const user = USERS[username];
  if (!user || user.password !== password || user.role !== role) {
    errEl.textContent = 'Invalid credentials or role selection. Please try again.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  currentUser = { username, ...user };

  if (role === 'clinician') {
    loadClinicianDashboard();
    navigate('page-clinician-dashboard');
  } else {
    loadPatientDashboard(user.patientId);
    navigate('page-patient-dashboard');
  }
}

document.getElementById('inp-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

function doLogout() {
  currentUser = null;
  document.getElementById('inp-user').value = '';
  document.getElementById('inp-pass').value = '';
  document.getElementById('inp-role').value = '';
  navigate('page-login');
}

function calcAge(dob) {
  if (!dob) return 50;
  const d = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function scoreFactors(p) {
  const age = calcAge(p.dob);
  const scores = {};

  const ageScore = Math.max(0, Math.min((age - 30) / 40 * 20, 20));
  if (ageScore > 0) scores['Age'] = { raw: ageScore, label: `${age} years` };

  scores['Gender'] = { raw: p.gender === 'male' ? 5 : 2, label: p.gender.charAt(0).toUpperCase()+p.gender.slice(1) };

  const sbp = p.sbp;
  let bpScore = 0;
  if (sbp >= 180) bpScore = 20;
  else if (sbp >= 160) bpScore = 15;
  else if (sbp >= 140) bpScore = 10;
  else if (sbp >= 130) bpScore = 5;
  if (bpScore > 0) scores['Systolic BP'] = { raw: bpScore, label: `${sbp} mmHg` };

  const glc = p.glucose;
  let glcScore = 0;
  if (glc >= 200) glcScore = 15;
  else if (glc >= 126) glcScore = 10;
  else if (glc >= 100) glcScore = 5;
  if (glcScore > 0) scores['Blood Glucose'] = { raw: glcScore, label: `${glc} mg/dL` };

  if (p.hba1c) {
    let h = 0;
    if (p.hba1c >= 9) h = 12;
    else if (p.hba1c >= 7) h = 8;
    else if (p.hba1c >= 5.7) h = 3;
    if (h > 0) scores['HbA1c'] = { raw: h, label: `${p.hba1c}%` };
  }

  if (p.chol) {
    let c = 0;
    if (p.chol >= 240) c = 10;
    else if (p.chol >= 200) c = 5;
    if (c > 0) scores['Total Cholesterol'] = { raw: c, label: `${p.chol} mg/dL` };
  }

  if (p.ldl) {
    let l = 0;
    if (p.ldl >= 190) l = 10;
    else if (p.ldl >= 130) l = 6;
    if (l > 0) scores['LDL Cholesterol'] = { raw: l, label: `${p.ldl} mg/dL` };
  }

  if (p.hdl) {
    let h = 0;
    if (p.hdl < 40) h = 8;
    else if (p.hdl < 60) h = 2;
    else h = -5;
    if (h > 0) scores['HDL Cholesterol'] = { raw: h, label: `${p.hdl} mg/dL (low)` };
  }

  if (p.smoking) scores['Smoking'] = { raw: 15, label: 'Current smoker' };

  const exMap = { 'none': 10, '1-2/week': 5, '3-4/week': 2, 'daily': 0 };
  const ex = (exMap[p.exercise] || 5);
  if (ex > 0) scores['Physical Inactivity'] = { raw: ex, label: p.exercise || 'none' };

  if (p.family && p.family.trim().length > 3) scores['Family History'] = { raw: 8, label: 'Positive' };

  const cd = (p.chronic || '').toLowerCase();
  let cdScore = 0;
  if (cd.includes('diabetes')) cdScore += 10;
  if (cd.includes('hypertension')) cdScore += 8;
  if (cd.includes('ckd') || cd.includes('kidney')) cdScore += 7;
  if (cdScore > 0) scores['Chronic Diseases'] = { raw: cdScore, label: p.chronic };

  return scores;
}

function calcRisk(p) {
  const factorScores = scoreFactors(p);
  const rawTotal = Object.values(factorScores).reduce((s, f) => s + f.raw, 0);
  const pct = Math.min(Math.max(rawTotal, 0), 100);

  let category;
  if (pct >= 70) category = 'Very High';
  else if (pct >= 50) category = 'High';
  else if (pct >= 30) category = 'Moderate';
  else category = 'Low';

  const ranked = Object.entries(factorScores)
    .filter(([,v]) => v.raw > 0)
    .map(([name, v]) => ({ factor: name, contribution: v.raw, label: v.label }))
    .sort((a, b) => b.contribution - a.contribution);

  const totalContrib = ranked.reduce((s, f) => s + f.contribution, 0);

  const meds = [], contra = [];
  const allergies = (p.allergies || '').toLowerCase();
  const cd = (p.chronic || '').toLowerCase();

  if (category === 'Moderate' || category === 'High' || category === 'Very High' || (p.ldl && p.ldl >= 130)) {
    if (!allergies.includes('statin')) {
      meds.push({ name: 'Atorvastatin 10–40 mg daily', rationale: 'LDL reduction and plaque stabilisation' });
    } else {
      contra.push({ drug: 'Statins', reason: 'Documented allergy / intolerance' });
    }
  }

  if (p.sbp >= 140 || cd.includes('diabetes')) {
    if (!allergies.includes('ace')) {
      meds.push({ name: 'Ramipril 5–10 mg daily', rationale: 'BP control and renal protection' });
    } else {
      contra.push({ drug: 'ACE Inhibitors', reason: 'Allergy or history of angioedema' });
      meds.push({ name: 'Losartan 50–100 mg daily (ARB alternative)', rationale: 'BP control — ACE-I alternative' });
    }
  }

  if (p.glucose >= 126 || (p.hba1c && p.hba1c >= 6.5)) {
    if (!cd.includes('ckd') && !cd.includes('kidney')) {
      meds.push({ name: 'Metformin 500–2000 mg daily', rationale: 'Glycaemic control, first-line DM2' });
    } else {
      contra.push({ drug: 'Metformin', reason: 'Contraindicated in significant CKD (eGFR <30)' });
    }
  }

  if (category === 'Very High') {
    meds.push({ name: 'Aspirin 75–100 mg daily', rationale: 'Antiplatelet therapy for very high CV risk' });
  }

  // Monitoring
  const monitorMap = {
    'Low': 'Annual review. Repeat fasting lipid panel and glucose in 12 months. Reinforce lifestyle modification.',
    'Moderate': '6-month follow-up. Repeat HbA1c and lipids in 3–6 months. Monitor blood pressure at each visit. ECG annually.',
    'High': '3-month follow-up. Monthly BP monitoring. HbA1c every 3 months. Lipid panel in 6 weeks post-therapy initiation. Renal function (eGFR, creatinine) every 6 months. ECG every 6 months.',
    'Very High': 'Monthly follow-up for first 3 months. Daily home BP recording. HbA1c every 3 months. Lipid panel in 4–6 weeks. Renal and hepatic function quarterly. Cardiology referral recommended. Echocardiogram if indicated.',
  };

  // Lifestyle
  const lifestyle = [];
  if (p.smoking) lifestyle.push('Smoking cessation: seek structured cessation support. Quitting reduces CV risk by up to 50% within 1–2 years.');
  const exRec = { 'none': 'Begin with 150 minutes of moderate-intensity aerobic exercise per week (e.g. brisk walking, swimming).', '1-2/week': 'Increase to at least 150 minutes of moderate aerobic activity per week.', '3-4/week': 'Maintain current activity; consider adding resistance training twice weekly.' };
  if (exRec[p.exercise]) lifestyle.push(exRec[p.exercise]);
  if (p.glucose >= 100) lifestyle.push('Dietary modification: reduce refined carbohydrate and added sugar intake. Follow a Mediterranean or DASH diet pattern.');
  if (p.chol && p.chol >= 200) lifestyle.push('Reduce saturated fat intake to <7% of total calories. Increase dietary fibre (oats, legumes, vegetables) to lower LDL.');
  if (p.sbp >= 130) lifestyle.push('Reduce dietary sodium to <2,300 mg/day. Limit alcohol intake. Ensure adequate potassium through fruit and vegetables.');
  if (category === 'High' || category === 'Very High') lifestyle.push('Weight management: aim for BMI 18.5–24.9 kg/m². Even 5–10% weight loss significantly reduces cardiovascular risk.');
  lifestyle.push('Stress management: practise relaxation techniques (mindfulness, breathing exercises). Adequate sleep (7–9 hours nightly) supports metabolic health.');

  return {
    pct: Math.round(pct * 10) / 10,
    category,
    ranked,
    totalContrib,
    meds,
    contra,
    monitoring: monitorMap[category],
    lifestyle,
  };
}

function loadClinicianDashboard() {
  ['cn-user-name','pf-user-name','cr-user-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = currentUser.name;
  });
  document.getElementById('cn-date').textContent = new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  renderPatientTable(PATIENTS);
  updateStats();
}

function renderPatientTable(patients) {
  const body = document.getElementById('patient-table-body');
  document.getElementById('patient-count').textContent = `${patients.length} record${patients.length !== 1 ? 's' : ''}`;

  if (patients.length === 0) {
    body.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--gray-400);font-style:italic;padding:1.5rem">No patients found.</td></tr>`;
    return;
  }

  body.innerHTML = patients.map(p => {
    const lastVisit = p.visits.length ? p.visits[0] : null;
    const riskCat = lastVisit ? lastVisit.riskCat : '—';
    return `<tr>
      <td style="font-weight:600">${p.fullName}</td>
      <td style="font-family:var(--mono);font-size:0.8rem">${p.nationalId}</td>
      <td style="font-family:var(--mono);font-size:0.8rem">${lastVisit ? lastVisit.date : 'No visits'}</td>
      <td><span class="badge">${riskCat}</span></td>
      <td style="white-space:nowrap">
        <button class="btn btn-sm" onclick="viewPatientResult('${p.id}')" style="margin-right:0.4rem">View</button>
        <button class="btn-ghost btn btn-sm" onclick="editPatientVisit('${p.id}')">New Visit</button>
      </td>
    </tr>`;
  }).join('');
}

function filterPatients() {
  const q = document.getElementById('search-inp').value.toLowerCase();
  const filtered = q ? PATIENTS.filter(p =>
    p.fullName.toLowerCase().includes(q) || p.nationalId.toLowerCase().includes(q)
  ) : PATIENTS;
  renderPatientTable(filtered);
}

function updateStats() {
  document.getElementById('stat-total').textContent = PATIENTS.length;
  const high = PATIENTS.filter(p => p.visits.length && (p.visits[0].riskCat === 'High' || p.visits[0].riskCat === 'Very High')).length;
  document.getElementById('stat-high').textContent = high;
  document.getElementById('stat-low').textContent = PATIENTS.length - high;
}

let editingPatientId = null;

function showNewPatientForm() {
  editingPatientId = null;
  document.getElementById('pf-title').textContent = 'Add New Patient';
  document.getElementById('pf-sub').textContent = '';
  document.getElementById('pf-breadcrumb').textContent = 'New Patient';
  clearForm();
  switchTab('tab-basic', null, 0);
  hideFormErrors();
}

function editPatientVisit(patientId) {
  const p = PATIENTS.find(x => x.id === patientId);
  if (!p) return;
  editingPatientId = patientId;
  document.getElementById('pf-title').textContent = `New Visit — ${p.fullName}`;
  document.getElementById('pf-sub').textContent = `National ID: ${p.nationalId}`;
  document.getElementById('pf-breadcrumb').textContent = 'New Visit';
  fillForm(p);
  switchTab('tab-vitals', null, 1);
  hideFormErrors();
  navigate('page-patient-form');
}

function clearForm() {
  ['f-name','f-nid','f-dob','f-sbp','f-dbp','f-glc','f-hba','f-chol','f-ldl','f-hdl','f-trig','f-chronic','f-fam','f-allerg','f-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('f-gender').value = '';
  document.getElementById('f-exercise').value = 'none';
  document.getElementById('f-smoke').checked = false;
}

function fillForm(p) {
  document.getElementById('f-name').value = p.fullName || '';
  document.getElementById('f-nid').value = p.nationalId || '';
  document.getElementById('f-dob').value = p.dob || '';
  document.getElementById('f-gender').value = p.gender || '';
  document.getElementById('f-sbp').value = p.sbp || '';
  document.getElementById('f-dbp').value = p.dbp || '';
  document.getElementById('f-glc').value = p.glucose || '';
  document.getElementById('f-hba').value = p.hba1c || '';
  document.getElementById('f-chol').value = p.chol || '';
  document.getElementById('f-ldl').value = p.ldl || '';
  document.getElementById('f-hdl').value = p.hdl || '';
  document.getElementById('f-trig').value = p.trig || '';
  document.getElementById('f-smoke').checked = p.smoking || false;
  document.getElementById('f-exercise').value = p.exercise || 'none';
  document.getElementById('f-chronic').value = p.chronic || '';
  document.getElementById('f-fam').value = p.family || '';
  document.getElementById('f-allerg').value = p.allergies || '';
  document.getElementById('f-notes').value = p.notes || '';
}

function getFormData() {
  return {
    fullName: document.getElementById('f-name').value.trim(),
    nationalId: document.getElementById('f-nid').value.trim(),
    dob: document.getElementById('f-dob').value,
    gender: document.getElementById('f-gender').value,
    sbp: parseFloat(document.getElementById('f-sbp').value) || 0,
    dbp: parseFloat(document.getElementById('f-dbp').value) || 0,
    glucose: parseFloat(document.getElementById('f-glc').value) || 0,
    hba1c: parseFloat(document.getElementById('f-hba').value) || null,
    chol: parseFloat(document.getElementById('f-chol').value) || null,
    ldl: parseFloat(document.getElementById('f-ldl').value) || null,
    hdl: parseFloat(document.getElementById('f-hdl').value) || null,
    trig: parseFloat(document.getElementById('f-trig').value) || null,
    smoking: document.getElementById('f-smoke').checked,
    exercise: document.getElementById('f-exercise').value,
    chronic: document.getElementById('f-chronic').value.trim(),
    family: document.getElementById('f-fam').value.trim(),
    allergies: document.getElementById('f-allerg').value.trim(),
    notes: document.getElementById('f-notes').value.trim(),
  };
}

function validateForm(d) {
  const errors = [];
  if (!d.fullName) errors.push('Full name is required.');
  if (!d.nationalId) errors.push('National ID is required.');
  if (!d.dob) errors.push('Date of birth is required.');
  if (!d.gender) errors.push('Gender is required.');
  if (!d.sbp || d.sbp < 60 || d.sbp > 300) errors.push('Systolic BP must be between 60–300 mmHg.');
  if (!d.dbp || d.dbp < 40 || d.dbp > 200) errors.push('Diastolic BP must be between 40–200 mmHg.');
  if (d.sbp <= d.dbp) errors.push('Systolic BP must be greater than Diastolic BP.');
  if (!d.glucose || d.glucose < 20 || d.glucose > 800) errors.push('Blood glucose must be between 20–800 mg/dL.');
  return errors;
}

function showFormErrors(errors) {
  const box = document.getElementById('form-errors');
  const list = document.getElementById('form-error-list');
  list.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFormErrors() {
  document.getElementById('form-errors').style.display = 'none';
}

function calculateAndSave() {
  const d = getFormData();
  const errors = validateForm(d);
  if (errors.length) {
    switchTab('tab-basic', null, 0);
    showFormErrors(errors);
    return;
  }
  hideFormErrors();

  const today = new Date().toISOString().split('T')[0];
  const result = calcRisk(d);
  const newVisit = { date: today, riskPct: result.pct, riskCat: result.category, notes: d.notes || 'New visit' };

  if (editingPatientId) {
    const p = PATIENTS.find(x => x.id === editingPatientId);
    if (p) {
      // update vitals
      Object.assign(p, { sbp: d.sbp, dbp: d.dbp, glucose: d.glucose, hba1c: d.hba1c, chol: d.chol, ldl: d.ldl, hdl: d.hdl, trig: d.trig, smoking: d.smoking, exercise: d.exercise, chronic: d.chronic, family: d.family, allergies: d.allergies, notes: d.notes });
      p.visits.unshift(newVisit);
      currentPatientId = p.id;
    }
  } else {
    const newId = `pt-${String(PATIENTS.length + 1).padStart(3,'0')}-${Date.now()}`;
    const newPatient = { ...d, id: newId, visits: [newVisit] };
    PATIENTS.unshift(newPatient);
    currentPatientId = newId;
  }

  updateStats();
  viewPatientResult(currentPatientId);
}

function viewPatientResult(patientId) {
  const p = PATIENTS.find(x => x.id === patientId);
  if (!p) return;
  currentPatientId = patientId;

  const result = calcRisk(p);
  currentResult = result;

  document.getElementById('cr-patient-name').textContent = p.fullName;
  document.getElementById('cr-patient-sub').textContent = `National ID: ${p.nationalId} — Last assessed: ${new Date().toLocaleDateString('en-GB')}`;

  // Risk score
  setTimeout(() => { document.getElementById('cr-bar').style.width = result.pct + '%'; }, 50);
  document.getElementById('cr-pct').textContent = result.pct + '%';
  document.getElementById('cr-cat').textContent = result.category;

  // Factor table
  const total = result.totalContrib || 1;
  document.getElementById('cr-factors-body').innerHTML = result.ranked.map((f, i) => {
    const pctContrib = ((f.contribution / total) * 100).toFixed(1) + '%';
    return `<tr class="${i < 3 ? 'hl-row' : ''}">
      <td style="font-family:var(--mono);text-align:center;font-weight:700">${i+1}</td>
      <td style="font-weight:${i<3?700:400}">${f.factor}</td>
      <td style="font-family:var(--mono);font-size:0.8rem">${f.label}</td>
      <td style="font-family:var(--mono)">${f.contribution}</td>
      <td style="font-family:var(--mono)">${pctContrib}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="5" class="empty" style="padding:1rem">No significant risk factors identified.</td></tr>`;

  // Meds
  const medsEl = document.getElementById('cr-meds');
  if (result.meds.length) {
    medsEl.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:0.8rem">
      <thead><tr><th>Medication</th><th>Rationale</th></tr></thead>
      <tbody>${result.meds.map(m => `<tr><td style="font-weight:600">${m.name}</td><td>${m.rationale}</td></tr>`).join('')}</tbody>
    </table>`;
  } else {
    medsEl.innerHTML = `<p class="empty">No medications indicated at this risk level.</p>`;
  }

  // Contra
  const contraEl = document.getElementById('cr-contra');
  if (result.contra.length) {
    contraEl.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:0.8rem">
      <thead><tr><th>Drug / Class</th><th>Reason</th></tr></thead>
      <tbody>${result.contra.map(c => `<tr><td style="font-weight:700;border-left:3px solid var(--black)">${c.drug}</td><td>${c.reason}</td></tr>`).join('')}</tbody>
    </table>`;
  } else {
    contraEl.innerHTML = `<p class="empty">No contraindications identified.</p>`;
  }

  // Monitor
  document.getElementById('cr-monitor').textContent = result.monitoring;

  // Visit history
  const histRows = document.getElementById('cr-history-rows');
  if (p.visits.length) {
    histRows.innerHTML = p.visits.map(v => `<tr>
      <td style="font-family:var(--mono)">${v.date}</td>
      <td style="font-family:var(--mono);font-weight:700">${v.riskPct}%</td>
      <td><span class="badge">${v.riskCat}</span></td>
      <td>${v.notes || '—'}</td>
    </tr>`).join('');
  } else {
    histRows.innerHTML = `<tr><td colspan="4" class="empty" style="padding:1rem;font-style:italic">No previous visits recorded.</td></tr>`;
  }

  navigate('page-cn-result');
}

function showEditVisit() {
  if (currentPatientId) editPatientVisit(currentPatientId);
}

function loadPatientDashboard(patientId) {
  const p = PATIENTS.find(x => x.id === patientId);
  if (!p) return;

  ['pt-user-name','pr-user-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = currentUser.name;
  });

  document.getElementById('pt-greeting').textContent = p.fullName.split(' ')[0];
  document.getElementById('pr-sub').textContent = `${p.fullName} — ${new Date().toLocaleDateString('en-GB')}`;

  const result = calcRisk(p);
  const top3 = result.ranked.slice(0, 3);

  const explainMap = {
    'Low': 'Your cardiovascular risk is currently <strong>low</strong>. Continue maintaining healthy lifestyle habits. Annual health reviews are recommended.',
    'Moderate': 'Your cardiovascular risk is <strong>moderate</strong>. Lifestyle changes can make a significant difference. Talk to your doctor about steps to reduce your risk.',
    'High': 'Your cardiovascular risk is <strong>high</strong>. It is important to see your doctor soon to discuss a management plan. Making lifestyle changes now can substantially lower your risk.',
    'Very High': 'Your cardiovascular risk is <strong>very high</strong>. Please contact your healthcare provider as soon as possible to discuss your treatment options and personalised monitoring plan.',
  };

  const setRisk = (bar, pct, cat, explain) => {
    setTimeout(() => { bar.style.width = result.pct + '%'; }, 50);
    pct.textContent = result.pct + '%';
    cat.textContent = result.category;
    explain.innerHTML = explainMap[result.category] || '';
  };

  setRisk(
    document.getElementById('pt-bar'),
    document.getElementById('pt-pct'),
    document.getElementById('pt-cat'),
    document.getElementById('pt-explain')
  );
  setRisk(
    document.getElementById('pr-bar'),
    document.getElementById('pr-pct'),
    document.getElementById('pr-cat'),
    document.getElementById('pr-explain')
  );

  const factorHtml = top3.map((f, i) => `
    <li class="factor-item">
      <div class="factor-num">${i+1}</div>
      <div class="factor-info">
        <div class="factor-name">${f.factor}</div>
        <div class="factor-val">Your reading: ${f.label}</div>
      </div>
    </li>`).join('') || `<li><p class="empty">No specific risk factors identified.</p></li>`;

  document.getElementById('pt-factors').innerHTML = factorHtml;
  document.getElementById('pr-factors').innerHTML = factorHtml;

  const recHtml = result.lifestyle.map(r => `<li class="rec-item">${r}</li>`).join('');
  document.getElementById('pt-recs').innerHTML = recHtml;
  document.getElementById('pr-recs').innerHTML = recHtml;
}

const TABS = ['tab-basic','tab-vitals','tab-lifestyle','tab-history'];

function switchTab(tabId, btn, idx) {
  TABS.forEach(id => {
    document.getElementById(id).classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');

  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (idx !== undefined ? i === idx : b === btn));
  });

  hideFormErrors();
  window.scrollTo(0, 0);
}

document.getElementById('inp-user').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('inp-pass').focus();
});