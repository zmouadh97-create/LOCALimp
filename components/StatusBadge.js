import { STATUSES } from '@/lib/constants';

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{STATUSES[status]}</span>;
}
