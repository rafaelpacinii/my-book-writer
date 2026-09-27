"use client";

import { AppShell } from "@/components/shared/AppShell";
import { NewBookHeader } from "./NewBookHeader";
import { BookInfoFields } from "./BookInfoFields";
import { LayoutSettingsFields } from "./LayoutSettingsFields";
import { CoverPreview } from "./CoverPreview";
import { NewBookFooter } from "./NewBookFooter";
import { useNewBookForm } from "./useNewBookForm";

export function Main() {
  const form = useNewBookForm();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto pb-12">
        <NewBookHeader />

        <form onSubmit={form.handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-xs flex flex-col gap-5">
              <BookInfoFields
                title={form.title}
                setTitle={form.setTitle}
                titleError={form.titleError}
                author={form.author}
                setAuthor={form.setAuthor}
                formatId={form.formatId}
                setFormatId={form.setFormatId}
                formats={form.formats}
                fontId={form.fontId}
                setFontId={form.setFontId}
                fonts={form.fonts}
              />
              <LayoutSettingsFields
                fontSize={form.fontSize}
                setFontSize={form.setFontSize}
                lineHeight={form.lineHeight}
                setLineHeight={form.setLineHeight}
                marginMm={form.marginMm}
                setMarginMm={form.setMarginMm}
              />
            </div>

            <div className="lg:col-span-5 bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-xs">
              <CoverPreview />
            </div>
          </div>

          <NewBookFooter
            onCancel={() => form.router.back()}
            isSubmitting={form.isSubmitting}
          />
        </form>
      </div>
    </AppShell>
  );
}
