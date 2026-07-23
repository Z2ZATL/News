import { article } from "./article";
import { localizedBody, localizedString, localizedText } from "./localized";
import { author, category, project, settings } from "./support";

export const schemaTypes = [
  localizedString,
  localizedText,
  localizedBody,
  article,
  project,
  author,
  category,
  settings,
];
