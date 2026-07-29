import type { WebContainer as WebContainerType } from "@webcontainer/api";

// WebContainer can only be booted once per page/tab. Keep a module-level
// singleton promise so React re-renders / Strict Mode double effects reuse it.
let bootPromise: Promise<WebContainerType> | null = null;

export async function getWebContainer(): Promise<WebContainerType> {
  if (!bootPromise) {
    const { WebContainer } = await import("@webcontainer/api");
    bootPromise = WebContainer.boot({ coep: "require-corp" });
  }
  return bootPromise;
}
