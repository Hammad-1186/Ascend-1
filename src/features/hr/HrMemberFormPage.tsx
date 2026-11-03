import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Save } from 'lucide-react';
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
  const [notice, setNotice] = useState('');
  // Once the first save has happened, every later save updates that record instead of creating a duplicate.
  const [savedId, setSavedId] = useState<string | undefined>(member?.id);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  /** Validate formats, store everything filled so far, then run `after`. */
  const save = async (after: () => void) => {
    if (!form.validateAll()) return;
    setSaving(true);
    setSubmitError('');
    setNotice('');
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

  const handleSaveStep = () => save(() => setNotice('Saved. Continue now or finish later.'));
  // Final save (Strategic HR: the only Save; Contractual HR: Save Record on Review). Goes back to the HR Directory
  // table, which shows the success message.
  const handleSaveRecord = () => save(() => navigate('/people', {
    state: { notice: mode === 'edit' ? 'HR record updated successfully.' : 'HR record added successfully.' },
  }));
  const isFinalSave = form.isReview || form.isSingleStep;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 py-3 sm:px-6 sm:py-4">
      <PageHeader
        backTo="/people"
        backLabel="Back to HR Directory"
        title={mode === 'edit' ? 'Edit HR' : 'Add HR'}
        actions={
          <>
            {notice && (
              <span role="status" className="inline-flex items-center gap-1.5 text-base font-medium text-success">
                <CheckCircle2 size={18} /> {notice}
              </span>
            )}
            <Button variant="outline" onClick={() => navigate('/people')}>Cancel</Button>
            {/* Contractual: Save keeps what is filled so far; on Review it becomes Save Record. Strategic: always Save Record. */}
            <Button icon={Save} disabled={saving} onClick={isFinalSave ? handleSaveRecord : handleSaveStep}>
              {saving ? 'Saving…' : isFinalSave ? 'Save Record' : 'Save'}
            </Button>
          </>
        }
      />
      {submitError && <p className="mb-2 text-base text-danger">{submitError}</p>}
      <HrMemberForm form={form} catalog={catalog} saving={saving} onSubmit={handleSaveRecord} />
    </div>
  );
}
