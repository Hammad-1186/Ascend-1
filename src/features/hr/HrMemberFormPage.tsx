import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { buttonClasses } from '../../components/ui/Button';
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

  const handleSave = async () => {
    if (!form.validateAll()) return;
    setSaving(true);
    setSubmitError('');
    try {
      const payload = form.buildPayload();
      const saved = mode === 'edit' && member ? await hrService.updateMember(member.id, payload) : await hrService.createMember(payload);
      navigate(`/people/${saved.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  const backTo = member ? `/people/${member.id}` : '/people';

  return (
    // h-full + overflow-hidden: the page itself never scrolls either.
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 py-4">
      <PageHeader
        backTo="/people"
        backLabel="Back to HR Directory"
        icon={User}
        title={mode === 'edit' ? 'Edit HR Member' : 'Add HR Member'}
        subtitle="ASCEND LAB SYSTEMS - HR MANAGEMENT"
      />
      {submitError && <p className="mb-2 text-sm text-danger">{submitError}</p>}
      <HrMemberForm form={form} catalog={catalog} mode={mode} saving={saving} onSubmit={handleSave} onCancel={() => navigate(backTo)} />
    </div>
  );
}
