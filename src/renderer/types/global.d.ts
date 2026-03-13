import type { GreyboardApi } from "../../preload/api";

declare global {
  interface Window {
    greyboard: GreyboardApi;
  }
}
