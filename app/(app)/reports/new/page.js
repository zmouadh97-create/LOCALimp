import { requireUser } from '@/lib/auth';
import PageTitle from '@/components/PageTitle';
import ReportForm from '@/components/ReportForm';

export default async function NewReportPage() {
  await requireUser();
  return (
    <>
      <PageTitle eyebrow="SIGNALER" title="Nouveau signalement"
        text="Décrivez le problème le plus précisément possible. Les signalements similaires vous seront proposés." />
      <ReportForm />
    </>
  );
}
