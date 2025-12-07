import { getIncomeStreams } from '@/app/actions/income';
import IncomeDashboard from './IncomeDashboard';

export default async function IncomePage() {
    const streams = await getIncomeStreams();
    return <IncomeDashboard dbStreams={streams} />;
}
