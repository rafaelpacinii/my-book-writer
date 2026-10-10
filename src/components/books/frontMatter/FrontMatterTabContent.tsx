"use client";

import React from "react";
import type { SaveFrontMatterInput } from "@/types/frontMatter";
import type { FrontMatterTab } from "./FrontMatterModalTabs";
import { HalfTitleSection } from "./HalfTitleSection";
import { TitlePageSection } from "./TitlePageSection";
import { CopyrightSection } from "./CopyrightSection";
import { DedicationEpigraphSection } from "./DedicationEpigraphSection";
import { TableOfContentsSection } from "./TableOfContentsSection";

interface Props {
  tab: FrontMatterTab;
  form: SaveFrontMatterInput;
  bookTitle: string;
  authorName: string;
  chapterCount: number;
  update: <K extends keyof SaveFrontMatterInput>(k: K, v: SaveFrontMatterInput[K]) => void;
}

export function FrontMatterTabContent({ tab, form, bookTitle, authorName, chapterCount, update }: Props) {
  if (tab === "half-title") {
    return <HalfTitleSection enabled={form.include_half_title} onToggle={(v) => update("include_half_title", v)} title={bookTitle} author={authorName} />;
  }
  if (tab === "title-page") {
    return <TitlePageSection enabled={form.include_title_page} onToggle={(v) => update("include_title_page", v)} subtitle={form.subtitle || ""} onSubtitleChange={(v) => update("subtitle", v)} publisher={form.publisher || ""} onPublisherChange={(v) => update("publisher", v)} edition={form.edition} onEditionChange={(v) => update("edition", v)} year={form.publication_year ?? ""} onYearChange={(v) => update("publication_year", v === "" ? null : v)} city={form.publication_city || ""} onCityChange={(v) => update("publication_city", v)} />;
  }
  if (tab === "copyright") {
    return <CopyrightSection enabled={form.include_copyright_page} onToggle={(v) => update("include_copyright_page", v)} copyright={form.copyright_text || ""} onCopyrightChange={(v) => update("copyright_text", v)} isbnPrint={form.isbn_print || ""} onIsbnPrintChange={(v) => update("isbn_print", v)} isbnDigital={form.isbn_digital || ""} onIsbnDigitalChange={(v) => update("isbn_digital", v)} coverDesigner={form.cover_designer || ""} onCoverChange={(v) => update("cover_designer", v)} proofreader={form.proofreader || ""} onProofreaderChange={(v) => update("proofreader", v)} layoutDesigner={form.layout_designer || ""} onLayoutChange={(v) => update("layout_designer", v)} />;
  }
  if (tab === "dedication") {
    return <DedicationEpigraphSection includeDedication={form.include_dedication} onToggleDedication={(v) => update("include_dedication", v)} dedicationText={form.dedication_text || ""} onDedicationChange={(v) => update("dedication_text", v)} includeEpigraph={form.include_epigraph} onToggleEpigraph={(v) => update("include_epigraph", v)} epigraphText={form.epigraph_text || ""} onEpigraphTextChange={(v) => update("epigraph_text", v)} epigraphAuthor={form.epigraph_author || ""} onEpigraphAuthorChange={(v) => update("epigraph_author", v)} />;
  }
  return <TableOfContentsSection enabled={form.include_table_of_contents} onToggle={(v) => update("include_table_of_contents", v)} chapterCount={chapterCount} />;
}

