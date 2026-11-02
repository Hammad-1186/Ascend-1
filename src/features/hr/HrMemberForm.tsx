import type { FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { cn } from '../../lib';
import SectionCard from '../../components/ui/SectionCard';
import Button from '../../components/ui/Button';
import Stepper from '../../components/ui/Stepper';
import RadioCardGroup from '../../components/form/RadioCardGroup';
import FormFieldRenderer from '../../components/form/FormFieldRenderer';
import { EMPTY_DISPLAY, getFieldDisplay } from './hrFormat';
import { HR_TYPE_OPTIONS, hrTypeLabel, type FormGroup } from './hrFormConfig';
import type { HrMemberFormApi } from './useHrMemberForm';
import type { HrCatalog, HrType } from '../../types/hr';

export const HR_FORM_ID = 'hr-member-form';
const COLUMNS = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' } as const;

interface Props {
  form: HrMemberFormApi;
  catalog: HrCatalog;
  mode: 'create' | 'edit';
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Multi-step, fixed-height form: every step shows one screen of grouped fields, so the form never scrolls.
 * Presentational - all state lives in useHrMemberForm.
 */
export default function HrMemberForm({ form, catalog, mode, saving, onSubmit, onCancel }: Props) {
  const { stepItems, stepIndex, isReview, currentStep } = form;
  const isFirst = stepIndex === 0;

  // Enter inside an input moves to the next step instead of saving early.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReview) onSubmit();
    else form.goNext();
  };

  const renderGroup = (g: FormGroup) => (
    <SectionCard key={g.id} title={g.title} icon={g.icon} aside={g.showProjectHint ? form.projectHint : undefined}>
      {g.kind === 'hrType' ? (
        <RadioCardGroup<HrType> name="hrType" options={HR_TYPE_OPTIONS as Array<{ value: HrType; label: string }>} value={form.hrType} onChange={form.setHrType} />
      ) : (
        <div className={cn('grid grid-cols-1 gap-x-5 gap-y-3', COLUMNS[g.columns])}>
          {g.fields.map((f) => (
            <FormFieldRenderer
              key={f.id}
              field={f}
              value={form.values[f.name]}
              error={form.errors[f.id]}
              options={form.optionsFor(f)}
              disabled={form.isDisabled(f)}
              placeholder={form.placeholderFor(f)}
              onChange={form.setValue}
              className={f.span === 'full' ? 'md:col-span-full' : ''}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );

  return (
    <form id={HR_FORM_ID} onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col gap-3">
      <Stepper steps={stepItems} current={stepIndex} maxReached={form.maxStep} onSelect={form.goTo} />

      {/* Fixed-height body: one step per screen, nothing scrolls. */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto md:overflow-hidden">
        {isReview ? <ReviewStep form={form} catalog={catalog} /> : currentStep?.groups.map(renderGroup)}
      </div>

      <footer className="flex items-center gap-2 border-t border-line pt-3 sm:gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <span className="ml-auto md:hidden" />
        <span className="ml-auto hidden text-sm text-muted md:inline">Step {stepIndex + 1} of {stepItems.length}</span>
        <Button variant="outline" icon={ChevronLeft} onClick={form.goPrev} disabled={isFirst}>Previous</Button>
        {isReview ? (
          <Button type="submit" icon={Save} disabled={saving}><span className="sm:hidden">{saving ? 'Saving…' : 'Save'}</span><span className="hidden sm:inline">{saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Save HR Record'}</span></Button>
        ) : (
          <Button type="submit" disabled={saving}>Next <ChevronRight size={16} /></Button>
        )}
      </footer>
    </form>
  );
}

/** Last step: read-only summary, one card per previous step. Values are single-line (truncated, full text on hover). */
function ReviewStep({ form, catalog }: { form: HrMemberFormApi; catalog: HrCatalog }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {form.steps.map((step, i) => (
        <SectionCard key={step.id} title={step.title} icon={step.icon} aside={
          <button type="button" onClick={() => form.goTo(i)} className="text-info hover:underline">Edit</button>
        }>
          <dl className="divide-y divide-line/60 text-sm">
            {step.groups.flatMap((g) =>
              g.kind === 'hrType'
                ? [<ReviewRow key={g.id} label="HR Type" value={hrTypeLabel(form.hrType)} />]
                : g.fields.map((f) => <ReviewRow key={f.id} label={f.label} value={getFieldDisplay(f, form.values, catalog)} />),
            )}
          </dl>
        </SectionCard>
      ))}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd title={value} className={cn('min-w-0 truncate text-right font-medium', value === EMPTY_DISPLAY && 'text-muted')}>{value}</dd>
    </div>
  );
}
