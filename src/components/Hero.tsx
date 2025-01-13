import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <div 
      className="relative min-h-[80vh] flex items-center justify-center text-white px-4"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url("/Roanoke-City-Market.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-4xl mx-auto text-center animate-fade-up z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
          Become a Roanoke Region Talent Ambassador
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
          Join a community of passionate individuals shaping the future of the Roanoke Region. Connect, collaborate, and make a difference.
        </p>
        <Button size="lg" className="bg-secondary hover:bg-secondary/90">
          Join the Program <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};