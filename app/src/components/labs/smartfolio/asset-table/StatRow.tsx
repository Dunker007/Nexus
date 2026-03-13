export function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">{label}</span>
            <span className={`text-xs font-mono font-bold ${color || 'text-white'}`}>{value}</span>
        </div>
    );
}
