import type { FormEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib';
import SectionCard from '../../components/ui/SectionCard';
import Button from '../../components/ui/Button';
import Stepper from '../../components/ui/Stepper';
import RadioCardGroup from '../../components/form/RadioCardGroup';
import FormFieldRenderer from '../../components/form/FormFieldRenderer';
import MemberOverview from './MemberOverview';
import { HR_TYPE_OPTIONS, type FieldDef, type FormGroup } from './hrFormConfig';
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
 * Multi-step form (Strategic HR: one single page, no stepper / review). HR Type card, then the stepper (shown on every step incl. Review), the step's cards, and Previous / Next right
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

  const renderField = (f: FieldDef, className?: string) => (
    <FormFieldRenderer
      key={f.id}
      field={f}
      value={form.values[f.name]}
      error={form.errors[f.id]}
      options={form.optionsFor(f)}
      disabled={form.isDisabled(f)}
      placeholder={form.placeholderFor(f)}
      onChange={form.setValue}
      className={className}
    />
  );

  const renderGroup = (g: FormGroup) => {
    const photoField = g.fields.find((f) => f.component === 'image');
    const fields = g.fields.filter((f) => f !== photoField);
    // HR Type is one slim bar (title + radios on a single line) instead of a tall card, to keep the page short.
    if (g.kind === 'hrType') {
      return (
        <section key={g.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg border border-line bg-surface px-4 py-1.5">
          <h2 className="text-base font-semibold">{g.title}</h2>
          <RadioCardGroup<HrType> name="hrType" options={HR_TYPE_OPTIONS as Array<{ value: HrType; label: string }>} value={form.hrType} onChange={form.setHrType} />
        </section>
      );
    }
    return (
    <SectionCard key={g.id} title={g.title}>
      {(
        <div className={cn(photoField && 'flex flex-col gap-5 md:flex-row')}>
          {/* The photo sits beside the fields (not on its own row) so the page stays short enough not to scroll. */}
          {photoField && <div className="shrink-0">{renderField(photoField)}</div>}
          <div className={cn('grid min-w-0 grid-cols-1 gap-x-5 gap-y-4', photoField ? cn('flex-1 md:grid-cols-2 lg:grid-cols-3', g.columns === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3') : COLUMNS[g.columns])}>
            {fields.map((f) => renderField(f, f.span === 'full' ? 'md:col-span-full' : ''))}
          </div>
        </div>
      )}
    </SectionCard>
    );
  };

  // The HR Type card (first step only) sits ABOVE the stepper, so switching Contractual <-> Strategic never moves it.
  const typeGroup = isReview ? undefined : currentStep?.groups.find((g) => g.kind === 'hrType');
  const otherGroups = currentStep?.groups.filter((g) => g.kind !== 'hrType') ?? [];

  return (
    <form id={HR_FORM_ID} onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col gap-2.5">
      {typeGroup && renderGroup(typeGroup)}
      {!form.isSingleStep && (
        <Stepper
          steps={stepItems}
          current={stepIndex}
          maxReached={form.maxStep}
          onSelect={form.goTo}
          trailing={
            // Previous / Next live in the stepper bar, so there is no extra button row under the cards.
            <>
              {!isFirst && <Button variant="outline" icon={ChevronLeft} onClick={form.goPrev} className="!px-3 !py-1.5 text-sm">Previous</Button>}
              {!isReview && <Button type="submit" disabled={saving} className="!px-4 !py-1.5 text-sm">Next <ChevronRight size={16} /></Button>}
            </>
          }
        />
      )}

      {/* Scrolls only on very short screens; the steps are sized to fit without it. */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto">
        {isReview ? <MemberOverview member={draft} catalog={catalog} /> : otherGroups.map(renderGroup)}

      </div>
    </form>
  );
}
