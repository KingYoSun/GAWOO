import { app, shell } from "electron";
import path from "path";
import i18n from "i18next";
import dialog from "./dialog";

const issueTitle = (e) => {
  const es = e.stack ? e.stack.toString() : "unknown error, no stacktrace";
  const firstLine = es.substr(0, Math.min(es.indexOf("\n"), 72));
  return `[gui error report] ${firstLine}`;
};

const issueTemplate = (
  e
) => `👉️ Please describe what you were doing when this error happened.
**Specifications**
- **OS**: ${process.platform}
- **GAWOO Version**: ${app.getVersion()}
- **Electron Version**: ${process.versions.electron}
- **Chrome Version**: ${process.versions.chrome}
**Error**
\`\`\`
${e.stack}
\`\`\`
`;

let hasErrored = false;

const generateErrorIssueUrl = (e) =>
  `https://github.com/ipfs-shipyard/ipfs-desktop/issues/new?labels=kind%2Fbug%2C+need%2Ftriage&template=bug_report.md&title=${encodeURI(
    issueTitle(e)
  )}&body=${encodeURI(issueTemplate(e))}`.substring(0, 1999);

function criticalErrorDialog(e) {
  if (hasErrored) return;
  hasErrored = true;

  const option = dialog({
    title: i18n.t("gawooHasShutdownDialog.title"),
    message: i18n.t("gawooHasShutdownDialog.message"),
    type: "error",
    buttons: [i18n.t("restartGAWOO"), i18n.t("close")],
  });

  if (option === 0) {
    app.relaunch();
  } else if (option === 2) {
    shell.openExternal(generateErrorIssueUrl(e));
  }

  app.exit(1);
}

// Shows a recoverable error dialog with the default title and message.
// Passing an options object alongside the error can be used to override
// the title and message.
function recoverableErrorDialog(e, options) {
  const cfg = {
    title: i18n.t("recoverableErrorDialog.title"),
    message: i18n.t("recoverableErrorDialog.message"),
    type: "error",
    buttons: [i18n.t("close"), i18n.t("reportTheError"), i18n.t("openLogs")],
  };

  if (options) {
    if (options.title) {
      cfg.title = options.title;
    }

    if (options.message) {
      cfg.message = options.message;
    }
  }

  const option = dialog(cfg);

  if (option === 1) {
    shell.openExternal(generateErrorIssueUrl(e));
  } else if (option === 2) {
    shell.openPath(path.join(app.getPath("userData"), "combined.log"));
  }
}

export { criticalErrorDialog, recoverableErrorDialog, generateErrorIssueUrl };
