import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { isUrgent } from '@/lib/constants';

export default function ReportRow({ report }) {
  return (
    <li>
      <Link href={`/reports/${report.id}`} className="report-row">
        <span>
          <strong>{report.title}</strong>
          {isUrgent(report) && <span className="urgent">URGENT</span>}
          <span className="muted small">#{report.id} · {report.category}</span>
        </span>
        <span className="muted">{report.location}</span>
        <StatusBadge status={report.status} />
        <span className="muted">{report._count.supports} soutien(s)</span>
        <ChevronRight size={18} aria-hidden className="muted" />
      </Link>
    </li>
  );
}
