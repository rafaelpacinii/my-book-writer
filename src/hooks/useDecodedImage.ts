"use client";

import { useMemo } from "react";
import { createResource } from "@/lib/data/resource";
import { useResource } from "@/hooks/useResource";

export function useDecodedImage(src: string) {
  const resource = useMemo(() => createResource(async () => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return src;
  }), [src]);
  return { ...useResource(resource), fail: resource.fail };
}
