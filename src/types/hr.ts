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
  commissions: SelectOption[];
  organizations: Organization[];
}

/**
 * Every field is a string and every field is OPTIONAL (empty string = not filled).
 * Dates are ISO `YYYY-MM-DD`; Yes/No selects hold 'yes' | 'no' | ''.
 */
export interface HrFormValues {
  firstName: string;
  lastName: string;
  name: string;               // Full name = first + last. Derived on save (not a form field); used by the directory, search and view page.
  email: string;
  phone: string;              // Contact #
  qualification: string;
  commission: string;         // Strategic HR only - commission id
  organization: string;       // Strategic HR only - must belong to the chosen commission
  technologyTheme: string;    // Theme id
  lab: string;                // Lab id
  projectId: string;          // Project id (Project Code + Project Title both edit this)
  projectDuration: string;    // months
  selected: string;           // yes | no
  loaIssued: string;          // Letter of Appointment issued - yes | no
  joined: string;             // yes | no
  dateOfJoining: string;      // ISO date
  payPackage: string;         // per month
  contractDuration: string;   // months
  remarks: string;
}

export type HrMemberInput = HrFormValues & { hrType: HrType };
export type HrMember = HrMemberInput & { id: string };

export const EMPTY_FORM_VALUES: HrFormValues = {
  firstName: '', lastName: '', name: '', email: '', phone: '', qualification: '', commission: '', organization: '',
  technologyTheme: '', lab: '', projectId: '', projectDuration: '',
  selected: '', loaIssued: '', joined: '', dateOfJoining: '',
  payPackage: '', contractDuration: '', remarks: '',
};

/** Only projects in these states are offered when a lab is selected. */
export const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = ['initiated', 'in-progress'];
export const isActiveProject = (p: Project): boolean => ACTIVE_PROJECT_STATUSES.includes(p.status);
