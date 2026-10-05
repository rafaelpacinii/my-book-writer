import React from "react";
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-xs flex flex-col gap-5">
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
        </div>

        <div className="lg:col-span-5 bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-xs">
          <CoverPreview
            coverUrl={s.coverUrl}
            onCoverChange={s.setCoverUrl}
          />
        </div>
      </div>

      <SettingsFooter onCancel={s.handleCancel} isSubmitting={s.isSubmitting} isDirty={s.isDirty} />
    </form>
  );
}
