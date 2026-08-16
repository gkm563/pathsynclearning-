import type * as React from "react";

declare module "react" {
  interface CSSProperties {
    /** Legacy custom keys used in PathEd inline styles (ignored by browsers) */
    justify?: string | number;
    lgLayout?: string | number;
    mdLayout?: string | number;
    items?: string | number;
    justifyRules?: string | number;
    responsiveLayout?: string | number;
    textAlignment?: string | number;
    [key: `--${string}`]: string | number | undefined;
  }
}

export {};
