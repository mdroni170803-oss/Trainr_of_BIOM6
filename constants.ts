
import { AppData } from "./types";

export const APP_VERSION = "1.0.0";
export const APP_CREDITS = {
  title: "App For Trainer of BIOM",
  author: "Md Roni (20th bach)",
  messenger: "@mdroni1702"
};

export const INITIAL_DATA: AppData = {
  admins: [], // Default admin removed as requested
  courses: [], // Also cleared default course for a clean slate
  sedulous: [] 
};
