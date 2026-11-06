// STATIC DATA - same shapes the API should return (see src/types/hr.ts).
import { EMPTY_FORM_VALUES, type HrCatalog, type HrMember, type Lab, type Organization, type Project, type SelectOption, type Theme } from '../types/hr';

const opt = (label: string): SelectOption => ({ value: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label });

export const themesMock: Theme[] = [
  { id: 'software-ai-cyber', name: 'Software, AI & Cyber' },
  { id: 'sea-air-land', name: 'Sea, Air & Land' },
  { id: 'special-materials', name: 'Special Materials' },
  { id: 'materials-processing', name: 'Materials Processing' },
];

const lab = (num: string, themeId: string): Lab => ({ id: `lab-${num.replace('.', '-')}`, name: `Lab ${num}`, themeId, floor: Number(num.split('.')[0]) });

export const labsMock: Lab[] = [
  ...['3.1', '3.2', '3.3', '3.4', '3.5'].map((n) => lab(n, 'software-ai-cyber')),
  ...['2.6', '2.7'].map((n) => lab(n, 'sea-air-land')),
  ...['4.1', '4.3'].map((n) => lab(n, 'special-materials')),
  ...['5.1', '5.2'].map((n) => lab(n, 'materials-processing')),
];

const project = (code: string, title: string, labNum: string, status: Project['status'], durationMonths: number): Project => ({
  id: code.toLowerCase(), code, title, labId: `lab-${labNum.replace('.', '-')}`, status, durationMonths,
});

// Completed / on-hold projects exist on purpose: the form must NOT offer them.
export const projectsMock: Project[] = [
  project('IMP-0020', 'Heterogeneously Redundant Integrated Solution', '3.1', 'in-progress', 24),
  project('IMP-0021', 'Secure Edge Inference Framework', '3.1', 'initiated', 18),
  project('IMP-0014', 'Legacy Network Audit Toolkit', '3.1', 'completed', 12),
  project('IMP-0156', 'Stability-Constrained RL for Flight Control', '3.2', 'in-progress', 30),
  project('IMP-0157', 'Vision Research Platform', '3.2', 'initiated', 12),
  project('IMP-0033', 'Cyber Range Simulation', '3.3', 'in-progress', 36),
  project('IMP-0034', 'Autonomous Threat Triage', '3.3', 'on-hold', 24),
  project('IMP-0041', 'Federated Learning Testbed', '3.4', 'initiated', 18),
  project('IMP-0042', 'Satellite Telemetry Analytics', '3.5', 'in-progress', 20),
  project('IMP-0155', 'Hydraulic Actuator With Rod Lock Mechanism', '2.6', 'in-progress', 24),
  project('IMP-0160', 'Autonomous Surface Vessel Navigation', '2.7', 'in-progress', 30),
  project('IMP-0161', 'Hull Corrosion Monitoring Sensor', '2.7', 'completed', 12),
  project('IMP-0201', 'Advanced Composites Project', '4.1', 'in-progress', 36),
  project('IMP-0202', 'Ceramic Armour Tiles', '4.3', 'initiated', 24),
  project('IMP-0301', 'Powder Metallurgy Process Line', '5.1', 'in-progress', 18),
  project('IMP-0302', 'Additive Manufacturing Qualification', '5.2', 'initiated', 24),
];

export const rolesMock: SelectOption[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'executive', label: 'Executive' },
  { value: 'tti', label: 'Technology Theme Incharge (TTI)' },
  { value: 'pl', label: 'Project Lead (PL)' },
  { value: 'li', label: 'Lab Incharge (LI)' },
];

export const disciplinesMock: SelectOption[] = [
  'Electrical Engineering', 'Mechanical Engineering', 'Computer Science', 'Software Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Aerospace Engineering', 'Materials Science', 'Mathematics', 'Physics', 'Other',
].map(opt);

export const commissionsMock: SelectOption[] = ['Commission A', 'Commission B', 'Commission C', 'Commission D'].map(opt);

// Each organization belongs to one commission.
const orgsIn = (commissionId: string, names: string[]): Organization[] => names.map((n) => ({ ...opt(n), commissionId }));
export const organizationsMock: Organization[] = [
  ...orgsIn('commission-a', ['Org-A', 'Org-B', 'Org-C']),
  ...orgsIn('commission-b', ['Org-D', 'Org-E', 'Org-F']),
  ...orgsIn('commission-c', ['Org-G', 'Org-H', 'Org-I']),
  ...orgsIn('commission-d', ['Org-J', 'Org-K']),
];

export const catalogMock: HrCatalog = {
  themes: themesMock,
  labs: labsMock,
  projects: projectsMock,
  qualifications: ['PhD', 'MS / MPhil', 'BS / BE', 'Diploma'].map(opt),
  commissions: commissionsMock,
  roles: rolesMock,
  disciplines: disciplinesMock,
  organizations: organizationsMock,
};

const emailOf = (name: string) => `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@ascendlab.com`;

/** Seed data is written with a full name; the form stores first + last separately. */
const splitName = (full: string) => {
  const [firstName, ...rest] = full.split(' ');
  return { firstName, lastName: rest.join(' '), name: full };
};

const ra = (id: string, name: string, labNum: string, projectCode: string, o: Partial<HrMember>): HrMember => {
  const l = labsMock.find((x) => x.id === `lab-${labNum.replace('.', '-')}`)!;
  const p = projectsMock.find((x) => x.id === projectCode.toLowerCase())!;
  return {
    ...EMPTY_FORM_VALUES, id, hrType: 'contractual', ...splitName(name), email: emailOf(name), qualification: 'ms-mphil',
    technologyTheme: l.themeId, lab: l.id, projectId: p.id, projectDuration: String(p.durationMonths),
    selected: 'yes', selectedDate: '2025-02-10', loaIssued: 'yes', loaIssuedDate: '2025-03-01', joined: 'yes', contractDuration: '12',
    gender: 'male', dob: '1996-04-15', discipline: 'electrical-engineering', cnic: '35202-1234567-1', ...o,
  };
};

let strategicCount = 0; // demo data: hand the roles out in turn
const strategic = (id: string, name: string, organization: string, o: Partial<HrMember>): HrMember => ({
  ...EMPTY_FORM_VALUES, id, hrType: 'strategic', ...splitName(name), email: emailOf(name),
  role: rolesMock[strategicCount++ % rolesMock.length].value,
  commission: organizationsMock.find((x) => x.value === organization)?.commissionId ?? '', organization, ...o,
});

export const membersSeed: HrMember[] = [
  ra('hr-1', 'John Doe', '4.1', 'IMP-0201', { phone: '+92 300 1234567', dateOfJoining: '2025-03-12', payPackage: '120000', contractDuration: '24', qualification: 'phd', remarks: 'Lead RA for composites characterisation.' }),
  strategic('hr-2', 'Sara Ahmed', 'org-a', { phone: '+92 321 4567890', dateOfJoining: '2025-06-04', remarks: 'Liaison for Tech Innovators partnership.' }),
  ra('hr-3', 'Ali Raza', '2.7', 'IMP-0160', { phone: '+92 333 7654321', dateOfJoining: '2025-08-19', payPackage: '110000', contractDuration: '18' }),
  strategic('hr-4', 'Ayesha Khan', 'org-c', { phone: '+92 312 9876543', dateOfJoining: '2026-01-02' }),
  ra('hr-5', 'Hamza Malik', '3.2', 'IMP-0157', { phone: '+92 301 2223344', dateOfJoining: '2026-02-15', payPackage: '95000', contractDuration: '12', qualification: 'bs-be' }),
  ra('hr-6', 'Fatima Noor', '3.1', 'IMP-0020', { phone: '+92 345 1112233', dateOfJoining: '2025-11-03', payPackage: '130000', contractDuration: '24', qualification: 'phd' }),
  ra('hr-7', 'Usman Tariq', '3.3', 'IMP-0033', { phone: '+92 302 5556677', joined: 'no', dateOfJoining: '', payPackage: '100000', remarks: 'LOA issued, joining expected next month.' }),
  strategic('hr-8', 'Maryam Siddiqui', 'org-f', { phone: '+92 315 8889900', dateOfJoining: '2026-03-21' }),
  ra('hr-9', 'Bilal Hussain', '5.1', 'IMP-0301', { phone: '+92 334 4445566', dateOfJoining: '2026-04-10', payPackage: '105000', contractDuration: '18' }),
  ra('hr-10', 'Zainab Yousaf', '3.4', 'IMP-0041', { phone: '+92 300 7778899', loaIssued: 'no', joined: 'no', dateOfJoining: '', payPackage: '90000' }),
  ra('hr-11', 'Hassan Javed', '2.6', 'IMP-0155', { phone: '+92 322 3334455', dateOfJoining: '2025-09-01', payPackage: '115000', contractDuration: '24' }),
  strategic('hr-12', 'Nida Farooq', 'org-h', { phone: '+92 311 6667788', dateOfJoining: '2026-05-18', remarks: 'Handles defence-sector partnerships.' }),
];
