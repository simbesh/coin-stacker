import SplashScreen from "@/components/ConstructionSplashScreen";
import ClientOnly from "@/components/ClientOnly";

export default function HomePage() {
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <ClientOnly>
                    <SplashScreen isLoading={true} />
                </ClientOnly>
            </div>
        </main>
    );
}
