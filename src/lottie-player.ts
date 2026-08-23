/**
 * The Lottie player, resolved per platform.
 *
 * This indirection exists because Metro resolves imports at *bundle* time, so
 * a `try/catch` around `require('lottie-react-native')` cannot save a platform
 * where the module will not build — the bundle simply fails. Splitting the
 * import into a `.ts` / `.web.ts` pair is the only thing that actually keeps
 * the dependency off the web graph.
 *
 * Native gets the real player. See `lottie-player.web.ts` for the other half.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const LottiePlayer: any = require('lottie-react-native').default;
