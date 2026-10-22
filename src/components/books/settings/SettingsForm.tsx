import React from "react";
import { BookSectionCard, BookSectionColumns } from "@/components/books/shared/BookSectionPage";
import { CoverPreview } from "@/components/books/new/CoverPreview";
import { SettingsInfoFields } from "./SettingsInfoFields";
import { SettingsLayoutFields } from "./SettingsLayoutFields";
import { SettingsDangerZone } from "./SettingsDangerZone";
import { SettingsFooter } from "./SettingsFooter";
import type { useBookSettings } from "./useBookSettings";

interface Props {
  settings: ReturnType<typeof useBookSettings>;
}

export function SettingsForm({ settings: s }: Props) {
  return (
    <form onSubmit={s.handleSave} className="flex flex-col gap-6">
      <BookSectionColumns>
        <BookSectionCard className="lg:col-span-7 flex flex-col gap-5">
          <SettingsInfoFields
            title={s.title} setTitle={s.setTitle} titleError={s.titleError}
            author={s.author} setAuthor={s.setAuthor}
            formatId={s.formatId} setFormatId={s.setFormatId} formats={s.formats}
            fontId={s.fontId} setFontId={s.setFontId} fonts={s.fonts}
          />
          <SettingsLayoutFields
            fontSize={s.fontSize} setFontSize={s.setFontSize}
            lineHeight={s.lineHeight} setLineHeight={s.setLineHeight}
            marginTopMm={s.marginTopMm} setMarginTopMm={s.setMarginTopMm}
            marginBottomMm={s.marginBottomMm} setMarginBottomMm={s.setMarginBottomMm}
            marginLeftMm={s.marginLeftMm} setMarginLeftMm={s.setMarginLeftMm}
            marginRightMm={s.marginRightMm} setMarginRightMm={s.setMarginRightMm}
          />
          {s.layoutError && (
            <p role="alert" className="text-sm text-danger">{s.layoutError}</p>
          )}
          <SettingsDangerZone onDeleteClick={() => s.setIsDeleteModalOpen(true)} />
        </BookSectionCard>

        <BookSectionCard className="lg:col-span-5">
          <CoverPreview
            coverUrl={s.coverUrl}
            onCoverChange={s.setCoverUrl}
          />
        </BookSectionCard>
      </BookSectionColumns>

      <SettingsFooter onCancel={s.handleCancel} isSubmitting={s.isSubmitting} isDirty={s.isDirty} />
    </form>
  );
}
