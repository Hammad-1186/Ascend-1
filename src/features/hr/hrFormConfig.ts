import {
  User, Mail, Phone, GraduationCap, Building2, Settings, FlaskConical, FolderOpen, Hash, Clock, CheckCircle2, FileCheck2,
  UserCheck, CalendarDays, FileText, Cake, Banknote, CalendarClock, MessageSquareText, ClipboardCheck, Users, Layers, Camera, CreditCard, Upload, type LucideIcon,
} from 'lucide-react';
import type { BadgeTone } from '../../components/ui/Badge';
import type { HrFormValues, HrType, ProjectStatus, SelectOption } from '../../types/hr';

export const HR_TYPES = { CONTRACTUAL: 'contractual', STRATEGIC: 'strategic' } as const satisfies Record<string, HrType>;

export const HR_TYPE_OPTIONS: SelectOption[] = [
  { value: HR_TYPES.CONTRACTUAL, label: 'Contractual' },
  { value: HR_TYPES.STRATEGIC, label: 'Strategic' },
];
/** Badge colour per HR type - change it here and every screen follows. */
export const HR_TYPE_TONE: Record<HrType, BadgeTone> = { strategic: 'solid', contractual: 'soft' };

export const hrTypeLabel = (t: HrType): string => HR_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;

export const GENDER_OPTIONS: SelectOption[] = [
  { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' },
];

export const YES_NO_OPTIONS: SelectOption[] = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  initiated: 'Initiated', 'in-progress': 'In Progress', completed: 'Completed', 'on-hold': 'On Hold',
};

/** Where a dropdown gets its options from (resolved in useHrMemberForm.optionsFor). */
export type OptionsKey = 'themes' | 'labs' | 'projectCodes' | 'projectTitles' | 'qualifications' | 'disciplines' | 'genders' | 'roles' | 'commissions' | 'organizations' | 'yesNo';

export interface FieldDef {
  /** Unique per field on screen (two fields may edit the same `name`, e.g. Project Code / Project Title). */
  id: string;
  name: keyof HrFormValues;
  label: string;
  component: 'text' | 'select' | 'date' | 'textarea' | 'image' | 'checkbox' | 'file' | 'spacer';
  inputType?: 'text' | 'email' | 'tel' | 'number';
  icon?: LucideIcon;
  placeholder: string;
  optionsKey?: OptionsKey;
  /** Disabled until this value is filled (Theme -> Lab -> Project cascade). */
  dependsOn?: keyof HrFormValues;
  /** With `dependsOn`: disabled unless that field equals exactly this (e.g. 'yes' = its checkbox is ticked). */
  dependsOnValue?: string;
  dependsHint?: string;
  emptyHint?: string;
  /** Small unit label shown inside the input, e.g. "months". */
  suffix?: string;
  /** How the value is shown on the Review step and the View page. */
  format?: 'date' | 'currency' | 'months';
  maxLength?: number;
  /** 'full' = whole row, 2 = two columns wide. */
  span?: 'full' | 2;
  /** `checkbox`: text next to the box. */
  checkboxText?: string;
  /** `file`: allowed extensions, and the field that stores the original file name. */
  accept?: string;
  fileNameKey?: keyof HrFormValues;
  /** `date`: years offered in the picker, e.g. [1950, 2010] for a date of birth. */
  yearRange?: [number, number];
  visibleFor?: HrType[];
}

export interface FormGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  columns: 1 | 2 | 3 | 4;
  /** Extra classes for the card itself, e.g. 'lg:col-span-2' when the step lays its cards out in a grid. */
  className?: string;
  /** 'hrType' renders the HR-type radio instead of fields. */
  kind?: 'hrType';
  fields: FieldDef[];
  visibleFor?: HrType[];
}

export interface FormStep {
  id: string;
  title: string;
  icon: LucideIcon;
  groups: FormGroup[];
  /** Grid classes to lay this step's cards side by side instead of stacking them, e.g. 'lg:grid-cols-3'. */
  layout?: string;
  visibleFor?: HrType[];
}

/** `visibleFor` omitted = shown for both HR types. */
export const isVisibleFor = (item: { visibleFor?: HrType[] }, hrType: HrType): boolean => !item.visibleFor || item.visibleFor.includes(hrType);

const C = [HR_TYPES.CONTRACTUAL];
const S = [HR_TYPES.STRATEGIC];

const firstName = (id: string): FieldDef => ({ id, name: 'firstName', label: 'First Name', component: 'text', icon: User, placeholder: 'First name' });
const lastName = (id: string): FieldDef => ({ id, name: 'lastName', label: 'Last Name', component: 'text', icon: User, placeholder: 'Last name' });
const cnic = (id: string): FieldDef => ({ id, name: 'cnic', label: 'CNIC / ID', component: 'text', icon: CreditCard, placeholder: '12345-1234567-1' });
const photo = (id: string): FieldDef => ({ id, name: 'photo', label: 'Profile Photo', component: 'image', icon: Camera, placeholder: '', span: 'full' });
const email = (id: string): FieldDef => ({ id, name: 'email', label: 'Email Address', component: 'text', inputType: 'email', icon: Mail, placeholder: 'name@example.com' });
const phone = (id: string): FieldDef => ({ id, name: 'phone', label: 'Contact #', component: 'text', inputType: 'tel', icon: Phone, placeholder: '+92 300 1234567' });
const hrTypeGroup = (): FormGroup => ({ id: 'type', title: 'HR Type', icon: Users, columns: 1, kind: 'hrType', fields: [] });

/** Empty grid cell (keeps the checkbox / date / upload columns aligned). */
const spacer = (id: string): FieldDef => ({ id, name: 'name', label: '', component: 'spacer', placeholder: '' });
const dateOfJoining = (id: string): FieldDef => ({ id, name: 'dateOfJoining', label: 'Date of Joining', component: 'date', icon: CalendarDays, placeholder: 'Select date' });
const remarks = (id: string): FieldDef => ({ id, name: 'remarks', label: 'Remarks', component: 'textarea', placeholder: 'Add any remarks (optional)', maxLength: 300, span: 'full' });

/**
 * ONE definition drives the multi-step form, the review step AND the view page.
 * Step -> Groups (heading) -> Fields. Edit `visibleFor` to change what each HR type sees.
 * NOTE: no field is `required` right now - add `required: true` here later if needed.
 */
export const HR_FORM_STEPS: FormStep[] = [
  {
    id: 'basic', title: 'Basic', icon: User, visibleFor: C,
    layout: 'lg:grid-cols-3', // Personal (2/3) beside Education (1/3)
    groups: [
      hrTypeGroup(),
      {
        // Row 1 = who they are, row 2 = identity + phone, row 3 = e-mail.
        id: 'basicInfo', title: 'Personal & Contact Details', icon: User, columns: 3, className: 'lg:col-span-2',
        fields: [
          photo('photo'),
          firstName('firstName'),
          lastName('lastName'),
          { id: 'gender', name: 'gender', label: 'Gender', component: 'select', icon: User, placeholder: 'Select', optionsKey: 'genders' },
          { id: 'dob', name: 'dob', label: 'Date of Birth', component: 'date', icon: Cake, placeholder: 'Select date', yearRange: [1950, new Date().getFullYear()] },
          cnic('cnic'),
          phone('phone'),
          { ...email('email'), span: 'full' },
        ],
      },
      {
        // Everything about their education together: qualification, then its field of study, then the CV.
        id: 'education', title: 'Education & CV', icon: GraduationCap, columns: 1,
        fields: [
          { id: 'qualification', name: 'qualification', label: 'Qualification', component: 'select', icon: GraduationCap, placeholder: 'Select qualification', optionsKey: 'qualifications' },
          { id: 'discipline', name: 'discipline', label: 'Field of Study', component: 'select', icon: GraduationCap, placeholder: 'Select field of study', optionsKey: 'disciplines' },
          { id: 'cv', name: 'cv', label: 'CV', component: 'file', icon: FileText, placeholder: 'Upload CV', accept: '.pdf,.doc,.docx', fileNameKey: 'cvName' },
        ],
      },
    ],
  },
  {
    id: 'projectLab', title: 'Lab', icon: FlaskConical, visibleFor: C,
    groups: [
      {
        id: 'themeLab', title: 'Technology Theme & Lab', icon: Layers, columns: 2,
        fields: [
          { id: 'technologyTheme', name: 'technologyTheme', label: 'Technology Theme', component: 'select', icon: Settings, placeholder: 'Select technology theme', optionsKey: 'themes' },
          { id: 'lab', name: 'lab', label: 'Lab', component: 'select', icon: FlaskConical, placeholder: 'Select lab', optionsKey: 'labs', dependsOn: 'technologyTheme', dependsHint: 'Select a theme first', emptyHint: 'No labs in this theme' },
        ],
      },
      {
        id: 'project', title: 'Project Details', icon: FolderOpen, columns: 3,
        fields: [
          { id: 'projectCode', name: 'projectId', label: 'Project Code', component: 'select', icon: Hash, placeholder: 'Select project code', optionsKey: 'projectCodes', dependsOn: 'lab', dependsHint: 'Select a lab first', emptyHint: 'No active projects in this lab' },
          { id: 'projectTitle', name: 'projectId', label: 'Project Title', component: 'select', icon: FolderOpen, placeholder: 'Select project title', optionsKey: 'projectTitles', dependsOn: 'lab', dependsHint: 'Select a lab first', emptyHint: 'No active projects in this lab' },
          { id: 'projectDuration', name: 'projectDuration', label: 'Project Duration', component: 'text', inputType: 'number', icon: Clock, placeholder: 'Months', suffix: 'months', format: 'months' },
        ],
      },
    ],
  },
  {
    // Each status is a tick box (ticked = Yes, empty = No) with ITS OWN date (and, for the LOA, its document) on the same row.
    // The date / upload stay disabled until the box is ticked.
    id: 'appointment', title: 'Appointment', icon: UserCheck, visibleFor: C,
    groups: [
      {
        id: 'appointmentStatus', title: 'Appointment Status', icon: CheckCircle2, columns: 3,
        fields: [
          { id: 'selected', name: 'selected', label: 'Selection Status', component: 'checkbox', checkboxText: 'Selected', icon: UserCheck, placeholder: '' },
          { id: 'selectedDate', name: 'selectedDate', label: 'Selection Date', component: 'date', icon: CalendarDays, placeholder: 'Select date', dependsOn: 'selected', dependsOnValue: 'yes', dependsHint: 'Tick "Selected" first' },
          spacer('sp1'),
          { id: 'loaIssued', name: 'loaIssued', label: 'LOA Status', component: 'checkbox', checkboxText: 'LOA Issued', icon: FileCheck2, placeholder: '' },
          { id: 'loaIssuedDate', name: 'loaIssuedDate', label: 'LOA Issued Date', component: 'date', icon: CalendarDays, placeholder: 'Select date', dependsOn: 'loaIssued', dependsOnValue: 'yes', dependsHint: 'Tick "LOA Issued" first' },
          { id: 'loaFile', name: 'loaFile', label: 'LOA Document', component: 'file', icon: Upload, placeholder: 'Upload LOA', accept: '.pdf,.doc,.docx', fileNameKey: 'loaFileName', dependsOn: 'loaIssued', dependsOnValue: 'yes', dependsHint: 'Tick "LOA Issued" first' },
          { id: 'joined', name: 'joined', label: 'Joining Status', component: 'checkbox', checkboxText: 'Joined', icon: CheckCircle2, placeholder: '' },
          // Always selectable: if "Joined" is No, this is the date they are expected to join.
          { ...dateOfJoining('dateOfJoining'), label: 'Joining Date' },
          spacer('sp2'),
        ],
      },
    ],
  },
  {
    id: 'contract', title: 'Contract', icon: Banknote, visibleFor: C,
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
  // Strategic HR: ONE single-page form (no stepper, no review) - Commission first, then an Organization from that commission.
  {
    id: 'strategic', title: 'Strategic HR', icon: Building2, visibleFor: S,
    layout: 'lg:grid-cols-3', // Personal (2/3) beside Role & Organization (1/3)
    groups: [
      hrTypeGroup(),
      {
        id: 'personalS', title: 'Personal & Contact Details', icon: User, columns: 3, className: 'lg:col-span-2',
        fields: [photo('photoS'), firstName('firstNameS'), lastName('lastNameS'), cnic('cnicS'), { ...email('emailS'), span: 2 }, phone('phoneS')],
      },
      {
        // Role first, then pick the commission, then one of ITS organizations.
        id: 'orgS', title: 'Role & Organization', icon: Building2, columns: 1,
        fields: [
          { id: 'role', name: 'role', label: 'Role', component: 'select', icon: UserCheck, placeholder: 'Select role', optionsKey: 'roles' },
          { id: 'commission', name: 'commission', label: 'Commission', component: 'select', icon: Building2, placeholder: 'Select commission', optionsKey: 'commissions' },
          { id: 'organization', name: 'organization', label: 'Organization', component: 'select', icon: Building2, placeholder: 'Select organization', optionsKey: 'organizations', dependsOn: 'commission', dependsHint: 'Select a commission first', emptyHint: 'No organizations in this commission' },
        ],
      },
    ],
  },
];

export const REVIEW_STEP = { id: 'review', title: 'Review', icon: ClipboardCheck } as const;
