import type { FormEvent } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { cn } from '../../lib';
import SectionCard from '../../components/ui/SectionCard';
import Button from '../../components/ui/Button';
import Stepper from '../../components/ui/Stepper';
import RadioCardGroup from '../../components/form/RadioCardGroup';
import FormFieldRenderer from '../../components/form/FormFieldRenderer';
import MemberOverview from './MemberOverview';
import { HR_TYPE_OPTIONS, type FormGroup } from './hrFormConfig';
import type { HrMemberFormApi } from './useHrMemberForm';
import type { HrCatalog, HrMember, HrType } from '../../types/hr';

export const HR_FORM_ID = 'hr-member-form';
const COLUMNS = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' } as const;

interface Props {
  form: HrMemberFormApi;
  catalog: HrCatalog;
  saving: boolean;
  /** Short confirmation after a mid-form save, e.g. "Saved". */
  notice?: string;
  /** Save button on every step: stores what is filled so far and stays on the step. */
  onSaveStep: () => void;
  /** Review step: save the finished record and leave the form. */
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Multi-step form: one screen of grouped fields per step, a Save button on every step, and a Review step that is the
 * same summary as the View page. Presentational - all state lives in useHrMemberForm.
 */
export default function HrMemberForm({ form, catalog, saving, notice, onSaveStep, onSubmit, onCancel }: Props) {
  const { stepItems, stepIndex, isReview, currentStep } = form;
  const isFirst = stepIndex === 0;

  // Enter inside an input moves to the next step instead of saving early.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReview) onSubmit();
    else form.goNext();
  };

  // The Review step shows the unsaved values through the exact component the View page uses.
  const draft: HrMember = { id: 'draft', ...form.buildPayload() };

  const renderGroup = (g: FormGroup) => (
    <SectionCard key={g.id} title={g.title} icon={g.icon} aside={g.showProjectHint ? form.projectHint : undefined}>
      {g.kind === 'hrType' ? (
        <RadioCardGroup<HrType> name="hrType" options={HR_TYPE_OPTIONS as Array<{ value: HrType; label: string }>} value={form.hrType} onChange={form.setHrType} />
      ) : (
        <div className={cn('grid grid-cols-1 gap-x-5 gap-y-4', COLUMNS[g.columns])}>
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

      {/* Only this area scrolls (and only if a step is taller than the screen); stepper and buttons stay in view. */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {isReview ? <MemberOverview member={draft} catalog={catalog} /> : currentStep?.groups.map(renderGroup)}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-line pt-3 sm:gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        {notice && (
          <span role="status" className="inline-flex items-center gap-1.5 text-base font-medium text-emerald-400">
            <CheckCircle2 size={18} /> {notice}
          </span>
        )}
        <span className="ml-auto hidden text-base text-muted md:inline">Step {stepIndex + 1} of {stepItems.length}</span>
        <span className="ml-auto md:hidden" />
        <Button variant="outline" icon={ChevronLeft} onClick={form.goPrev} disabled={isFirst}>Previous</Button>
        {isReview ? (
          <Button type="submit" icon={Save} disabled={saving}>
            <span className="sm:hidden">{saving ? 'Saving…' : 'Save'}</span>
            <span className="hidden sm:inline">{saving ? 'Saving…' : 'Save Record'}</span>
          </Button>
        ) : (
          <>
            <Button variant="outline" icon={Save} onClick={onSaveStep} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            <Button type="submit" disabled={saving}>Next <ChevronRight size={16} /></Button>
          </>
        )}
      </footer>
    </form>
  );
}
