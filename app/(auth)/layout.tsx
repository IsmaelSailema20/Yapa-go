import { ReactNode } from "react";
import { Leaf } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background transition-colors duration-500">
      <div className="relative hidden w-1/2 flex-col justify-center items-center overflow-hidden border-r bg-muted/20 lg:flex p-12">
        <div className="absolute top-[10%] left-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[10%] -z-10 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[80px]"></div>
        
        <div className="relative z-10 text-center space-y-8 max-w-lg">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/30">
            <Leaf className="h-12 w-12" />
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground">YapaSegura</h1>
            <p className="text-3xl font-medium leading-relaxed text-foreground/80 italic">
              "Rescatar comida es cuidar tu bolsillo y el planeta al mismo tiempo."
            </p>
            <div className="h-1.5 w-24 bg-primary/40 mx-auto rounded-full mt-6"></div>
            <p className="text-lg text-muted-foreground font-medium pt-4">
              La principal red contra el desperdicio en Ecuador.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
