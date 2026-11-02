import {
  User, Mail, Phone, GraduationCap, Building2, Settings, FlaskConical, FolderOpen, Hash, Clock, CheckCircle2, FileCheck2,
  UserCheck, CalendarDays, Banknote, CalendarClock, MessageSquareText, ClipboardCheck, Users, Layers, type LucideIcon,
} from 'lucide-react';
import type { HrFormValues, HrType, ProjectStatus, SelectOption } from '../../types/hr';

export const HR_TYPES = { CONTRACTUAL: 'contractual', STRATEGIC: 'strategic' } as const satisfies Record<string, HrType>;

export const HR_TYPE_OPTIONS: SelectOption[] = [
  { value: HR_TYPES.CONTRACTUAL, label: 'Contractual HR (RA)' },
  { value: HR_TYPES.STRATEGIC, label: 'Strategic HR' },
];
export const hrTypeLabel = (t: HrType): string => HR_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;

export const YES_NO_OPTIONS: SelectOption[] = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  initiated: 'Initiated', 'in-progress': 'In Progress', completed: 'Completed', 'on-hold': 'On Hold',
};

/** Where a dropdown gets its options from (resolved in useHrMemberForm.optionsFor). */
export type OptionsKey = 'themes' | 'labs' | 'projectCodes' | 'projectTitles' | 'qualifications' | 'organizations' | 'yesNo';

export interface FieldDef {
  /** Unique per field on screen (two fields may edit the same `name`, e.g. Project Code / Project Title). */
  id: string;
  name: keyof HrFormValues;
  label: string;
  component: 'text' | 'select' | 'date' | 'textarea';
  inputType?: 'text' | 'email' | 'tel' | 'number';
  icon?: LucideIcon;
  placeholder: string;
  optionsKey?: OptionsKey;
  /** Disabled until this value is filled (Theme -> Lab -> Project cascade). */
  dependsOn?: keyof HrFormValues;
  dependsHint?: string;
  emptyHint?: string;
  /** Small unit label shown inside the input, e.g. "months". */
  suffix?: string;
  /** How the value is shown on the Review step and the View page. */
  format?: 'date' | 'currency' | 'months';
  maxLength?: number;
  span?: 'full';
  visibleFor?: HrType[];
}

export interface FormGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  columns: 1 | 2 | 3 | 4;
  /** 'hrType' renders the HR-type radio instead of fields. */
  kind?: 'hrType';
  /** Show "N active projects in Lab X" next to the title. */
  showProjectHint?: boolean;
  fields: FieldDef[];
  visibleFor?: HrType[];
}

export interface FormStep {
  id: string;
  title: string;
  icon: LucideIcon;
  groups: FormGroup[];
  visibleFor?: HrType[];
}

/** `visibleFor` omitted = shown for both HR types. */
export const isVisibleFor = (item: { visibleFor?: HrType[] }, hrType: HrType): boolean => !item.visibleFor || item.visibleFor.includes(hrType);

const C = [HR_TYPES.CONTRACTUAL];
const S = [HR_TYPES.STRATEGIC];

const dateOfJoining = (id: string): FieldDef => ({ id, name: 'dateOfJoining', label: 'Date of Joining', component: 'date', icon: CalendarDays, placeholder: 'Select date' });
const remarks = (id: string): FieldDef => ({ id, name: 'remarks', label: 'Remarks', component: 'textarea', placeholder: 'Add any remarks (optional)', maxLength: 300, span: 'full' });

/**
 * ONE definition drives the multi-step form, the review step AND the view page.
 * Step -> Groups (heading) -> Fields. Edit `visibleFor` to change what each HR type sees.
 * NOTE: no field is `required` right now - add `required: true` here later if needed.
 */
export const HR_FORM_STEPS: FormStep[] = [
  {
    id: 'basic', title: 'Basic Information', icon: User,
    groups: [
      { id: 'type', title: 'HR Type', icon: Users, columns: 1, kind: 'hrType', fields: [] },
      {
        id: 'basicInfo', title: 'Personal & Contact Details', icon: User, columns: 2,
        fields: [
          { id: 'name', name: 'name', label: 'RA Name', component: 'text', icon: User, placeholder: 'Enter research assistant name', visibleFor: C },
          { id: 'nameS', name: 'name', label: 'Full Name', component: 'text', icon: User, placeholder: 'Enter full name', visibleFor: S },
          { id: 'email', name: 'email', label: 'Email Address', component: 'text', inputType: 'email', icon: Mail, placeholder: 'Enter email address' },
          { id: 'phone', name: 'phone', label: 'Contact #', component: 'text', inputType: 'tel', icon: Phone, placeholder: 'e.g. +92 300 1234567' },
          { id: 'qualification', name: 'qualification', label: 'Qualification', component: 'select', icon: GraduationCap, placeholder: 'Select qualification', optionsKey: 'qualifications', visibleFor: C },
          { id: 'organization', name: 'organization', label: 'Organization', component: 'select', icon: Building2, placeholder: 'Select organization', optionsKey: 'organizations', visibleFor: S },
        ],
      },
    ],
  },
  {
    id: 'projectLab', title: 'Theme, Lab & Project', icon: FlaskConical, visibleFor: C,
    groups: [
      {
        id: 'themeLab', title: 'Technology Theme & Lab', icon: Layers, columns: 2,
        fields: [
          { id: 'technologyTheme', name: 'technologyTheme', label: 'Technology Theme', component: 'select', icon: Settings, placeholder: 'Select technology theme', optionsKey: 'themes' },
          { id: 'lab', name: 'lab', label: 'Lab', component: 'select', icon: FlaskConical, placeholder: 'Select lab', optionsKey: 'labs', dependsOn: 'technologyTheme', dependsHint: 'Select a theme first', emptyHint: 'No labs in this theme' },
        ],
      },
      {
        id: 'project', title: 'Project Details', icon: FolderOpen, columns: 3, showProjectHint: true,
        fields: [
          { id: 'projectCode', name: 'projectId', label: 'Project Code', component: 'select', icon: Hash, placeholder: 'Select project code', optionsKey: 'projectCodes', dependsOn: 'lab', dependsHint: 'Select a lab first', emptyHint: 'No active projects in this lab' },
          { id: 'projectTitle', name: 'projectId', label: 'Project Title', component: 'select', icon: FolderOpen, placeholder: 'Select project title', optionsKey: 'projectTitles', dependsOn: 'lab', dependsHint: 'Select a lab first', emptyHint: 'No active projects in this lab' },
          { id: 'projectDuration', name: 'projectDuration', label: 'Project Duration', component: 'text', inputType: 'number', icon: Clock, placeholder: 'Months', suffix: 'months', format: 'months' },
        ],
      },
    ],
  },
  {
    id: 'appointment', title: 'Appointment', icon: UserCheck, visibleFor: C,
    groups: [
      {
        id: 'selection', title: 'Selection Status', icon: CheckCircle2, columns: 3,
        fields: [
          { id: 'selected', name: 'selected', label: 'Selected', component: 'select', icon: UserCheck, placeholder: 'Select Yes / No', optionsKey: 'yesNo' },
          { id: 'loaIssued', name: 'loaIssued', label: 'LOA Issued (Letter of Appointment)', component: 'select', icon: FileCheck2, placeholder: 'Select Yes / No', optionsKey: 'yesNo' },
          { id: 'joined', name: 'joined', label: 'Joined', component: 'select', icon: CheckCircle2, placeholder: 'Select Yes / No', optionsKey: 'yesNo' },
        ],
      },
      { id: 'joining', title: 'Joining Details', icon: CalendarDays, columns: 3, fields: [dateOfJoining('dateOfJoining')] },
    ],
  },
  {
    id: 'contract', title: 'Contract & Remarks', icon: Banknote, visibleFor: C,
    groups: [
      {
        id: 'contractTerms', title: 'Contract Terms', icon: Banknote, columns: 2,
        fields: [
          { id: 'payPackage', name: 'payPackage', label: 'Pay Package (per month)', component: 'text', inputType: 'number', icon: Banknote, placeholder: 'Amount', suffix: 'PKR / month', format: 'currency' },
          { id: 'contractDuration', name: 'contractDuration', label: 'Contract Duration', component: 'text', inputType: 'number', icon: CalendarClock, placeholder: 'Months', suffix: 'months', format: 'months' },
        ],
      },
      { id: 'remarksGroup', title: 'Remarks', icon: MessageSquareText, columns: 1, fields: [remarks('remarks')] },
    ],
  },
  {
    id: 'strategicJoining', title: 'Joining & Remarks', icon: CalendarDays, visibleFor: S,
    groups: [
      { id: 'joiningS', title: 'Joining Details', icon: CalendarDays, columns: 2, fields: [dateOfJoining('dateOfJoiningS')] },
      { id: 'remarksGroupS', title: 'Remarks', icon: MessageSquareText, columns: 1, fields: [remarks('remarksS')] },
    ],
  },
];

export const REVIEW_STEP = { id: 'review', title: 'Review', icon: ClipboardCheck } as const;
