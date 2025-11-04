import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

type TabKey = "login" | "signup";

interface AuthProps {
  defaultTab?: TabKey;
  onAuthenticated?: () => void;
}

export function Auth({ defaultTab = "signup", onAuthenticated }: AuthProps) {
  const [active, setActive] = useState<TabKey>(defaultTab);

  // shared state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // login state
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  return (
    <Card className="grid grid-cols-1 md:grid-cols-2 min-h-screen overflow-hidden rounded-none border-0 shadow-none md:divide-x md:divide-gray-200">
      {/* Left: Logo + Form (aligned similar to reference) */}
      <div className="py-8 px-6 md:py-16 md:px-16 flex flex-col min-h-screen md:min-h-0">
        {/* Logo */}
        <div className="mb-12">
          <div className="h-8 w-20 rounded bg-gray-900/90 text-white flex items-center justify-center text-sm font-semibold">
            Logo
          </div>
        </div>

        <div className="flex-1">
          <div className="max-w-md w-full mx-auto">
            {/* Segmented tabs (fixed at top within left column) */}
            <div className="mb-8 sticky top-6 z-10 w-max flex items-center gap-2 rounded-full bg-indigo-50/80 ring-1 ring-indigo-100 p-1 backdrop-blur supports-[backdrop-filter]:bg-indigo-50/60">
              <Button
                variant="ghost"
                onClick={() => setActive("login")}
                className={
                  (active === "login"
                    ? "bg-indigo-100 text-gray-900 shadow-sm "
                    : "text-gray-700 hover:text-gray-900 ") +
                  "rounded-full px-4 py-2 focus-visible:ring-indigo-400"
                }
                aria-selected={active === "login"}
                role="tab"
              >
                <span className="material-symbols-outlined mr-2" aria-hidden>
                  login
                </span>{" "}
                Login
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActive("signup")}
                className={
                  (active === "signup"
                    ? "bg-indigo-100 text-gray-900 shadow-sm "
                    : "text-gray-700 hover:text-gray-900 ") +
                  "rounded-full px-4 py-2 focus-visible:ring-indigo-400"
                }
                aria-selected={active === "signup"}
                role="tab"
              >
                <span className="material-symbols-outlined mr-2" aria-hidden>
                  person_add
                </span>{" "}
                Sign up
              </Button>
            </div>

             {active === "login" ? (
              <form
                className="space-y-5"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  onAuthenticated?.();
                }}
              >
                 {signupSuccess && (
                   <Alert variant="success">
                     <CheckCircle2 className="h-5 w-5 mt-0.5" aria-hidden />
                     <div>
                       <AlertTitle>Success! Your account has been created</AlertTitle>
                       <AlertDescription>
                         You can now log in using your email and password.
                       </AlertDescription>
                     </div>
                   </Alert>
                 )}
                <div >
                  <Label htmlFor="login-email" className="mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-2 my-auto rounded p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 rounded-md">
                  Log in
                </Button>
              </form>
            ) : (
               <form
                className="space-y-5"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!passwordsMatch) return;
                   setSignupSuccess(true);
                   setActive("login");
                }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
                  Welcome to Aroha
                </h1>

                 <div>
                   <Label htmlFor="signup-email" className="mb-2 block">
                     Email
                   </Label>
                   <Input
                     id="signup-email"
                     name="email"
                     type="email"
                     autoComplete="email"
                     required
                     value={signupEmail}
                     onChange={(e) => setSignupEmail(e.target.value)}
                     placeholder="jane@example.com"
                     aria-describedby="signup-email-desc"
                   />
                   <p id="signup-email-desc" className="sr-only">
                     Enter your email address
                   </p>
                 </div>
                <div>
                  <Label htmlFor="password" className="mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-2 my-auto rounded p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="mb-2 block">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      aria-invalid={password.length > 0 && !passwordsMatch}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-2 my-auto rounded p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                     <span className="material-symbols-outlined" aria-hidden>
                        {showConfirm ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={
                      passwordsMatch ? "text-emerald-600" : "text-gray-400"
                    }
                    aria-hidden
                  >
                    <span className="material-symbols-outlined align-middle">
                      {passwordsMatch
                        ? "check_circle"
                        : "radio_button_unchecked"}
                    </span>
                  </span>
                  <span
                    className={
                      passwordsMatch ? "text-emerald-700" : "text-gray-600"
                    }
                  >
                    {passwordsMatch ? "Looks good!" : "Passwords must match"}
                  </span>
                </div>
                 <Button
                  type="submit"
                  className="w-full h-11 rounded-md"
                   disabled={!passwordsMatch || signupEmail.trim().length === 0}
                   aria-disabled={
                     !passwordsMatch || signupEmail.trim().length === 0
                   }
                >
                  Continue
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right: Illustration image */}
      <div className="hidden md:block bg-[#efece7] relative">
        <img
          src="/cover2.png"
          alt="Welcome illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </Card>
  );
}
