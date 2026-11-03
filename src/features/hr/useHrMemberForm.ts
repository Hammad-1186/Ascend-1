import { useCallback, useMemo, useState } from 'react';
import {
  HR_FORM_STEPS, HR_TYPES, REVIEW_STEP, YES_NO_OPTIONS, isVisibleFor, type FieldDef, type FormStep,
} from './hrFormConfig';
import {
  EMPTY_FORM_VALUES, isActiveProject, type HrCatalog, type HrFormValues, type HrMember, type HrMemberInput, type HrType, type SelectOption,
} from '../../types/hr';

export type FieldErrors = Record<string, string | undefined>;
export interface StepItem { id: string; title: string; icon: FormStep['icon'] }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Steps/groups/fields that apply to the chosen HR type. Empty groups and steps are dropped. */
function buildSteps(hrType: HrType): FormStep[] {
  return HR_FORM_STEPS
    .filter((s) => isVisibleFor(s, hrType))
    .map((s) => ({
      ...s,
      groups: s.groups
        .filter((g) => isVisibleFor(g, hrType))
        .map((g) => ({ ...g, fields: g.fields.filter((f) => isVisibleFor(f, hrType)) }))
        .filter((g) => g.kind === 'hrType' || g.fields.length > 0),
    }))
    .filter((s) => s.groups.length > 0);
}

const FIELD_NAME_BY_ID: Record<string, keyof HrFormValues> = Object.fromEntries(
  HR_FORM_STEPS.flatMap((s) => s.groups.flatMap((g) => g.fields.map((f) => [f.id, f.name]))),
);

const fieldsOf = (step: FormStep): FieldDef[] => step.groups.flatMap((g) => g.fields);

interface Args { catalog: HrCatalog | null; initial?: HrMember }

export function useHrMemberForm({ catalog, initial }: Args) {
  const [hrType, setHrTypeState] = useState<HrType>(initial?.hrType ?? HR_TYPES.CONTRACTUAL);
  const [values, setValues] = useState<HrFormValues>(() => {
    if (!initial) return EMPTY_FORM_VALUES;
    const { id: _id, hrType: _type, ...rest } = initial;
    const merged = { ...EMPTY_FORM_VALUES, ...rest };
    // Records that only carry a full `name` (older API data): split it so both name fields are filled when editing.
    if (!merged.firstName && !merged.lastName && merged.name) {
      const [first, ...others] = merged.name.trim().split(/\s+/);
      merged.firstName = first;
      merged.lastName = others.join(' ');
    }
    return merged;
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const unlockAll = Boolean(initial); // editing: every step is reachable straight away

  const steps = useMemo(() => buildSteps(hrType), [hrType]);
  // Strategic HR is a single form: no stepper and no Review step. Contractual HR gets steps + Review.
  const hasReview = hrType !== HR_TYPES.STRATEGIC;
  const stepItems: StepItem[] = useMemo(
    () => [...steps.map(({ id, title, icon }) => ({ id, title, icon })), ...(hasReview ? [REVIEW_STEP] : [])],
    [steps, hasReview],
  );
  const isSingleStep = stepItems.length === 1;
  const isReview = hasReview && stepIndex === stepItems.length - 1;
  const currentStep: FormStep | null = isReview ? null : steps[stepIndex];

  // ---- values & the Theme -> Lab -> Project cascade ----------------------------------------
  const setValue = useCallback((name: keyof HrFormValues, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'commission') next.organization = '';
      if (name === 'technologyTheme') { next.lab = ''; next.projectId = ''; next.projectDuration = ''; }
      if (name === 'lab') { next.projectId = ''; next.projectDuration = ''; }
      if (name === 'projectId') {
        const project = catalog?.projects.find((p) => p.id === value);
        next.projectDuration = project ? String(project.durationMonths) : '';
      }
      return next;
    });
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => FIELD_NAME_BY_ID[id] !== name)));
  }, [catalog]);

  const setHrType = (type: HrType) => {
    if (type === hrType) return;
    const keep = new Set(buildSteps(type).flatMap((s) => fieldsOf(s).map((f) => f.name)));
    // Clear values of fields that are now hidden so they never reach the API.
    setValues((v) => Object.fromEntries(Object.entries(v).map(([k, val]) => [k, keep.has(k as keyof HrFormValues) ? val : ''])) as unknown as HrFormValues);
    setHrTypeState(type);
    setErrors({});
    setMaxStep(0);
    setStepIndex(0);
  };

  // ---- dropdown options ---------------------------------------------------------------------
  const activeProjects = useMemo(
    () => (catalog?.projects ?? []).filter((p) => p.labId === values.lab && (isActiveProject(p) || p.id === values.projectId)),
    [catalog, values.lab, values.projectId],
  );

  const optionsFor = (field: FieldDef): SelectOption[] => {
    if (!catalog) return [];
    switch (field.optionsKey) {
      case 'themes': return catalog.themes.map((t) => ({ value: t.id, label: t.name }));
      case 'labs': return catalog.labs.filter((l) => l.themeId === values.technologyTheme).map((l) => ({ value: l.id, label: l.name }));
      case 'projectCodes': return activeProjects.map((p) => ({ value: p.id, label: p.code }));
      case 'projectTitles': return activeProjects.map((p) => ({ value: p.id, label: p.title }));
      case 'qualifications': return catalog.qualifications;
      case 'commissions': return catalog.commissions;
      case 'organizations': return catalog.organizations.filter((o) => o.commissionId === values.commission);
      case 'yesNo': return YES_NO_OPTIONS;
      default: return [];
    }
  };

  const isDisabled = (field: FieldDef): boolean => Boolean(field.dependsOn && !values[field.dependsOn]);
  const placeholderFor = (field: FieldDef): string => {
    if (isDisabled(field)) return field.dependsHint ?? field.placeholder;
    if (field.dependsOn && optionsFor(field).length === 0) return field.emptyHint ?? field.placeholder;
    return field.placeholder;
  };

  // ---- validation (formats only - nothing is required) -------------------------------------
  const validateFields = (fields: FieldDef[]): FieldErrors => {
    const out: FieldErrors = {};
    fields.forEach((f) => {
      const v = values[f.name].trim();
      if (!v) return;
      if (f.inputType === 'email' && !EMAIL_RE.test(v)) out[f.id] = 'Enter a valid email address';
      if (f.inputType === 'number' && (Number.isNaN(Number(v)) || Number(v) < 0)) out[f.id] = 'Enter a positive number';
    });
    return out;
  };

  // ---- step navigation ---------------------------------------------------------------------
  const goNext = () => {
    if (!currentStep) return;
    const found = validateFields(fieldsOf(currentStep));
    setErrors(found);
    if (Object.keys(found).length) return;
    const next = Math.min(stepIndex + 1, stepItems.length - 1);
    setStepIndex(next);
    setMaxStep((m) => Math.max(m, next));
  };
  const goPrev = () => setStepIndex((i) => Math.max(i - 1, 0));
  const goTo = (i: number) => { if (unlockAll || i <= maxStep) setStepIndex(i); };

  /** Validates every step; jumps to the first one with an error. */
  const validateAll = (): boolean => {
    const found = validateFields(steps.flatMap(fieldsOf));
    setErrors(found);
    const bad = steps.findIndex((s) => fieldsOf(s).some((f) => found[f.id]));
    if (bad >= 0) setStepIndex(bad);
    return bad < 0;
  };

  /** Request body: only visible fields. Rename keys here if the API expects different names. */
  const buildPayload = (): HrMemberInput => {
    const payload: HrMemberInput = { ...EMPTY_FORM_VALUES, hrType };
    steps.flatMap(fieldsOf).forEach((f) => { payload[f.name] = values[f.name].trim(); });
    payload.name = [payload.firstName, payload.lastName].filter(Boolean).join(' '); // full name = first + last
    return payload;
  };

  return {
    hrType, setHrType, values, errors, setValue,
    steps, stepItems, stepIndex, maxStep: unlockAll ? stepItems.length - 1 : maxStep, currentStep, isReview,
    goNext, goPrev, goTo, validateAll, buildPayload,
    optionsFor, isDisabled, placeholderFor, isSingleStep,
  };
}

export type HrMemberFormApi = ReturnType<typeof useHrMemberForm>;
