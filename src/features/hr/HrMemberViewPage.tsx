import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pencil, User } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { buttonClasses } from '../../components/ui/Button';
import MemberOverview from './MemberOverview';
import { useHrCatalog } from './useHrCatalog';
import { hrService } from './hrService';
import type { HrCatalog, HrMember } from '../../types/hr';

export default function HrMemberViewPage() {
  const { id } = useParams();
  const { catalog } = useHrCatalog();
  const [member, setMember] = useState<HrMember | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let live = true;
    hrService.getMember(id).then((m) => { if (live) { setMember(m); setLoaded(true); } }).catch(() => live && setLoaded(true));
    return () => { live = false; };
  }, [id]);

  if (!loaded || !catalog) return <div className="grid h-full place-items-center text-muted">Loading…</div>;
  if (!member) {
    return (
      <div className="grid h-full place-items-center px-6">
        <div className="text-center">
          <p className="mb-4 text-muted">This HR member could not be found.</p>
          <Link to="/people" className={buttonClasses('primary')}>Back to HR Directory</Link>
        </div>
      </div>
    );
  }
  return <MemberDetails member={member} catalog={catalog} />;
}

function MemberDetails({ member, catalog }: { member: HrMember; catalog: HrCatalog }) {
  return (
    <div className="px-4 py-3 sm:px-6 sm:py-4">
      <PageHeader
        backTo="/people"
        backLabel="Back to HR Directory"
        icon={User}
        title="Member Details"
        subtitle="ASCEND LAB SYSTEMS - HR MANAGEMENT"
        actions={<Link to={`/people/${member.id}/edit`} className={buttonClasses('primary')}><Pencil size={16} /> Edit</Link>}
      />
      <MemberOverview member={member} catalog={catalog} />
    </div>
  );
}
