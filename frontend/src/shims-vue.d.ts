/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.svg" {
  // It's really a string, precisely a resolved path pointing to the image file
  const filePath: string;

  export default filePath;
}

declare module "*.json" {
  const value: Record<string, any>;
  export default value;
}
