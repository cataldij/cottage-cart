'use client';

import Link from 'next/link';
import { DesignSystemProvider } from '@/contexts/design-system-context';
import { DesignEditor } from '@/components/design-system/design-editor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { DEMO_DESIGN_TOKENS, DEMO_CONFERENCE } from '@/lib/demo-data';

export default function DemoDesignStudioPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header - identical to real design page */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/demo">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Design Studio</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {DEMO_CONFERENCE.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/demo/preview" target="_blank">
              Preview Site
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/demo/settings">
              Classic Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content - using real DesignEditor with demo mode */}
      <div className="flex-1 overflow-hidden p-6">
        <DesignSystemProvider
          conferenceId="demo"
          initialTokens={DEMO_DESIGN_TOKENS as any}
          demoMode={true}
        >
          <DesignEditor conferenceId="demo" />
        </DesignSystemProvider>
      </div>
    </div>
  );
}
