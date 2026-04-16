import { listDesignStyles, getDesignStyle } from "@root/src/design-styles.js";

export function listStyles() {
  return listDesignStyles();
}

export function getStyle(styleId: string) {
  return getDesignStyle(styleId);
}
