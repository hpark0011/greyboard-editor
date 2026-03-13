import { contextBridge, ipcRenderer } from "electron";
import { api } from "./api";

contextBridge.exposeInMainWorld("greyboard", api);
