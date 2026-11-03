import type { FormEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  /** Pressing Enter on the Review step. (Save / Cancel buttons live in the page header.) */
  onSubmit: () => void;
}

/**
 * Multi-step form (Strategic HR: one single page, no stepper / review). Stepper on top (left-aligned, hidden on Review), the step's cards, and Previous / Next right
 * under the last card. The Review step is the same summary as the View page.
 * Presentational - all state lives in useHrMemberForm; Save / Cancel are in the page header (HrMemberFormPage).
 */
export default function HrMemberForm({ form, catalog, saving, onSubmit }: Props) {
  const { stepItems, stepIndex, isReview, currentStep } = form;
  const isFirst = stepIndex === 0;

  // Enter inside an input moves to the next step instead of saving early.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReview || form.isSingleStep) onSubmit(); // Strategic HR has one page: Enter saves it
    else form.goNext();
  };

  // The Review step shows the unsaved values through the exact component the View page uses.
  const draft: HrMember = { id: 'draft', ...form.buildPayload() };

  const renderGroup = (g: FormGroup) => (
    <SectionCard key={g.id} title={g.title}>
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
      {!isReview && !form.isSingleStep && <Stepper steps={stepItems} current={stepIndex} maxReached={form.maxStep} onSelect={form.goTo} />}

      {/* Only this area scrolls, and only if a step is taller than the screen. */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-2">
        {isReview ? <MemberOverview member={draft} catalog={catalog} /> : currentStep?.groups.map(renderGroup)}

        {/* Right after the last card, not pinned to the bottom of the screen. */}
        {!form.isSingleStep && (
          <div className="flex items-center justify-between gap-3 pt-1">
            {isFirst ? <span /> : <Button variant="outline" icon={ChevronLeft} onClick={form.goPrev}>Previous</Button>}
            {!isReview && <Button type="submit" disabled={saving}>Next <ChevronRight size={16} /></Button>}
          </div>
        )}
      </div>
    </form>
  );
}
