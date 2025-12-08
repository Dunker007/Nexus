export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050508]">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-spin reverse"></div>
                    <div className="absolute inset-4 border-b-2 border-yellow-500 rounded-full animate-spin"></div>
                </div>
                <h2 className="text-cyan-400 font-bold animate-pulse">Initializing Nexus...</h2>
            </div>
        </div>
    );
}
