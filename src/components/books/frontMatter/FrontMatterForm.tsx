"use client";

import { useState } from "react";
import { BookSectionCard, BookSectionColumns } from "@/components/books/shared/BookSectionPage";
import { BookSectionTabs } from "@/components/books/shared/BookSectionTabs";
import { SettingsFooter } from "@/components/books/settings/SettingsFooter";
import type { useBookFrontMatterPage } from "@/hooks/useBookFrontMatterPage";
import { FrontMatterTabContent } from "@/components/books/frontMatter/FrontMatterTabContent";
import { FrontMatterSummary } from "@/components/books/frontMatter/FrontMatterSummary";
import { FRONT_MATTER_SECTIONS, type FrontMatterTab } from "@/components/books/frontMatter/frontMatterSections";

export function FrontMatterForm({ state }: { state: ReturnType<typeof useBookFrontMatterPage> }) {
  const [tab, setTab] = useState<FrontMatterTab>("half-title");
  if (!state.form || !state.book) return null;
  return (
    <form onSubmit={(event) => { event.preventDefault(); void state.save(); }} className="flex flex-col gap-6">
      <BookSectionColumns>
        <BookSectionCard className="lg:col-span-7">
          <h2 className="mb-5 text-lg font-bold text-foreground">Conteúdo das páginas iniciais</h2>
          <BookSectionTabs items={FRONT_MATTER_SECTIONS} value={tab} onChange={setTab}
            label="Seções das páginas iniciais" panelId="front-matter-panel" />
          <fieldset disabled={state.isSaving}>
            <div id="front-matter-panel" role="tabpanel" aria-labelledby={`front-matter-panel-${tab}`} tabIndex={0}>
              <FrontMatterTabContent tab={tab} form={state.form} update={state.update}
                bookTitle={state.book.title} authorName={state.book.author_name} chapterCount={state.chapterCount} />
            </div>
          </fieldset>
          {state.error && <p role="alert" className="mt-4 text-sm text-danger">{state.error}</p>}
        </BookSectionCard>
        <FrontMatterSummary bookId={state.book.id} form={state.form} />
      </BookSectionColumns>
      <SettingsFooter onCancel={state.navigation.cancel} isSubmitting={state.isSaving} isDirty={state.isDirty} />
    </form>
  );
}
