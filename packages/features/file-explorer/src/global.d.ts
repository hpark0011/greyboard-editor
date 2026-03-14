import type { GreyboardApi } from "@greyboard/core/ipc";

declare global {
  interface Window {
    greyboard: GreyboardApi;
  }
}
