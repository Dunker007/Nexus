import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import PageLayout from '../../components/PageLayout';

interface Props {
  name: string;
  icon: string;
  category: string;
  description?: string;
}

export function LabStub({ name, icon, category, description }: Props) {
  const navigate = useNavigate();
  return (
    <PageLayout color="cyan" noPadding={false}>
      <div className="flex flex-col items-center justify-center h-full gap-8 py-24">
        <div className="text-6xl">{icon}</div>
        <div className="text-center space-y-2">
          <div style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(6,182,212,0.5)', textTransform: 'uppercase', letterSpacing: '0.35em' }}>{category}</div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{name}</h1>
          {description && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', maxWidth: '420px' }}>{description}</p>}
        </div>
        <div className="flex items-center gap-3 px-6 py-3 border border-white/10 bg-white/[0.03]">
          <Construction size={14} style={{ color: 'rgba(245,158,11,0.7)' }} />
          <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.25em' }}>Under Construction</span>
        </div>
        <button onClick={() => navigate('/labs')}
          className="flex items-center gap-2 text-white/30 hover:text-white transition-colors"
          style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          <ArrowLeft size={12} /> Back to Labs
        </button>
      </div>
    </PageLayout>
  );
}
