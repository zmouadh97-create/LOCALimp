import { MapPin } from 'lucide-react';

export default function Logo({ dark }) {
  return (
    <div className="logo">
      <span className="logo-icon"><MapPin size={26} aria-hidden /></span>
      <span>
        <span className={dark ? 'logo-name light' : 'logo-name'}>Local<span className="blue">Impact</span></span>
        <span className="logo-tag">AGIR, ENSEMBLE</span>
      </span>
    </div>
  );
}
