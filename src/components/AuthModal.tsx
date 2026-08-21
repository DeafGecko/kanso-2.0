import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider, appleProvider } from '../firebase';

export function AuthModal({ onClose }: { onClose: () => void }) {
      const handleGoogleLogin = async () => {
            try {
                  await signInWithPopup(auth, googleProvider);
                  onClose();
            } catch (error) {
                  console.error("Google Login Error", error);
            }
      };

      const handleGithubLogin = async () => {
            try {
                  await signInWithPopup(auth, githubProvider);
                  onClose();
            } catch (error) {
                  console.error("GitHub Login Error", error);
            }
      };

      const handleAppleLogin = async () => {
            try {
                  await signInWithPopup(auth, appleProvider);
                  onClose();
            } catch (error) {
                  console.error("Apple Login Error", error);
            }
            };

      return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 select-none">
                  <div className="bg-[#1c1c1e]/90 border border-white/10 p-8 rounded-[2.5rem] w-96 flex flex-col gap-4 shadow-2xl text-white">
                        <h2 className="text-xl font-semibold font-serif text-center mb-2">Sign in to Kanso</h2>

                  <button 
                        onClick={handleGoogleLogin}
                        className="w-full bg-white/10 hover:bg-white/20 transition py-3 rounded-2xl text-xs font-medium border border-white/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                        Continue with Google
                  </button>

                  <button 
                        onClick={handleAppleLogin}
                        className="w-full bg-white/10 hover:bg-white/20 transition py-3 rounded-2xl text-xs font-medium border border-white/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                        Continue with Apple
                  </button>

                  <button 
                        onClick={handleGithubLogin}
                        className="w-full bg-white/10 hover:bg-white/20 transition py-3 rounded-2xl text-xs font-medium border border-white/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                        Continue with GitHub
                  </button>

                  <button 
                        onClick={onClose}
                        className="mt-4 text-xs text-zinc-400 hover:text-white transition text-center"
                  >
                        Cancel / Skip for now
                  </button>
                  </div>
            </div>
      );
}