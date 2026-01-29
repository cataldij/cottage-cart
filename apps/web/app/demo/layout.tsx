import Link from 'next/link';
import { DemoModeProvider } from '@/contexts/demo-mode-context';
import { DemoNav } from '@/components/demo/demo-nav';
import { DemoHeader } from '@/components/demo/demo-header';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoModeProvider isDemo={true}>
      <div className="flex min-h-screen flex-col">
        {/* Demo Banner */}
        <div className="relative z-50 overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-2 text-center text-sm font-medium text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>You&apos;re viewing a read-only demo. Changes won&apos;t be saved.</span>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 font-semibold transition-colors hover:bg-white/30"
            >
              Sign up free
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="flex flex-1">
          {/* Sidebar - same as dashboard */}
          <div className="print:hidden">
            <DemoNav />
          </div>

          {/* Main content */}
          <div className="flex flex-1 flex-col">
            <div className="print:hidden">
              <DemoHeader />
            </div>
            <main className="relative flex-1 overflow-y-auto bg-hero p-8 print:bg-white print:p-4">
              <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]" />
              <div className="relative">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </DemoModeProvider>
  );
}
