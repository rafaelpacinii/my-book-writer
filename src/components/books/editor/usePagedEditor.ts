"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PagedEditorProps } from "@/types/editor";
import { getPhysicalPageDimensions } from "@/utils/bookPagination";
import {
  measurePagedContent, getSelectionPage, preventBlankPageInput, removeRedundantBlankPages,
} from "@/lib/editor/pagedLayout";
import { usePagedZoom } from "./usePagedZoom";

export function usePagedEditor(props: PagedEditorProps) {
  const { contentRef, onContentChange } = props;
  const containerRef = useRef<HTMLElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const dim = useMemo(
    () => getPhysicalPageDimensions(props.book, props.format, props.font),
    [props.book, props.format, props.font],
  );
  const zoom = usePagedZoom(containerRef, dim, props.isFitMode, props.onFitModeChange);

  const updateLayout = useCallback((followSelection = false, cleanEmptyPages = false) => {
    const flow = flowRef.current;
    const content = contentRef.current;
    if (!flow || !content) return;
    if (cleanEmptyPages && removeRedundantBlankPages(flow, content, dim.widthPx)) {
      onContentChange(content.innerHTML);
    }
    const count = measurePagedContent(flow, content, dim.widthPx);
    setTotalPages(count);
    const selectedPage = followSelection ? getSelectionPage(flow, content, dim.widthPx) : null;
    setCurrentPage((page) => Math.max(1, Math.min(selectedPage ?? page, count)));
    flow.parentElement?.scrollTo(0, 0);
  }, [contentRef, onContentChange, dim.widthPx]);

  useLayoutEffect(() => {
    const flow = flowRef.current;
    if (!flow) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => updateLayout(false, true));
    };
    const observer = new MutationObserver(schedule);
    observer.observe(flow, { childList: true, subtree: true, characterData: true, attributes: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(flow);
    document.fonts.addEventListener("loadingdone", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [updateLayout, props.initialContent, props.title, dim]);

  useLayoutEffect(() => {
    const follow = () => updateLayout(true);
    document.addEventListener("selectionchange", follow);
    const content = props.contentRef.current;
    const beforeInput = (event: InputEvent) => {
      if (flowRef.current && content) preventBlankPageInput(event, flowRef.current, content, dim.widthPx);
    };
    content?.addEventListener("beforeinput", beforeInput);
    return () => {
      document.removeEventListener("selectionchange", follow);
      content?.removeEventListener("beforeinput", beforeInput);
    };
  }, [updateLayout, props.contentRef, dim.widthPx]);

  const handleContentChange = (html: string) => {
    props.onContentChange(html);
    updateLayout(true, true);
  };

  return {
    containerRef, flowRef, dim, currentPage, totalPages, ...zoom,
    handlePageChange: (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
    handleContentChange,
  };
}
