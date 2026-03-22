// Firebase functionality has been removed for builds without the
// firebase package.  Export placeholders so other modules that import
// `auth`/`googleProvider` still work without bundler errors.

export const auth = null;
export const googleProvider = null;

