import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button, { buttonClasses } from '../../components/ui/Button';
import HrMemberForm from './HrMemberForm';
import { useHrMemberForm } from './useHrMemberForm';
import { useHrCatalog } from './useHrCatalog';
import { hrService } from './hrService';
import type { HrCatalog, HrMember } from '../../types/hr';

type Status = 'loading' | 'ready' | 'missing';

/** Handles both /people/new (create) and /people/:id/edit (edit). */
export default function HrMemberFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const { catalog } = useHrCatalog();
  const [member, setMember] = useState<HrMember | undefined>();
  const [status, setStatus] = useState<Status>(mode === 'edit' ? 'loading' : 'ready');

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    let live = true;
    hrService.getMember(id).then((m) => {
      if (!live) return;
      setMember(m);
      setStatus(m ? 'ready' : 'missing');
    }).catch(() => live && setStatus('missing'));
    return () => { live = false; };
  }, [mode, id]);

  if (status === 'missing') {
    return (
      <div className="grid h-full place-items-center px-6">
        <div className="text-center">
          <p className="mb-4 text-muted">This HR member could not be found.</p>
          <Link to="/people" className={buttonClasses('primary')}>Back to HR Directory</Link>
        </div>
      </div>
    );
  }
  if (!catalog || status === 'loading') return <div className="grid h-full place-items-center text-muted">Loading…</div>;

  // Mounted only once data is ready so the form hook starts with the right initial values.
  return <FormContainer mode={mode} catalog={catalog} member={member} />;
}

function FormContainer({ mode, catalog, member }: { mode: 'create' | 'edit'; catalog: HrCatalog; member?: HrMember }) {
  const navigate = useNavigate();
  const form = useHrMemberForm({ catalog, initial: member });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // Once the first save has happened, every later save updates that record instead of creating a duplicate.
  const [savedId, setSavedId] = useState<string | undefined>(member?.id);

  /** Validate formats, store everything filled so far, then run `after`. */
  const save = async (after: () => void) => {
    if (!form.validateAll()) return;
    setSaving(true);
    setSubmitError('');
    try {
      const payload = form.buildPayload();
      const saved = savedId ? await hrService.updateMember(savedId, payload) : await hrService.createMember(payload);
      setSavedId(saved.id);
      after();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  // Save works on ANY step: whatever is filled so far is stored right away, then we go back to the HR Directory
  // table where the record is listed and the success message is shown. The full details can be completed later via Edit.
  const handleSave = () => save(() => navigate('/people', {
    state: { notice: mode === 'edit' ? 'HR record updated successfully.' : 'HR record added successfully.' },
  }));
  const isFinalSave = form.isReview || form.isSingleStep;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 py-2 sm:px-6 sm:py-3">
      <PageHeader
        backTo="/people"
        backLabel="Back to HR Directory"
        title={mode === 'edit' ? 'Edit HR' : 'Add HR'}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/people')}>Cancel</Button>
            {/* Saves immediately on any step and returns to the table ("Save Record" on the last page). */}
            <Button icon={Save} disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : isFinalSave ? 'Save Record' : 'Save'}
            </Button>
          </>
        }
      />
      {submitError && <p className="mb-2 text-base text-danger">{submitError}</p>}
      <HrMemberForm form={form} catalog={catalog} saving={saving} onSubmit={handleSave} />
    </div>
  );
}
