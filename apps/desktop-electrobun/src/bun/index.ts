// Electrobun main process — runs under Bun, owns the window lifecycle.
import { BrowserWindow } from "electrobun/bun";

new BrowserWindow({
  title: "Turbo Showcase (Electrobun)",
  url: "views://main/index.html",
});
