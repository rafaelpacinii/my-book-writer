import { BookSeriesSelect } from "@/components/shared/BookSeriesSelect";
import { BookInfoFields } from "@/components/books/new/BookInfoFields";
import { LayoutSettingsFields } from "@/components/books/new/LayoutSettingsFields";
import { CoverPreview } from "@/components/books/new/CoverPreview";
import { NewBookFooter } from "@/components/books/new/NewBookFooter";
import type { useNewBookForm } from "@/hooks/useNewBookForm";

export function NewBookForm({ form }: { form: ReturnType<typeof useNewBookForm> }) {
  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-6" aria-busy={form.isSubmitting}>
      <fieldset disabled={form.isSubmitting} className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-5 rounded-xl border border-border bg-surface p-6 lg:col-span-7">
          <BookInfoFields
            title={form.title} setTitle={form.setTitle} titleError={form.titleError}
            author={form.author} setAuthor={form.setAuthor}
            formatId={form.formatId} setFormatId={form.setFormatId} formats={form.formats}
            fontId={form.fontId} setFontId={form.setFontId} fonts={form.fonts}
          />
          <BookSeriesSelect series={form.seriesData.series} value={form.seriesId} onChange={form.setSeriesId}
            isLoading={form.seriesData.isLoading} error={form.seriesData.error}
            onRetry={() => { void form.seriesData.refreshSeries(); }} />
          <LayoutSettingsFields
            fontSize={form.fontSize} setFontSize={form.setFontSize}
            lineHeight={form.lineHeight} setLineHeight={form.setLineHeight}
            marginMm={form.marginMm} setMarginMm={form.setMarginMm}
          />
          {(form.layoutError || form.submitError) && (
            <p role="alert" className="text-sm text-danger">{form.layoutError || form.submitError}</p>
          )}
        </div>
        <div className="min-w-0 rounded-xl border border-border bg-surface p-6 lg:col-span-5">
          <CoverPreview coverUrl={form.coverUrl} onCoverChange={form.setCoverUrl} />
        </div>
      </fieldset>
      <NewBookFooter onCancel={() => form.router.push("/library")} isSubmitting={form.isSubmitting} />
    </form>
  );
}
