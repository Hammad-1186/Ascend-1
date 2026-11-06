export type HrType = 'contractual' | 'strategic';
export type ProjectStatus = 'initiated' | 'in-progress' | 'completed' | 'on-hold';

export interface SelectOption { value: string; label: string }

/** An organization belongs to exactly one commission (Strategic HR: pick the commission first, then its organization). */
export interface Organization extends SelectOption { commissionId: string }

export interface Theme { id: string; name: string }
export interface Lab { id: string; name: string; themeId: string; floor: number }
export interface Project {
  id: string;
  code: string;
  title: string;
  labId: string;
  status: ProjectStatus;
  durationMonths: number;
}

/** Everything the form dropdowns need. Same shape the API should return from GET /hr/catalog. */
export interface HrCatalog {
  themes: Theme[];
  labs: Lab[];
  projects: Project[];
  qualifications: SelectOption[];
  disciplines: SelectOption[];      // qualification sub-field, e.g. Electrical Engineering
  commissions: SelectOption[];
  roles: SelectOption[];
  organizations: Organization[];
}

/**
 * Every field is a string and every field is OPTIONAL (empty string = not filled).
 * Dates are ISO `YYYY-MM-DD`; the Appointment checkboxes hold 'yes' (ticked) or 'no' / '' (empty).
 */
export interface HrFormValues {
  firstName: string;
  lastName: string;
  name: string;               // Full name = first + last. Derived on save (not a form field); used by the directory, search and view page.
  cnic: string;               // 13 digits, shown as 12345-1234567-1
  photo: string;              // profile image as a data URL ('' = none). Send as multipart / upload to storage if your API prefers.
  dob: string;                // Date of birth, ISO date (Contractual)
  gender: string;             // male | female | other (Contractual)
  email: string;
  phone: string;              // Contact #
  qualification: string;
  discipline: string;         // Qualification sub-field (Contractual) - e.g. electrical-engineering
  cv: string;                 // CV file as a data URL ('' = none). Upload to storage instead if your API prefers.
  cvName: string;             // original file name of the CV
  role: string;               // Strategic HR only - Executive / Floor Incharge / Project Lead / Lab Incharge
  commission: string;         // Strategic HR only - commission id
  organization: string;       // Strategic HR only - must belong to the chosen commission
  technologyTheme: string;    // Theme id
  lab: string;                // Lab id
  projectId: string;          // Project id (Project Code + Project Title both edit this)
  projectDuration: string;    // months
  selected: string;           // checkbox: 'yes' = ticked, anything else = not selected
  selectedDate: string;       // ISO date the person was selected (only while ticked)
  loaIssued: string;          // Letter of Appointment issued - checkbox
  loaIssuedDate: string;      // ISO date the LOA was issued
  loaFile: string;            // the LOA document as a data URL
  loaFileName: string;
  joined: string;             // checkbox
  dateOfJoining: string;      // ISO date - the "joined" date
  payPackage: string;         // per month
  contractDuration: string;   // months
  remarks: string;
}

export type HrMemberInput = HrFormValues & { hrType: HrType };
export type HrMember = HrMemberInput & { id: string };

export const EMPTY_FORM_VALUES: HrFormValues = {
  firstName: '', lastName: '', name: '', cnic: '', photo: '', dob: '', gender: '', email: '', phone: '', qualification: '', discipline: '', cv: '', cvName: '', role: '', commission: '', organization: '',
  technologyTheme: '', lab: '', projectId: '', projectDuration: '',
  selected: '', selectedDate: '', loaIssued: '', loaIssuedDate: '', loaFile: '', loaFileName: '', joined: '', dateOfJoining: '',
  payPackage: '', contractDuration: '', remarks: '',
};

/** Only projects in these states are offered when a lab is selected. */
export const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = ['initiated', 'in-progress'];
export const isActiveProject = (p: Project): boolean => ACTIVE_PROJECT_STATUSES.includes(p.status);
