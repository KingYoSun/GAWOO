import { join } from "path";
import { ipcMain } from "electron";
import i18next from "i18next";
import ICU from "i18next-icu";
import Backend from "i18next-fs-backend";
import store from "./store";

const i18n = async () => {
  await i18next
    .use(ICU)
    .use(Backend)
    .init({
      lng: store.get("language"),
      fallbackLng: {
        "zh-Hans": ["zh-CN", "en"],
        "zh-Hant": ["zh-TW", "en"],
        zh: ["zh-CN", "en"],
        default: ["en"],
      },
      backend: {
        loadPath: join(__dirname, "../resources/locales/{{lng}}.json"),
      },
    });

  ipcMain.on("updateLanguage", async (_, lang) => {
    if (lang === store.get("language")) {
      return;
    }

    store.set("language", lang);

    await i18next.changeLanguage(lang);
    ipcMain.emit("languageUpdated", lang);
  });
};

export default i18n;
