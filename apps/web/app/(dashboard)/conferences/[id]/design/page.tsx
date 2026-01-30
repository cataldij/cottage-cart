'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { DesignSystemProvider } from '@/contexts/design-system-context';
import { DesignEditor } from '@/components/design-system/design-editor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';

interface PageSection {
  id: string;
  sectionType: string;
  config: Record<string, unknown>;
  isVisible: boolean;
}

export default function DesignStudioPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [conference, setConference] = useState<any>(null);
  const [initialTokens, setInitialTokens] = useState<any>(null);
  const [pageSections, setPageSections] = useState<PageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      // Load conference
      const { data: conf } = await supabase
        .from('conferences')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!conf) {
        router.push('/dashboard');
        return;
      }

      setConference(conf);

      // Load design tokens
      const { data: tokens } = await supabase
        .from('design_tokens')
        .select('tokens')
        .eq('conference_id', params.id)
        .eq('is_active', true)
        .single();

      if (tokens?.tokens) {
        setInitialTokens(tokens.tokens);
      }

      // Load page sections
      const { data: sections } = await supabase
        .from('page_sections')
        .select('*')
        .eq('conference_id', params.id)
        .eq('page_type', 'home')
        .order('section_order');

      if (sections) {
        setPageSections(
          sections.map((s: any) => ({
            id: s.id,
            sectionType: s.section_type,
            config: s.config,
            isVisible: s.is_visible,
          }))
        );
      }

      setIsLoading(false);
    }

    loadData();
  }, [params.id, supabase, router]);

  const handlePageSectionsChange = async (sections: PageSection[]) => {
    setPageSections(sections);

    // Save to database
    await supabase.from('page_sections').delete().eq('conference_id', params.id).eq('page_type', 'home');

    if (sections.length > 0) {
      await supabase.from('page_sections').insert(
        sections.map((section, index) => ({
          conference_id: params.id,
          page_type: 'home',
          section_type: section.sectionType,
          section_order: index,
          config: section.config,
          is_visible: section.isVisible,
        }))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/conferences/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Design Studio</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {conference?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/c/${conference?.slug}`} target="_blank">
              Preview Site
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/conferences/${params.id}/settings`}>
              Classic Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <DesignSystemProvider
          conferenceId={params.id}
          initialTokens={initialTokens}
        >
          <DesignEditor conferenceId={params.id} />
        </DesignSystemProvider>
      </div>
    </div>
  );
}
