/**
 * The web half of the Lottie player split — deliberately empty.
 *
 * `lottie-react-native`'s web entry needs `@lottiefiles/dotlottie-react`, whose
 * player pulls a WebAssembly runtime; taking that on would trade Pawday's
 * "nothing is fetched at runtime" property for animation on a preview target.
 * The web build keeps the static icons instead, which every animated component
 * already carries as its fallback.
 */

export const LottiePlayer: any = null;
